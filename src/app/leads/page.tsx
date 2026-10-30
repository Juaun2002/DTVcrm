"use client";

import Link from "next/link";
import { useState } from "react";
import { Carregando } from "@/components/Nav";
import { apagarExemplos, dataDoToque, formatarTelefone, proximoToque } from "@/lib/cadencia";
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

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Leads</h1>

      {temExemplos && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          <span>Há leads de exemplo para você testar.</span>
          <button
            className="shrink-0 font-semibold underline"
            onClick={() => confirm("Apagar os leads de exemplo?") && apagarExemplos()}
          >
            Apagar
          </button>
        </div>
      )}

      <input
        className="mb-3 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 outline-none focus:border-emerald-600"
        placeholder="Buscar por nome ou telefone"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              filtro === f.valor ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {leads.length === 0 ? (
        <p className="py-10 text-center text-stone-400">Nenhum lead encontrado.</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {leads.map((l) => {
            const t = proximoToque(data, l);
            return (
              <li key={l.id}>
                <Link href={`/leads/${l.id}`} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.nome}</p>
                    <p className="text-sm text-stone-500">
                      {l.tipologia} · {formatarTelefone(l.telefone)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COR_STATUS[l.status]}`}>
                      {l.status === "ativo" && !t ? "Cadência concluída" : STATUS_LABEL[l.status]}
                    </span>
                    {t && (
                      <p className="mt-1 text-xs text-stone-400">
                        D{t.dia} · {formatarData(dataDoToque(data, l, t))}
                      </p>
                    )}
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
