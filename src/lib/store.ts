"use client";

import { createClient, type Session, type User } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { seed } from "./seed";
import type { Data } from "./types";

/**
 * Armazenamento. Com as variáveis do Supabase no .env.local, os dados ficam
 * na nuvem (sincronizam entre aparelhos). Sem elas, ficam só no navegador.
 * As telas usam apenas useData / update / getData / replace.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * "Manter conectado": a sessão fica no localStorage (sobrevive a fechar o app).
 * Desmarcado, fica no sessionStorage e some ao fechar a aba.
 */
const MANTER = "dtv:manter";
const naoNavegador = () => typeof window === "undefined";
const armazenamento = {
  getItem: (k: string) => (naoNavegador() ? null : (localStorage.getItem(k) ?? sessionStorage.getItem(k))),
  setItem: (k: string, v: string) => {
    if (naoNavegador()) return;
    (localStorage.getItem(MANTER) === "0" ? sessionStorage : localStorage).setItem(k, v);
  },
  removeItem: (k: string) => {
    if (naoNavegador()) return;
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  },
};

export const supabase =
  URL && CHAVE
    ? createClient(URL, CHAVE, {
        auth: { storage: armazenamento, persistSession: true, autoRefreshToken: true },
      })
    : null;

const LOCAL = "crm:v1";
const TABELA = "crm_data";

export type Estado = "carregando" | "sem-login" | "pronto" | "erro";
export type Sync = "ok" | "salvando" | "erro";

export interface Snap {
  data: Data | null;
  estado: Estado;
  sync: Sync;
  email: string | null;
}

const SERVIDOR: Snap = { data: null, estado: "carregando", sync: "ok", email: null };
let snap: Snap = SERVIDOR;
let userId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let salvando = false;

const listeners = new Set<() => void>();

function set(p: Partial<Snap>) {
  snap = { ...snap, ...p };
  listeners.forEach((l) => l());
}

/* ---------- modo local ---------- */

function lerLocal(): Data | null {
  const raw = localStorage.getItem(LOCAL);
  return raw ? (JSON.parse(raw) as Data) : null;
}

function salvarLocal(d: Data): Data {
  localStorage.setItem(LOCAL, JSON.stringify(d));
  return d;
}

/* ---------- modo Supabase ---------- */

async function carregar(user: User) {
  userId = user.id;
  set({ estado: "carregando", email: user.email ?? null });
  const { data: row, error } = await supabase!.from(TABELA).select("data").eq("user_id", user.id).maybeSingle();
  if (error) return set({ estado: "erro" });

  if (row) return set({ data: row.data as Data, estado: "pronto" });

  // Primeiro acesso: leva o que já estava neste navegador (sem leads de exemplo).
  const local = lerLocal();
  const nome = String(user.user_metadata?.nome ?? "").trim().split(/\s+/)[0] ?? "";
  const inicial = local ? { ...local, leads: local.leads.filter((l) => !l.exemplo) } : seed(nome);
  const { error: e2 } = await supabase!.from(TABELA).insert({ user_id: user.id, data: inicial });
  if (e2) return set({ estado: "erro" });
  set({ data: inicial, estado: "pronto" });
}

/** Busca de novo ao voltar para o app (ex.: editou no computador, abriu no celular). */
async function recarregar() {
  if (!userId || timer || salvando) return;
  const { data: row } = await supabase!.from(TABELA).select("data").eq("user_id", userId).maybeSingle();
  if (row && !timer && !salvando) set({ data: row.data as Data });
}

async function enviar() {
  timer = undefined;
  if (!userId || !snap.data) return;
  salvando = true;
  const { error } = await supabase!
    .from(TABELA)
    .update({ data: snap.data, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  salvando = false;
  if (!timer) set({ sync: error ? "erro" : "ok" });
}

function aoMudarSessao(session: Session | null) {
  if (!session) {
    userId = null;
    return set({ data: null, estado: "sem-login", email: null });
  }
  if (session.user.id !== userId) void carregar(session.user);
}

/* ---------- inicialização ---------- */

let iniciado = false;

function iniciar() {
  if (iniciado) return;
  iniciado = true;

  if (!supabase) {
    set({ data: lerLocal() ?? salvarLocal(seed()), estado: "pronto" });
    window.addEventListener("storage", (e) => {
      if (e.key === LOCAL) set({ data: lerLocal() });
    });
    return;
  }

  // O Supabase recomenda não chamar a API dentro do callback; por isso o setTimeout.
  supabase.auth.onAuthStateChange((_evento, session) => {
    setTimeout(() => aoMudarSessao(session), 0);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void recarregar();
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  iniciar();
  return () => listeners.delete(l);
}

/* ---------- API usada pelas telas ---------- */

export function useSnap(): Snap {
  return useSyncExternalStore(subscribe, () => snap, () => SERVIDOR);
}

/** null enquanto carrega (ou sem login). */
export function useData(): Data | null {
  return useSnap().data;
}

export function getData(): Data {
  return snap.data!;
}

export function update(fn: (d: Data) => Data) {
  if (!snap.data) return;
  const data = fn(snap.data);
  if (!supabase) return set({ data: salvarLocal(data) });

  set({ data, sync: "salvando" });
  clearTimeout(timer);
  timer = setTimeout(enviar, 500);
}

export function replace(d: Data) {
  update(() => d);
}

export async function entrar(email: string, senha: string, manter: boolean) {
  localStorage.setItem(MANTER, manter ? "1" : "0");
  return supabase!.auth.signInWithPassword({ email, password: senha });
}

export async function cadastrar(nome: string, email: string, senha: string, manter: boolean) {
  localStorage.setItem(MANTER, manter ? "1" : "0");
  return supabase!.auth.signUp({ email, password: senha, options: { data: { nome } } });
}

export async function sair() {
  clearTimeout(timer);
  if (timer) await enviar();
  await supabase?.auth.signOut();
}

export function uid(): string {
  return crypto.randomUUID();
}
