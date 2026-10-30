"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/", label: "Hoje", icone: "☀️" },
  { href: "/leads", label: "Leads", icone: "👥" },
  { href: "/novo", label: "Novo", icone: "➕" },
  { href: "/scripts", label: "Scripts", icone: "💬" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {itens.map((i) => {
          const ativo = i.href === "/" ? path === "/" : path.startsWith(i.href);
          return (
            <li key={i.href} className="flex-1">
              <Link
                href={i.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  ativo ? "font-semibold text-emerald-700" : "text-stone-500"
                }`}
              >
                <span className="text-xl leading-none">{i.icone}</span>
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Carregando() {
  return <p className="py-20 text-center text-stone-400">Carregando…</p>;
}
