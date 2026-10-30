"use client";

import Link from "next/link";
import { Carregando } from "@/components/Nav";
import { useToast } from "@/components/Toast";
import {
  concluirToque,
  linkWhatsApp,
  mudarStatus,
  pendentesHoje,
  preencher,
  primeiroNome,
  type Pendente,
} from "@/lib/cadencia";
import { useData } from "@/lib/store";
import type { Config } from "@/lib/types";

export default function Hoje() {
  const data = useData();
  if (!data) return <Carregando />;

  const lista = pendentesHoje(data);
  const msgs = lista.filter((p) => p.toque.canal === "whatsapp").length;
  const ligacoes = lista.length - msgs;
  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <header className="mb-5">
        <p className="text-sm capitalize text-stone-500">{dataHoje}</p>
        <h1 className="text-2xl font-bold">
          {lista.length === 0 ? "Tudo em dia" : `Hoje: ${lista.length} follow-up${lista.length > 1 ? "s" : ""}`}
        </h1>
        {lista.length > 0 && (
          <p className="text-sm text-stone-500">
            {msgs} mensage{msgs === 1 ? "m" : "ns"} · {ligacoes} ligaç{ligacoes === 1 ? "ão" : "ões"}
          </p>
        )}
      </header>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          <p className="text-4xl">🎉</p>
          <p className="mt-2">Nenhum follow-up pendente.</p>
          <Link href="/novo" className="mt-4 inline-block font-semibold text-emerald-700">
            + Cadastrar lead
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((p) => (
            <Card key={p.lead.id} p={p} config={data.config} />
          ))}
        </ul>
      )}
    </>
  );
}

function Card({ p, config }: { p: Pendente; config: Config }) {
  const toast = useToast();
  const { lead, toque, atraso } = p;
  const texto = preencher(toque.texto, lead, config);
  const nome = primeiroNome(lead.nome);
  const whats = toque.canal === "whatsapp";

  const concluir = (msg: string) => toast({ texto: msg, desfazer: concluirToque(lead.id) });
  const status = (s: "respondeu" | "perdido", label: string) =>
    toast({ texto: `${nome}: ${label.toLowerCase()}`, desfazer: mudarStatus(lead.id, s, label) });

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/leads/${lead.id}`} className="min-w-0">
          <p className="truncate font-semibold">{lead.nome}</p>
          <p className="text-sm text-stone-500">
            {lead.tipologia} · D{toque.dia} · {whats ? "WhatsApp" : "Ligação"}
          </p>
        </Link>
        {atraso > 0 && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            {atraso} dia{atraso > 1 ? "s" : ""} atrasado
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">{texto}</p>

      <div className="mt-3 flex gap-2">
        {whats ? (
          <a
            href={linkWhatsApp(lead.telefone, texto)}
            target="_blank"
            rel="noreferrer"
            onClick={() => concluir(`Enviado para ${nome}`)}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-center font-semibold text-white active:bg-emerald-700"
          >
            Enviar WhatsApp
          </a>
        ) : (
          <>
            <a
              href={`tel:+${lead.telefone}`}
              className="flex-1 rounded-xl bg-emerald-600 py-3 text-center font-semibold text-white active:bg-emerald-700"
            >
              📞 Ligar
            </a>
            <button
              onClick={() => concluir(`Ligação para ${nome} registrada`)}
              className="rounded-xl border border-emerald-600 px-4 font-semibold text-emerald-700"
            >
              Feito
            </button>
          </>
        )}
      </div>
      <div className="mt-2 flex gap-2 text-sm">
        <button
          onClick={() => status("respondeu", "Respondeu")}
          className="flex-1 rounded-lg py-2 text-stone-600 hover:bg-stone-100"
        >
          ✅ Respondeu
        </button>
        <button
          onClick={() => status("perdido", "Perdido")}
          className="flex-1 rounded-lg py-2 text-stone-600 hover:bg-stone-100"
        >
          ✖️ Perdido
        </button>
      </div>
    </li>
  );
}
