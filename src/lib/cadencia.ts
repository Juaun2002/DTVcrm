import { addDias, diffDias, hoje, proximoDiaUtil } from "./dates";
import { getData, replace, uid, update } from "./store";
import type { Config, Data, Lead, Registro, Status, Tipologia, Toque } from "./types";

export function toquesDe(data: Data, tipologia: Tipologia): Toque[] {
  return data.toques.filter((t) => t.tipologia === tipologia).sort((a, b) => a.dia - b.dia);
}

export function proximoToque(data: Data, lead: Lead): Toque | undefined {
  if (lead.status !== "ativo") return undefined;
  return toquesDe(data, lead.tipologia)[lead.passo];
}

export function dataDoToque(data: Data, lead: Lead, toque: Toque): string {
  const d = addDias(lead.entrada, toque.dia);
  return data.config.pularFimDeSemana ? proximoDiaUtil(d) : d;
}

export interface Pendente {
  lead: Lead;
  toque: Toque;
  data: string;
  /** dias de atraso (0 = hoje) */
  atraso: number;
}

/** Toques vencidos até hoje, atrasados primeiro. */
export function pendentesHoje(data: Data): Pendente[] {
  const h = hoje();
  const out: Pendente[] = [];
  for (const lead of data.leads) {
    const toque = proximoToque(data, lead);
    if (!toque) continue;
    const d = dataDoToque(data, lead, toque);
    const atraso = diffDias(h, d);
    if (atraso >= 0) out.push({ lead, toque, data: d, atraso });
  }
  return out.sort((a, b) => b.atraso - a.atraso || a.lead.nome.localeCompare(b.lead.nome));
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

export function preencher(texto: string, lead: Lead, config: Config): string {
  return texto
    .replaceAll("{nome}", primeiroNome(lead.nome))
    .replaceAll("{corretora}", config.corretora)
    .replaceAll("{empreendimento}", config.empreendimento)
    .replaceAll("{tipologia}", lead.tipologia === "2Q" ? "2 quartos" : "3 quartos");
}

/** Aceita qualquer formato e devolve só dígitos com 55 na frente. */
export function normalizarTelefone(input: string): string {
  const d = input.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return "55" + d;
  return d;
}

export function formatarTelefone(t: string): string {
  const m = t.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : t;
}

export function linkWhatsApp(telefone: string, texto: string): string {
  return `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
}

function registro(leadId: string, texto: string): Registro {
  return { id: uid(), leadId, quando: new Date().toISOString(), texto };
}

/* ---------- Ações. Cada uma devolve uma função "desfazer". ---------- */

function comDesfazer(fn: (d: Data) => Data): () => void {
  const antes = getData();
  update(fn);
  return () => replace(antes);
}

export function concluirToque(leadId: string): () => void {
  return comDesfazer((d) => {
    const lead = d.leads.find((l) => l.id === leadId);
    if (!lead) return d;
    const toque = proximoToque(d, lead);
    const desc = toque
      ? `D${toque.dia} ${toque.canal === "whatsapp" ? "WhatsApp enviado" : "ligação feita"}`
      : "Toque concluído";
    return {
      ...d,
      leads: d.leads.map((l) => (l.id === leadId ? { ...l, passo: l.passo + 1 } : l)),
      historico: [registro(leadId, desc), ...d.historico],
    };
  });
}

export function mudarStatus(leadId: string, status: Status, label: string): () => void {
  return comDesfazer((d) => ({
    ...d,
    leads: d.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
    historico: [registro(leadId, `Status: ${label}`), ...d.historico],
  }));
}

export function salvarLead(lead: Lead) {
  update((d) => {
    const existe = d.leads.some((l) => l.id === lead.id);
    return {
      ...d,
      leads: existe ? d.leads.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...d.leads],
      historico: existe ? d.historico : [registro(lead.id, "Lead cadastrado"), ...d.historico],
    };
  });
}

export function excluirLead(leadId: string) {
  update((d) => ({
    ...d,
    leads: d.leads.filter((l) => l.id !== leadId),
    historico: d.historico.filter((h) => h.leadId !== leadId),
  }));
}

export function apagarExemplos() {
  update((d) => {
    const ids = new Set(d.leads.filter((l) => l.exemplo).map((l) => l.id));
    return {
      ...d,
      leads: d.leads.filter((l) => !ids.has(l.id)),
      historico: d.historico.filter((h) => !ids.has(h.leadId)),
    };
  });
}

export function anotar(leadId: string, texto: string) {
  update((d) => ({ ...d, historico: [registro(leadId, texto), ...d.historico] }));
}
