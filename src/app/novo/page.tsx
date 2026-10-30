"use client";

import { useRouter } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { Carregando } from "@/components/Nav";
import { useToast } from "@/components/Toast";
import { salvarLead } from "@/lib/cadencia";
import { useData } from "@/lib/store";

export default function Novo() {
  const router = useRouter();
  const toast = useToast();
  // Espera o navegador: o formulário usa a data de hoje.
  if (!useData()) return <Carregando />;

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">Novo lead</h1>
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
