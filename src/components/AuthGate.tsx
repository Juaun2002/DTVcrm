"use client";

import { useState } from "react";
import { campo } from "@/components/LeadForm";
import { Carregando } from "@/components/Nav";
import { entrar, supabase, useSnap } from "@/lib/store";

/** Mostra o login quando o Supabase está configurado e não há sessão. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { estado, sync } = useSnap();
  if (!supabase) return children;

  if (estado === "sem-login") return <Login />;
  if (estado === "erro")
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-stone-600">Não foi possível carregar seus dados.</p>
        <button onClick={() => location.reload()} className="mt-4 font-semibold text-emerald-700">
          Tentar de novo
        </button>
      </main>
    );
  if (estado === "carregando")
    return (
      <main className="mx-auto max-w-md px-4">
        <Carregando />
      </main>
    );

  return (
    <>
      {sync !== "ok" && (
        <div
          className={`fixed top-2 right-2 z-50 rounded-full px-3 py-1 text-xs font-medium shadow ${
            sync === "erro" ? "bg-red-600 text-white" : "bg-white text-stone-500"
          }`}
        >
          {sync === "erro" ? "Erro ao salvar — verifique a internet" : "Salvando…"}
        </div>
      )}
      {children}
    </>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOcupado(true);
    const { error } = await entrar(email.trim());
    setOcupado(false);
    if (error) setErro("Não foi possível enviar o link. Confira o e-mail e tente de novo.");
    else setEnviado(true);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold">CRM</h1>
      <p className="mb-8 text-stone-500">Ilha de Mauí</p>

      {enviado ? (
        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <p className="font-semibold">Link enviado para {email}.</p>
          <p className="mt-1 text-sm">Abra o e-mail neste aparelho e toque no link para entrar.</p>
          <button onClick={() => setEnviado(false)} className="mt-4 text-sm font-semibold underline">
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={enviar} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Seu e-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              className={campo}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button
            disabled={ocupado}
            className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white disabled:opacity-60"
          >
            {ocupado ? "Enviando…" : "Receber link de acesso"}
          </button>
          <p className="text-center text-xs text-stone-400">Sem senha: você recebe um link no e-mail.</p>
        </form>
      )}
    </main>
  );
}
