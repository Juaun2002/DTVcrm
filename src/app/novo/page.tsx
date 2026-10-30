"use client";

import { useRouter } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { useToast } from "@/components/Toast";
import { Carregando } from "@/components/ui";
import { salvarLead } from "@/lib/cadencia";
import { useData } from "@/lib/store";

export default function Novo() {
  const router = useRouter();
  const toast = useToast();
  // Espera o navegador: o formulário usa a data de hoje.
  if (!useData()) return <Carregando />;

  return (
    <>
      <h1 className="text-3xl font-black tracking-tight">Novo lead</h1>
      <p className="mb-6 text-stone-500">Cadastre e a cadência começa sozinha.</p>
      <LeadForm
        onSalvar={(lead) => {
          salvarLead(lead);
          toast({ texto: `${lead.nome} cadastrado. A cadência começou.` });
          router.push("/");
        }}
      />
    </>
  );
}
