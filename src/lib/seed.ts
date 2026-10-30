import type { Data, Tipologia, Toque } from "./types";

/**
 * Cadência inicial. Os textos são editáveis na tela "Scripts".
 * Variáveis: {nome}, {corretora}, {empreendimento}
 */
const BASE: Omit<Toque, "id" | "tipologia">[] = [
  {
    dia: 0,
    canal: "whatsapp",
    texto:
      "Oi {nome}, tudo bem? Aqui é {corretora}. Vi seu interesse no {empreendimento} ({tipologia}) e separei as informações para você. Posso te mandar a planta e os valores atualizados?",
  },
  {
    dia: 1,
    canal: "whatsapp",
    texto:
      "{nome}, conseguiu dar uma olhada no material do {empreendimento}? Se quiser, te explico rapidinho as diferenças entre as plantas de {tipologia}.",
  },
  {
    dia: 3,
    canal: "ligacao",
    texto:
      "Ligar para {nome}: entender momento de compra, se é moradia ou investimento, e oferecer visita ao decorado.",
  },
  {
    dia: 5,
    canal: "whatsapp",
    texto:
      "{nome}, tenho horários para visita ao decorado do {empreendimento} nesta semana. Qual dia fica melhor para você?",
  },
  {
    dia: 7,
    canal: "whatsapp",
    texto:
      "Oi {nome}! Passando para saber se ficou alguma dúvida sobre o {empreendimento}. Fico à disposição para simular condições de pagamento.",
  },
  {
    dia: 15,
    canal: "whatsapp",
    texto:
      "{nome}, as unidades de {tipologia} do {empreendimento} estão com boa procura. Ainda faz sentido para você? Se mudou o momento, me avisa sem problema.",
  },
  {
    dia: 30,
    canal: "whatsapp",
    texto:
      "Oi {nome}, tudo bem? Faz um tempinho que conversamos sobre o {empreendimento}. Se ainda estiver procurando imóvel, posso te mostrar as novidades.",
  },
];

let n = 0;
const uid = () => `seed-${++n}`;

function cadencia(tipologia: Tipologia): Toque[] {
  return BASE.map((t) => ({ ...t, id: uid(), tipologia }));
}

export function seed(): Data {
  return {
    leads: [],
    toques: [...cadencia("2Q"), ...cadencia("3Q")],
    historico: [],
    config: {
      corretora: "Patrícia",
      empreendimento: "Ilha de Mauí",
      pularFimDeSemana: false,
    },
  };
}
