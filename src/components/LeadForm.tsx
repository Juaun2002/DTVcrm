"use client";

import { useState } from "react";
import { botaoPrimario, campo } from "@/components/ui";
import { formatarTelefone, normalizarTelefone } from "@/lib/cadencia";
import { hoje } from "@/lib/dates";
import { uid } from "@/lib/store";
import type { Lead, Tipologia } from "@/lib/types";

const ORIGENS = ["Instagram", "Facebook", "Google", "Site", "Indicação", "Plantão", "Outro"];

function Rotulo({ children, opcional }: { children: React.ReactNode; opcional?: boolean }) {
  return (
    <span className="mb-1.5 block text-sm font-semibold text-stone-700">
      {children} {opcional && <span className="font-normal text-stone-400">(opcional)</span>}
    </span>
  );
}

export function LeadForm({ inicial, onSalvar }: { inicial?: Lead; onSalvar: (l: Lead) => void }) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [tel, setTel] = useState(inicial ? formatarTelefone(inicial.telefone) : "");
  const [tipologia, setTipologia] = useState<Tipologia>(inicial?.tipologia ?? "3Q");
  const [origem, setOrigem] = useState(inicial?.origem ?? "Instagram");
  const [perfil, setPerfil] = useState(inicial?.perfil ?? "");
  const [entrada, setEntrada] = useState(inicial?.entrada ?? hoje());
  const [erro, setErro] = useState("");

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const telefone = normalizarTelefone(tel);
    if (!nome.trim()) return setErro("Preencha o nome.");
    if (!/^55\d{10,11}$/.test(telefone)) return setErro("Telefone inválido. Use DDD + número.");
    onSalvar({
      id: inicial?.id ?? uid(),
      nome: nome.trim(),
      telefone,
      tipologia,
      origem,
      perfil: perfil.trim(),
      entrada,
      status: inicial?.status ?? "ativo",
      passo: inicial?.passo ?? 0,
      obs: inicial?.obs ?? "",
      exemplo: inicial?.exemplo,
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <label className="block">
        <Rotulo>Nome</Rotulo>
        <input
          className={campo}
          placeholder="Nome do lead"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoFocus={!inicial}
        />
      </label>

      <label className="block">
        <Rotulo>WhatsApp com DDD</Rotulo>
        <input
          className={campo}
          inputMode="tel"
          placeholder="(11) 99999-8888"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
        />
      </label>

      <div>
        <Rotulo>Interesse</Rotulo>
        <div className="grid grid-cols-2 gap-3">
          {(["2Q", "3Q"] as const).map((t) => {
            const ativo = tipologia === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setTipologia(t)}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  ativo ? "border-teal-500 bg-teal-50 shadow-md shadow-teal-600/10" : "border-stone-200 bg-white"
                }`}
              >
                <span className={`block text-3xl font-black ${ativo ? "text-teal-700" : "text-stone-300"}`}>
                  {t[0]}
                </span>
                <span className={`text-sm font-semibold ${ativo ? "text-teal-800" : "text-stone-500"}`}>quartos</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Rotulo>Origem</Rotulo>
        <div className="flex flex-wrap gap-2">
          {ORIGENS.map((o) => (
            <button
              type="button"
              key={o}
              onClick={() => setOrigem(o)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                origem === o ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <Rotulo opcional>Perfil</Rotulo>
        <input
          className={campo}
          placeholder="Ex.: casal com filhos, investidor"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
        />
      </label>

      <label className="block">
        <Rotulo>Data de entrada</Rotulo>
        <input type="date" className={campo} value={entrada} onChange={(e) => setEntrada(e.target.value)} />
      </label>

      {erro && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <button className={`${botaoPrimario} w-full`}>{inicial ? "Salvar alterações" : "Cadastrar e começar cadência"}</button>
    </form>
  );
}
