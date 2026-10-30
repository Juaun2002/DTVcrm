export type Tipologia = "2Q" | "3Q";

export type Status = "ativo" | "respondeu" | "visitou" | "perdido" | "vendido";

export type Canal = "whatsapp" | "ligacao";

export interface Lead {
  id: string;
  nome: string;
  /** Somente dígitos, com DDI. Ex.: 5511999998888 */
  telefone: string;
  tipologia: Tipologia;
  perfil: string;
  origem: string;
  /** Data de entrada no formato YYYY-MM-DD (dia 0 da cadência) */
  entrada: string;
  status: Status;
  /** Índice do próximo toque da cadência */
  passo: number;
  obs: string;
  exemplo?: boolean;
}

export interface Toque {
  id: string;
  tipologia: Tipologia;
  dia: number;
  canal: Canal;
  texto: string;
}

export interface Registro {
  id: string;
  leadId: string;
  /** ISO datetime */
  quando: string;
  texto: string;
}

export interface Config {
  corretora: string;
  empreendimento: string;
  pularFimDeSemana: boolean;
}

export interface Data {
  leads: Lead[];
  toques: Toque[];
  historico: Registro[];
  config: Config;
}

export const STATUS_LABEL: Record<Status, string> = {
  ativo: "Em cadência",
  respondeu: "Respondeu",
  visitou: "Visitou",
  perdido: "Perdido",
  vendido: "Vendido",
};

export const COR_STATUS: Record<Status, string> = {
  ativo: "bg-emerald-100 text-emerald-800",
  respondeu: "bg-sky-100 text-sky-800",
  visitou: "bg-violet-100 text-violet-800",
  vendido: "bg-amber-100 text-amber-800",
  perdido: "bg-stone-200 text-stone-600",
};

