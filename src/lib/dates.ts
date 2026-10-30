/** Datas sempre como "YYYY-MM-DD" no fuso local, para evitar erro de um dia. */

export function hoje(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parse(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDias(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Se cair no sábado ou domingo, empurra para segunda. */
export function proximoDiaUtil(s: string): string {
  const d = parse(s);
  const dow = d.getDay();
  if (dow === 6) return addDias(s, 2);
  if (dow === 0) return addDias(s, 1);
  return s;
}

export function diffDias(a: string, b: string): number {
  return Math.round((parse(a).getTime() - parse(b).getTime()) / 86_400_000);
}

export function formatarData(s: string): string {
  return parse(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
