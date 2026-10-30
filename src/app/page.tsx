"use client";

import Link from "next/link";
import { useToast } from "@/components/Toast";
import { Avatar, Carregando, Chip, ChipTipologia, Icone, Progresso, saudacao } from "@/components/ui";
import {
  concluirToque,
  linkWhatsApp,
  mudarStatus,
  pendentesHoje,
  preencher,
  primeiroNome,
  toquesDe,
  type Pendente,
} from "@/lib/cadencia";
import { hoje, toISODate } from "@/lib/dates";
import { useData } from "@/lib/store";
import type { Config } from "@/lib/types";

export default function Hoje() {
  const data = useData();
  if (!data) return <Carregando />;

  const lista = pendentesHoje(data);
  const msgs = lista.filter((p) => p.toque.canal === "whatsapp").length;
  const ligacoes = lista.length - msgs;
  const h = hoje();
  const feitos = data.historico.filter(
    (r) => toISODate(new Date(r.quando)) === h && /enviado|ligação feita/.test(r.texto),
  ).length;
  const total = feitos + lista.length;
  const pct = total ? Math.round((feitos / total) * 100) : 100;
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <header className="relative mb-6 overflow-hidden rounded-[1.75rem] bg-linear-to-br from-teal-700 via-teal-600 to-emerald-500 p-5 text-white shadow-xl shadow-teal-800/20">
        <div className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 left-10 size-40 rounded-full bg-cyan-300/10" />

        <p className="relative text-sm text-teal-50/90 first-letter:uppercase">{dataHoje}</p>
        <h1 className="relative mt-0.5 text-2xl font-bold">
          {saudacao()}, {data.config.corretora || "corretora"}!
        </h1>

        <div className="relative mt-5 flex items-end justify-between">
          <div>
            <p className="text-5xl leading-none font-black">{lista.length}</p>
            <p className="mt-1 text-sm text-teal-50/90">follow-up{lista.length === 1 ? "" : "s"} para hoje</p>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
              <Icone nome="chat" className="size-3.5" /> {msgs}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
              <Icone nome="telefone" className="size-3.5" /> {ligacoes}
            </span>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-teal-50/80">
            {feitos} feito{feitos === 1 ? "" : "s"} hoje · {pct}%
          </p>
        </div>
      </header>

      {lista.length === 0 ? (
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal-50 text-teal-600">
            <Icone nome="checkCirculo" className="size-8" />
          </div>
          <p className="mt-4 text-lg font-bold">Tudo em dia!</p>
          <p className="mt-1 text-sm text-stone-500">Nenhum follow-up pendente por hoje.</p>
          <Link href="/novo" className="mt-5 inline-flex items-center gap-1 font-semibold text-teal-700">
            <Icone nome="mais" className="size-4" /> Cadastrar lead
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {lista.map((p) => (
            <Card key={p.lead.id} p={p} config={data.config} totalToques={toquesDe(data, p.lead.tipologia).length} />
          ))}
        </ul>
      )}
    </>
  );
}

function Card({ p, config, totalToques }: { p: Pendente; config: Config; totalToques: number }) {
  const toast = useToast();
  const { lead, toque, atraso } = p;
  const texto = preencher(toque.texto, lead, config);
  const nome = primeiroNome(lead.nome);
  const whats = toque.canal === "whatsapp";

  const concluir = (msg: string) => toast({ texto: msg, desfazer: concluirToque(lead.id) });
  const status = (s: "respondeu" | "perdido", label: string) =>
    toast({ texto: `${nome}: ${label.toLowerCase()}`, desfazer: mudarStatus(lead.id, s, label) });

  return (
    <li
      className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-sm ${
        atraso > 0 ? "border-red-200" : "border-stone-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar nome={lead.nome} />
          <Link href={`/leads/${lead.id}`} className="min-w-0 flex-1">
            <p className="truncate font-bold">{lead.nome}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <ChipTipologia t={lead.tipologia} />
              <Chip className={whats ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                <Icone nome={whats ? "chat" : "telefone"} className="size-3" />
                D{toque.dia} · {whats ? "WhatsApp" : "Ligação"}
              </Chip>
              {atraso > 0 && (
                <Chip className="bg-red-50 text-red-600">
                  <Icone nome="relogio" className="size-3" />
                  {atraso}d atrasado
                </Chip>
              )}
            </div>
          </Link>
        </div>

        <div className="mt-3 rounded-2xl rounded-tl-md bg-[#e7f8ee] px-3.5 py-2.5 text-sm leading-relaxed text-stone-700">
          <p className="line-clamp-3">{texto}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Progresso feito={lead.passo} total={totalToques} />
          <span className="text-[11px] font-medium text-stone-400">
            toque {lead.passo + 1} de {totalToques}
          </span>
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-3">
        {whats ? (
          <a
            href={linkWhatsApp(lead.telefone, texto)}
            target="_blank"
            rel="noreferrer"
            onClick={() => concluir(`Enviado para ${nome}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 font-bold text-white shadow-md shadow-green-600/25 transition active:scale-[0.98]"
          >
            <Icone nome="enviar" className="size-[18px]" /> Enviar WhatsApp
          </a>
        ) : (
          <>
            <a
              href={`tel:+${lead.telefone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 font-bold text-white shadow-md shadow-amber-600/25 transition active:scale-[0.98]"
            >
              <Icone nome="telefone" className="size-[18px]" /> Ligar
            </a>
            <button
              onClick={() => concluir(`Ligação para ${nome} registrada`)}
              className="flex items-center gap-1.5 rounded-2xl border border-stone-200 px-4 font-semibold text-stone-700 transition active:scale-[0.98]"
            >
              <Icone nome="check" className="size-4" /> Feito
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-stone-100 text-sm font-semibold">
        <button
          onClick={() => status("respondeu", "Respondeu")}
          className="flex items-center justify-center gap-1.5 py-3 text-sky-700 transition hover:bg-sky-50"
        >
          <Icone nome="check" className="size-4" /> Respondeu
        </button>
        <button
          onClick={() => status("perdido", "Perdido")}
          className="flex items-center justify-center gap-1.5 border-l border-stone-100 py-3 text-stone-400 transition hover:bg-stone-50"
        >
          <Icone nome="x" className="size-4" /> Perdido
        </button>
      </div>
    </li>
  );
}
