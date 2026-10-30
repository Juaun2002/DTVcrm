"use client";

import { useState } from "react";
import { campo } from "@/components/LeadForm";
import { Carregando } from "@/components/Nav";
import { toquesDe } from "@/lib/cadencia";
import { sair, supabase, uid, update, useData, useSnap } from "@/lib/store";
import type { Config, Tipologia, Toque } from "@/lib/types";

function salvarToque(t: Toque) {
  update((d) => ({ ...d, toques: d.toques.map((x) => (x.id === t.id ? t : x)) }));
}

function salvarConfig(c: Partial<Config>) {
  update((d) => ({ ...d, config: { ...d.config, ...c } }));
}

export default function Scripts() {
  const data = useData();
  const [tipologia, setTipologia] = useState<Tipologia>("3Q");
  if (!data) return <Carregando />;

  const toques = toquesDe(data, tipologia);
  const { config } = data;

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Scripts</h1>
      <p className="mb-5 text-sm text-stone-500">
        Tudo salva sozinho. Use <code className="rounded bg-stone-200 px-1">{"{nome}"}</code>,{" "}
        <code className="rounded bg-stone-200 px-1">{"{corretora}"}</code>,{" "}
        <code className="rounded bg-stone-200 px-1">{"{empreendimento}"}</code> e{" "}
        <code className="rounded bg-stone-200 px-1">{"{tipologia}"}</code> nos textos.
      </p>

      <div className="mb-6 space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Seu nome</span>
          <input className={campo} value={config.corretora} onChange={(e) => salvarConfig({ corretora: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Empreendimento</span>
          <input
            className={campo}
            value={config.empreendimento}
            onChange={(e) => salvarConfig({ empreendimento: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-5 accent-emerald-600"
            checked={config.pularFimDeSemana}
            onChange={(e) => salvarConfig({ pularFimDeSemana: e.target.checked })}
          />
          Toque que cair no fim de semana vai para segunda
        </label>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-stone-200 p-1">
        {(["2Q", "3Q"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTipologia(t)}
            className={`rounded-lg py-2 text-sm font-semibold ${tipologia === t ? "bg-white shadow-sm" : "text-stone-600"}`}
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
        className="mt-3 w-full rounded-xl border border-dashed border-stone-300 py-3 font-semibold text-stone-600"
      >
        + Adicionar toque
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

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold">D</span>
        <input
          className="w-16 rounded-lg border border-stone-300 px-2 py-1.5"
          inputMode="numeric"
          value={dia}
          onChange={(e) => setDia(e.target.value.replace(/\D/g, ""))}
          onBlur={() => salvarToque({ ...toque, dia: Number(dia) || 0 })}
        />
        <select
          className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          value={toque.canal}
          onChange={(e) => salvarToque({ ...toque, canal: e.target.value as Toque["canal"] })}
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="ligacao">Ligação</option>
        </select>
        <button
          className="ml-auto text-sm text-red-600"
          onClick={() =>
            confirm(`Remover o toque D${toque.dia}?`) &&
            update((d) => ({ ...d, toques: d.toques.filter((x) => x.id !== toque.id) }))
          }
        >
          Remover
        </button>
      </div>
      <textarea
        className="min-h-24 w-full rounded-xl border border-stone-300 p-3 text-sm outline-none focus:border-emerald-600"
        value={toque.texto}
        onChange={(e) => salvarToque({ ...toque, texto: e.target.value })}
      />
    </li>
  );
}

function Conta() {
  const { email } = useSnap();
  return (
    <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
      <h2 className="mb-1 font-semibold">Conta</h2>
      {supabase ? (
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-stone-500">{email}</span>
          <button onClick={() => void sair()} className="shrink-0 font-semibold text-red-600">
            Sair
          </button>
        </div>
      ) : (
        <p className="text-stone-500">Modo local: os dados ficam só neste navegador.</p>
      )}
    </section>
  );
}
