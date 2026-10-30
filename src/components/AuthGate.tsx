"use client";

import { useState } from "react";
import { botaoPrimario, campo, Carregando, Icone, Logo } from "@/components/ui";
import { entrar, supabase, useSnap } from "@/lib/store";

/** Mostra o login quando o Supabase está configurado e não há sessão. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { estado, sync } = useSnap();
  if (!supabase) return children;

  if (estado === "sem-login") return <Login />;
  if (estado === "erro")
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-stone-600">Não foi possível carregar seus dados.</p>
        <button onClick={() => location.reload()} className="mt-4 font-semibold text-teal-700">
          Tentar de novo
        </button>
      </main>
    );
  if (estado === "carregando") return <Carregando />;

  return (
    <>
      {sync !== "ok" && (
        <div
          className={`fixed top-3 right-3 z-50 rounded-full px-3 py-1 text-xs font-semibold shadow-lg ${
            sync === "erro" ? "bg-red-600 text-white" : "bg-white/90 text-stone-500 backdrop-blur"
          }`}
        >
          {sync === "erro" ? "Erro ao salvar — verifique a internet" : "Salvando…"}
        </div>
      )}
      {children}
    </>
  );
}

function mensagemErro(e: { status?: number; code?: string; message: string }): string {
  if (e.code === "invalid_credentials") return "E-mail ou senha incorretos.";
  if (e.code === "email_not_confirmed") return "Este e-mail ainda não foi confirmado no Supabase.";
  if (e.status === 429) return "Muitas tentativas. Espere alguns minutos e tente de novo.";
  return `Não foi possível entrar. Detalhe: ${e.message}`;
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [manter, setManter] = useState(true);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOcupado(true);
    const { error } = await entrar(email.trim(), senha, manter);
    setOcupado(false);
    if (error) setErro(mensagemErro(error));
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-linear-to-br from-teal-700 via-teal-600 to-emerald-500">
      {/* ondas decorativas */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute top-40 -left-32 size-80 rounded-full bg-cyan-300/10" />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-6 pt-16 pb-8 text-white">
        <Logo className="mb-6 size-16 text-xl ring-4 ring-white/20" />
        <h1 className="text-4xl leading-tight font-black tracking-tight">
          Do Toque
          <br />à Visita
        </h1>
        <p className="mt-2 text-teal-50/90">Seus follow-ups do dia, prontos para enviar.</p>
      </div>

      <form
        onSubmit={enviar}
        className="relative mx-auto w-full max-w-md space-y-4 rounded-t-[2rem] bg-stone-50 px-6 pt-8 pb-10 shadow-2xl sm:mb-10 sm:rounded-[2rem]"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-stone-700">E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            className={campo}
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-stone-700">Senha</span>
          <div className="relative">
            <input
              type={ver ? "text" : "password"}
              required
              autoComplete="current-password"
              className={`${campo} pr-12`}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setVer(!ver)}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-stone-400"
              aria-label={ver ? "Esconder senha" : "Mostrar senha"}
            >
              <Icone nome={ver ? "olhoFechado" : "olho"} />
            </button>
          </div>
        </label>

        <label className="flex cursor-pointer items-center gap-3 py-1 text-sm text-stone-600 select-none">
          <input
            type="checkbox"
            checked={manter}
            onChange={(e) => setManter(e.target.checked)}
            className="size-5 rounded accent-teal-600"
          />
          Manter conectado neste aparelho
        </label>

        {erro && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

        <button disabled={ocupado} className={`${botaoPrimario} w-full`}>
          {ocupado ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
