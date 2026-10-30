"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { campo, LeadForm } from "@/components/LeadForm";
import { Carregando } from "@/components/Nav";
import { useToast } from "@/components/Toast";
import {
  anotar,
  dataDoToque,
  excluirLead,
  formatarTelefone,
  linkWhatsApp,
  mudarStatus,
  salvarLead,
  toquesDe,
} from "@/lib/cadencia";
import { formatarData } from "@/lib/dates";
import { useData } from "@/lib/store";
import { COR_STATUS, STATUS_LABEL, type Status } from "@/lib/types";

export default function LeadDetalhe() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const data = useData();
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState("");

  if (!data) return <Carregando />;
  const lead = data.leads.find((l) => l.id === id);
  if (!lead)
    return (
      <p className="py-20 text-center text-stone-500">
        Lead não encontrado. <Link href="/leads" className="text-emerald-700 underline">Voltar</Link>
      </p>
    );

  if (editando)
    return (
      <>
        <button onClick={() => setEditando(false)} className="mb-4 text-sm text-stone-500">
          ← Cancelar
        </button>
        <h1 className="mb-5 text-2xl font-bold">Editar lead</h1>
        <LeadForm
          inicial={lead}
          onSalvar={(l) => {
            salvarLead(l);
            setEditando(false);
            toast({ texto: "Alterações salvas" });
          }}
        />
      </>
    );

  const toques = toquesDe(data, lead.tipologia);
  const historico = data.historico.filter((h) => h.leadId === lead.id);

  return (
    <>
      <div className="mb-4 flex items-center justify-between text-sm">
        <button onClick={() => router.back()} className="text-stone-500">
          ← Voltar
        </button>
        <button onClick={() => setEditando(true)} className="font-semibold text-emerald-700">
          Editar
        </button>
      </div>

      <h1 className="text-2xl font-bold">{lead.nome}</h1>
      <p className="text-stone-500">
        {formatarTelefone(lead.telefone)} · {lead.tipologia} · {lead.origem}
      </p>
      {lead.perfil && <p className="mt-1 text-sm text-stone-500">{lead.perfil}</p>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={linkWhatsApp(lead.telefone, "")}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-emerald-600 py-3 text-center font-semibold text-white"
        >
          WhatsApp
        </a>
        <a
          href={`tel:+${lead.telefone}`}
          className="rounded-xl border border-emerald-600 py-3 text-center font-semibold text-emerald-700"
        >
          Ligar
        </a>
      </div>

      <Secao titulo="Status">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <button
              key={s}
              onClick={() =>
                s !== lead.status &&
                toast({ texto: `Status: ${STATUS_LABEL[s]}`, desfazer: mudarStatus(lead.id, s, STATUS_LABEL[s]) })
              }
              className={`rounded-full px-3 py-1.5 text-sm ${
                s === lead.status ? `${COR_STATUS[s]} font-semibold ring-2 ring-current` : "bg-white ring-1 ring-stone-200"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        {lead.status !== "ativo" && (
          <p className="mt-2 text-xs text-stone-500">A cadência fica pausada. Volte para “Em cadência” para retomar.</p>
        )}
      </Secao>

      <Secao titulo="Cadência">
        <ol className="space-y-1.5">
          {toques.map((t, i) => {
            const feito = i < lead.passo;
            const proximo = i === lead.passo && lead.status === "ativo";
            return (
              <li
                key={t.id}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  proximo ? "bg-emerald-50 font-medium text-emerald-900" : feito ? "text-stone-400" : "text-stone-600"
                }`}
              >
                <span>
                  {feito ? "✓" : proximo ? "→" : "·"} D{t.dia} · {t.canal === "whatsapp" ? "WhatsApp" : "Ligação"}
                </span>
                <span>{formatarData(dataDoToque(data, lead, t))}</span>
              </li>
            );
          })}
        </ol>
      </Secao>

      <Secao titulo="Anotações e histórico">
        <form
          className="mb-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!nota.trim()) return;
            anotar(lead.id, nota.trim());
            setNota("");
          }}
        >
          <input
            className={campo}
            placeholder="Ex.: prefere contato à noite"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
          <button className="rounded-xl bg-stone-900 px-4 font-semibold text-white">Salvar</button>
        </form>
        {historico.length === 0 ? (
          <p className="text-sm text-stone-400">Nada registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {historico.map((h) => (
              <li key={h.id} className="text-sm">
                <span className="text-stone-400">
                  {new Date(h.quando).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>{" "}
                {h.texto}
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <button
        onClick={() => {
          if (!confirm(`Excluir ${lead.nome}? Isso não pode ser desfeito.`)) return;
          excluirLead(lead.id);
          router.push("/leads");
        }}
        className="mt-10 w-full py-3 text-sm text-red-600"
      >
        Excluir lead
      </button>
    </>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">{titulo}</h2>
      {children}
    </section>
  );
}
