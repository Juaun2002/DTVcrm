"use client";

import { useState } from "react";
import { campo, Carregando, Icone } from "@/components/ui";
import { toquesDe } from "@/lib/cadencia";
import { sair, supabase, uid, update, useData, useSnap } from "@/lib/store";
import type { Config, Tipologia, Toque } from "@/lib/types";

function salvarToque(t: Toque) {
  update((d) => ({ ...d, toques: d.toques.map((x) => (x.id === t.id ? t : x)) }));
}

function salvarConfig(c: Partial<Config>) {
  update((d) => ({ ...d, config: { ...d.config, ...c } }));
}

const VARIAVEIS = ["{nome}", "{corretora}", "{empreendimento}", "{tipologia}"];

export default function Scripts() {
  const data = useData();
  const [tipologia, setTipologia] = useState<Tipologia>("3Q");
  if (!data) return <Carregando />;

  const toques = toquesDe(data, tipologia);
  const { config } = data;

  return (
    <>
      <h1 className="text-3xl font-black tracking-tight">Scripts</h1>
      <p className="mb-5 text-stone-500">Tudo salva sozinho enquanto você digita.</p>

      <section className="mb-6 space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-700">Seu nome</span>
            <input className={campo} value={config.corretora} onChange={(e) => salvarConfig({ corretora: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-700">Empreendimento</span>
            <input
              className={campo}
              value={config.empreendimento}
              onChange={(e) => salvarConfig({ empreendimento: e.target.value })}
            />
          </label>
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-stone-50 p-3 text-sm">
          <span className="font-medium text-stone-700">Toque no fim de semana vai para segunda</span>
          <input
            type="checkbox"
            className="size-5 accent-teal-600"
            checked={config.pularFimDeSemana}
            onChange={(e) => salvarConfig({ pularFimDeSemana: e.target.checked })}
          />
        </label>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-stone-400">Variáveis que você pode usar nos textos</p>
          <div className="flex flex-wrap gap-1.5">
            {VARIAVEIS.map((v) => (
              <code key={v} className="rounded-lg bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
                {v}
              </code>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-stone-200/70 p-1">
        {(["2Q", "3Q"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTipologia(t)}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              tipologia === t ? "bg-white text-teal-700 shadow-sm" : "text-stone-500"
            }`}
          >
            {t === "2Q" ? "2 quartos" : "3 quartos"}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {toques.map((t) => (
          <EditorToque key={t.id} toque={t} />
        ))}
      </ul>

      <button
        onClick={() => {
          const ultimo = toques.at(-1)?.dia ?? 0;
          update((d) => ({
            ...d,
            toques: [...d.toques, { id: uid(), tipologia, dia: ultimo + 7, canal: "whatsapp", texto: "Oi {nome}, " }],
          }));
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 py-3.5 font-semibold text-stone-500 transition hover:border-teal-400 hover:text-teal-700"
      >
        <Icone nome="mais" className="size-4" /> Adicionar toque
      </button>
      <p className="mt-3 text-xs text-stone-400">
        Dica: evite apagar ou inserir toques no meio da cadência com leads em andamento — eles seguem pela posição na lista.
      </p>

      <Conta />
    </>
  );
}

function EditorToque({ toque }: { toque: Toque }) {
  const [dia, setDia] = useState(String(toque.dia));
  const whats = toque.canal === "whatsapp";

  return (
    <li className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
        <div className="flex items-center rounded-xl bg-stone-900 pl-2.5 text-sm font-bold text-white">
          D
          <input
            className="w-10 bg-transparent py-1.5 pr-2 pl-0.5 outline-none"
            inputMode="numeric"
            value={dia}
            onChange={(e) => setDia(e.target.value.replace(/\D/g, ""))}
            onBlur={() => salvarToque({ ...toque, dia: Number(dia) || 0 })}
            aria-label="Dia do toque"
          />
        </div>
        <div className="flex rounded-xl bg-stone-100 p-0.5 text-xs font-semibold">
          {(["whatsapp", "ligacao"] as const).map((c) => (
            <button
              key={c}
              onClick={() => salvarToque({ ...toque, canal: c })}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition ${
                toque.canal === c ? (c === "whatsapp" ? "bg-[#25D366] text-white" : "bg-amber-500 text-white") : "text-stone-500"
              }`}
            >
              <Icone nome={c === "whatsapp" ? "chat" : "telefone"} className="size-3.5" />
              {c === "whatsapp" ? "WhatsApp" : "Ligação"}
            </button>
          ))}
        </div>
        <button
          className="ml-auto grid size-8 place-items-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Remover toque"
          onClick={() =>
            confirm(`Remover o toque D${toque.dia}?`) &&
            update((d) => ({ ...d, toques: d.toques.filter((x) => x.id !== toque.id) }))
          }
        >
          <Icone nome="lixeira" className="size-4" />
        </button>
      </div>
      <textarea
        className={`block min-h-28 w-full resize-y p-4 text-sm leading-relaxed outline-none ${whats ? "bg-[#f3fbf6]" : "bg-amber-50/40"}`}
        value={toque.texto}
        onChange={(e) => salvarToque({ ...toque, texto: e.target.value })}
      />
    </li>
  );
}

function Conta() {
  const { email } = useSnap();
  return (
    <section className="mt-10 rounded-[1.75rem] border border-stone-200 bg-white p-5 text-sm shadow-sm">
      <h2 className="mb-2 text-xs font-bold tracking-wider text-stone-400 uppercase">Conta</h2>
      {supabase ? (
        <div className="flex items-center justify-between gap-3">
          <span className="truncate font-medium text-stone-600">{email}</span>
          <button
            onClick={() => void sair()}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-600"
          >
            <Icone nome="sair" className="size-4" /> Sair
          </button>
        </div>
      ) : (
        <p className="text-stone-500">Modo local: os dados ficam só neste navegador.</p>
      )}
    </section>
  );
}
