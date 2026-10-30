"use client";

import { useState } from "react";
import { formatarTelefone, normalizarTelefone } from "@/lib/cadencia";
import { hoje } from "@/lib/dates";
import { uid } from "@/lib/store";
import type { Lead, Tipologia } from "@/lib/types";

const ORIGENS = ["Instagram", "Facebook", "Google", "Site", "Indicação", "Plantão", "Outro"];

export const campo =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-emerald-600";

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
    <form onSubmit={enviar} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Nome</span>
        <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} autoFocus={!inicial} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">WhatsApp (com DDD)</span>
        <input
          className={campo}
          inputMode="tel"
          placeholder="(11) 99999-8888"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
        />
      </label>

      <div>
        <span className="mb-1 block text-sm font-medium">Interesse</span>
        <div className="grid grid-cols-2 gap-2">
          {(["2Q", "3Q"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTipologia(t)}
              className={`rounded-xl border py-3 font-semibold ${
                tipologia === t
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-stone-300 bg-white text-stone-600"
              }`}
            >
              {t === "2Q" ? "2 quartos" : "3 quartos"}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Origem</span>
        <select className={campo} value={origem} onChange={(e) => setOrigem(e.target.value)}>
          {ORIGENS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Perfil <span className="font-normal text-stone-400">(opcional)</span>
        </span>
        <input
          className={campo}
          placeholder="Ex.: casal com filhos, investidor"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Data de entrada</span>
        <input type="date" className={campo} value={entrada} onChange={(e) => setEntrada(e.target.value)} />
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white active:bg-emerald-700">
        {inicial ? "Salvar" : "Cadastrar lead"}
      </button>
    </form>
  );
}
