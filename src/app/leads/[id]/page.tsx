"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { useToast } from "@/components/Toast";
import { Avatar, campo, Carregando, Chip, ChipTipologia, Icone, Progresso } from "@/components/ui";
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
      <p className="py-24 text-center text-stone-500">
        Lead não encontrado.{" "}
        <Link href="/leads" className="font-semibold text-teal-700 underline">
          Voltar
        </Link>
      </p>
    );

  if (editando)
    return (
      <>
        <button onClick={() => setEditando(false)} className="mb-4 flex items-center gap-1 text-sm font-semibold text-stone-500">
          <Icone nome="voltar" className="size-4" /> Cancelar
        </button>
        <h1 className="mb-6 text-3xl font-black tracking-tight">Editar lead</h1>
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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="grid size-10 place-items-center rounded-full bg-white text-stone-600 shadow-sm ring-1 ring-stone-200"
          aria-label="Voltar"
        >
          <Icone nome="voltar" />
        </button>
        <button
          onClick={() => setEditando(true)}
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-stone-200"
        >
          <Icone nome="lapis" className="size-4" /> Editar
        </button>
      </div>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5 text-center shadow-sm">
        <Avatar nome={lead.nome} className="mx-auto size-20 text-2xl shadow-lg" />
        <h1 className="mt-3 text-2xl font-black tracking-tight">{lead.nome}</h1>
        <p className="text-stone-500">{formatarTelefone(lead.telefone)}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          <ChipTipologia t={lead.tipologia} />
          <Chip>{lead.origem}</Chip>
          {lead.perfil && <Chip>{lead.perfil}</Chip>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a
            href={linkWhatsApp(lead.telefone, "")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 font-bold text-white shadow-md shadow-green-600/25"
          >
            <Icone nome="chat" className="size-[18px]" /> WhatsApp
          </a>
          <a
            href={`tel:+${lead.telefone}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 font-bold text-white shadow-md shadow-amber-600/25"
          >
            <Icone nome="telefone" className="size-[18px]" /> Ligar
          </a>
        </div>
      </section>

      <Secao titulo="Status">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <button
              key={s}
              onClick={() =>
                s !== lead.status &&
                toast({ texto: `Status: ${STATUS_LABEL[s]}`, desfazer: mudarStatus(lead.id, s, STATUS_LABEL[s]) })
              }
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                s === lead.status ? `${COR_STATUS[s]} shadow-sm ring-2 ring-current/30` : "bg-white text-stone-500 ring-1 ring-stone-200"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        {lead.status !== "ativo" && (
          <p className="mt-2 text-xs text-stone-500">Cadência pausada. Volte para “Em cadência” para retomar.</p>
        )}
      </Secao>

      <Secao titulo="Cadência" extra={<Progresso feito={Math.min(lead.passo, toques.length)} total={toques.length} />}>
        <ol className="relative rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          {toques.map((t, i) => {
            const feito = i < lead.passo;
            const proximo = i === lead.passo && lead.status === "ativo";
            const ultimo = i === toques.length - 1;
            return (
              <li key={t.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!ultimo && (
                  <span className={`absolute top-7 left-[13px] h-[calc(100%-1.25rem)] w-0.5 ${feito ? "bg-teal-400" : "bg-stone-200"}`} />
                )}
                <span
                  className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                    feito
                      ? "bg-teal-500 text-white"
                      : proximo
                        ? "bg-white text-teal-700 ring-2 ring-teal-500"
                        : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {feito ? <Icone nome="check" className="size-3.5" strokeWidth={3} /> : `D${t.dia}`}
                </span>
                <div className={`flex flex-1 items-center justify-between pt-1 text-sm ${feito ? "text-stone-400" : ""}`}>
                  <span className={`flex items-center gap-1.5 ${proximo ? "font-bold text-teal-800" : ""}`}>
                    <Icone nome={t.canal === "whatsapp" ? "chat" : "telefone"} className="size-3.5" />
                    {t.canal === "whatsapp" ? "WhatsApp" : "Ligação"}
                    {proximo && <Chip className="bg-teal-50 text-teal-700">próximo</Chip>}
                  </span>
                  <span className="text-xs">{formatarData(dataDoToque(data, lead, t))}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </Secao>

      <Secao titulo="Anotações e histórico">
        <form
          className="mb-4 flex gap-2"
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
          <button className="rounded-2xl bg-stone-900 px-4 font-semibold text-white">Salvar</button>
        </form>
        {historico.length === 0 ? (
          <p className="text-sm text-stone-400">Nada registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {historico.map((h) => (
              <li key={h.id} className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-stone-100">
                <p>{h.texto}</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {new Date(h.quando).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
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
        className="mt-10 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600"
      >
        <Icone nome="lixeira" className="size-4" /> Excluir lead
      </button>
    </>
  );
}

function Secao({ titulo, extra, children }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wider text-stone-400 uppercase">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}
