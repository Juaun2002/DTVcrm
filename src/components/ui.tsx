import type { SVGProps } from "react";

/* ---------- Ícones (traço, 24x24, herdam a cor do texto) ---------- */

const PATHS = {
  sol: "M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  pessoas:
    "M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  mais: "M12 5v14M5 12h14",
  chat: "M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12Z",
  telefone:
    "M21 16.5v3a2 2 0 0 1-2.2 2A19.5 19.5 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3a2 2 0 0 1 2 1.7c.13.9.36 1.8.68 2.6a2 2 0 0 1-.45 2.1L8.5 10.6a16 16 0 0 0 4.9 4.9l1.2-1.2a2 2 0 0 1 2.1-.45c.85.32 1.7.55 2.6.68a2 2 0 0 1 1.7 2Z",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  sair: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  voltar: "M15 18l-6-6 6-6",
  lapis: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  busca: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.35-4.35",
  olho: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  olhoFechado:
    "M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20M14.1 14.1a3 3 0 0 1-4.2-4.2",
  relogio: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  lixeira: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  enviar: "M22 2 11 13M22 2l-7 20-4-9-9-4Z",
  checkCirculo: "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3",
} as const;

export type NomeIcone = keyof typeof PATHS;

export function Icone({ nome, className = "size-5", ...p }: { nome: NomeIcone } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...p}
    >
      <path d={PATHS[nome]} />
    </svg>
  );
}

/* ---------- Marca ---------- */

export function Logo({ className = "size-10 text-base" }: { className?: string }) {
  return (
    <div
      className={`grid place-items-center rounded-2xl bg-linear-to-br from-teal-500 to-emerald-700 font-black tracking-tight text-white shadow-lg shadow-teal-900/20 ${className}`}
    >
      DTV
    </div>
  );
}

/* ---------- Avatar com iniciais ---------- */

const CORES = [
  "from-teal-400 to-teal-600",
  "from-sky-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-green-600",
  "from-cyan-400 to-blue-500",
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Avatar({ nome, className = "size-11 text-sm" }: { nome: string; className?: string }) {
  const partes = nome.trim().split(/\s+/);
  const iniciais = ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes.at(-1)![0] : "")).toUpperCase();
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br font-bold text-white ${CORES[hash(nome) % CORES.length]} ${className}`}
    >
      {iniciais || "?"}
    </div>
  );
}

/* ---------- Etiquetas ---------- */

export function Chip({ children, className = "bg-stone-100 text-stone-600" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function ChipTipologia({ t }: { t: "2Q" | "3Q" }) {
  return <Chip className={t === "3Q" ? "bg-indigo-50 text-indigo-700" : "bg-cyan-50 text-cyan-700"}>{t === "3Q" ? "3 quartos" : "2 quartos"}</Chip>;
}

/** Bolinhas de progresso da cadência. */
export function Progresso({ feito, total }: { feito: number; total: number }) {
  return (
    <div className="flex items-center gap-1" title={`${feito} de ${total} toques`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < feito ? "w-3 bg-teal-500" : i === feito ? "w-3 bg-teal-200" : "w-1.5 bg-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

export function saudacao(): string {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

/* ---------- Estilos compartilhados ---------- */

export const campo =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15";

export const botaoPrimario =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-teal-600 to-emerald-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-teal-700/25 transition active:scale-[0.98] disabled:opacity-60";

export const botaoSecundario =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 font-semibold text-stone-700 shadow-sm transition active:scale-[0.98]";

export function Carregando() {
  return (
    <div className="flex justify-center py-24">
      <div className="size-8 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
    </div>
  );
}
