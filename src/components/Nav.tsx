"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone, type NomeIcone } from "@/components/ui";

const itens: { href: string; label: string; icone: NomeIcone }[] = [
  { href: "/", label: "Hoje", icone: "sol" },
  { href: "/leads", label: "Leads", icone: "pessoas" },
  { href: "/novo", label: "Novo", icone: "mais" },
  { href: "/scripts", label: "Scripts", icone: "chat" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto flex max-w-md items-center rounded-3xl border border-white/60 bg-white/85 p-1.5 shadow-xl shadow-stone-900/10 backdrop-blur-xl">
        {itens.map((i) => {
          const ativo = i.href === "/" ? path === "/" : path.startsWith(i.href);
          if (i.href === "/novo")
            return (
              <li key={i.href} className="flex flex-1 justify-center">
                <Link
                  href={i.href}
                  aria-label="Novo lead"
                  className="-my-5 grid size-14 place-items-center rounded-2xl bg-linear-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-700/40 ring-4 ring-stone-50 transition active:scale-95"
                >
                  <Icone nome="mais" className="size-7" strokeWidth={2.5} />
                </Link>
              </li>
            );
          return (
            <li key={i.href} className="flex-1">
              <Link
                href={i.href}
                className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold transition ${
                  ativo ? "bg-teal-50 text-teal-700" : "text-stone-400"
                }`}
              >
                <Icone nome={i.icone} className="size-[22px]" />
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
