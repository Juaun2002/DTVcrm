"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, Carregando, Chip, ChipTipologia, Icone, Progresso } from "@/components/ui";
import { apagarExemplos, dataDoToque, formatarTelefone, proximoToque, toquesDe } from "@/lib/cadencia";
import { formatarData } from "@/lib/dates";
import { useData } from "@/lib/store";
import { COR_STATUS, STATUS_LABEL, type Status } from "@/lib/types";

const FILTROS: { valor: Status | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "ativo", label: "Em cadência" },
  { valor: "respondeu", label: "Responderam" },
  { valor: "visitou", label: "Visitaram" },
  { valor: "vendido", label: "Vendidos" },
  { valor: "perdido", label: "Perdidos" },
];

export default function Leads() {
  const data = useData();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Status | "todos">("todos");
  if (!data) return <Carregando />;

  const q = busca.trim().toLowerCase();
  const qDigitos = q.replace(/\D/g, "");
  const leads = data.leads.filter(
    (l) =>
      (filtro === "todos" || l.status === filtro) &&
      (!q || l.nome.toLowerCase().includes(q) || (qDigitos !== "" && l.telefone.includes(qDigitos))),
  );
  const temExemplos = data.leads.some((l) => l.exemplo);
  const contagem = (s: Status | "todos") => (s === "todos" ? data.leads.length : data.leads.filter((l) => l.status === s).length);

  return (
    <>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Leads</h1>
          <p className="text-stone-500">
            {data.leads.length} no total · {contagem("ativo")} em cadência
          </p>
        </div>
      </div>

      {temExemplos && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <span>Há leads de exemplo na lista.</span>
          <button
            className="shrink-0 font-bold underline"
            onClick={() => confirm("Apagar os leads de exemplo?") && apagarExemplos()}
          >
            Apagar
          </button>
        </div>
      )}

      <div className="relative mb-3">
        <Icone nome="busca" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-stone-400" />
        <input
          className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pr-4 pl-12 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
          placeholder="Buscar por nome ou telefone"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
              filtro === f.valor ? "bg-stone-900 text-white shadow-md" : "bg-white text-stone-600 ring-1 ring-stone-200"
            }`}
          >
            {f.label}
            <span className={`text-xs ${filtro === f.valor ? "text-white/60" : "text-stone-400"}`}>{contagem(f.valor)}</span>
          </button>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-stone-300 p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-stone-100 text-stone-400">
            <Icone nome="pessoas" className="size-7" />
          </div>
          <p className="mt-3 font-semibold text-stone-600">
            {data.leads.length === 0 ? "Nenhum lead ainda" : "Nenhum lead encontrado"}
          </p>
          {data.leads.length === 0 && (
            <Link href="/novo" className="mt-3 inline-flex items-center gap-1 font-semibold text-teal-700">
              <Icone nome="mais" className="size-4" /> Cadastrar o primeiro
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {leads.map((l) => {
            const t = proximoToque(data, l);
            const total = toquesDe(data, l.tipologia).length;
            return (
              <li key={l.id}>
                <Link
                  href={`/leads/${l.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
                >
                  <Avatar nome={l.nome} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold">{l.nome}</p>
                      <Chip className={COR_STATUS[l.status]}>
                        {l.status === "ativo" && !t ? "Concluída" : STATUS_LABEL[l.status]}
                      </Chip>
                    </div>
                    <p className="mt-0.5 text-sm text-stone-500">{formatarTelefone(l.telefone)}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ChipTipologia t={l.tipologia} />
                        <Progresso feito={Math.min(l.passo, total)} total={total} />
                      </div>
                      {t && (
                        <span className="text-[11px] font-medium text-stone-400">
                          D{t.dia} · {formatarData(dataDoToque(data, l, t))}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
