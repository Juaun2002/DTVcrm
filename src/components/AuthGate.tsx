"use client";

import { useState } from "react";
import { botaoPrimario, campo, Carregando, Icone, Logo } from "@/components/ui";
import { cadastrar, entrar, supabase, useSnap } from "@/lib/store";

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
  switch (e.code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
    case "user_already_exists":
    case "email_exists":
      return "Este e-mail já tem conta. Toque em “Entrar”.";
    case "weak_password":
      return "Senha fraca. Use pelo menos 6 caracteres.";
    case "signup_disabled":
      return "O cadastro de novas contas está desativado.";
    case "over_email_send_rate_limit":
      return "Limite de e-mails atingido. Espere cerca de 1 hora e tente de novo.";
  }
  if (e.status === 429) return "Muitas tentativas. Espere alguns minutos e tente de novo.";
  return `Algo deu errado. Detalhe: ${e.message}`;
}

function Login() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [aviso, setAviso] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [manter, setManter] = useState(true);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    if (modo === "criar" && senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setOcupado(true);
    if (modo === "entrar") {
      const { error } = await entrar(email.trim(), senha, manter);
      if (error) setErro(mensagemErro(error));
    } else {
      const { data, error } = await cadastrar(nome.trim(), email.trim(), senha, manter);
      if (error) setErro(mensagemErro(error));
      // Se o Supabase exigir confirmação de e-mail, não vem sessão: avisamos.
      else if (!data.session) setAviso(`Conta criada! Confirme pelo link enviado para ${email.trim()} e depois entre.`);
    }
    setOcupado(false);
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
        className="relative mx-auto w-full max-w-md space-y-4 rounded-t-[2rem] bg-stone-50 px-6 pt-6 pb-10 shadow-2xl sm:mb-10 sm:rounded-[2rem]"
      >
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-200/70 p-1">
          {(["entrar", "criar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setModo(m);
                setErro("");
                setAviso("");
              }}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                modo === m ? "bg-white text-teal-700 shadow-sm" : "text-stone-500"
              }`}
            >
              {m === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {modo === "criar" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-700">Seu nome</span>
            <input
              required
              autoComplete="name"
              className={campo}
              placeholder="Como você quer ser chamada(o)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
        )}

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
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              placeholder={modo === "criar" ? "Mínimo de 6 caracteres" : undefined}
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
        {aviso && <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800">{aviso}</p>}

        <button disabled={ocupado} className={`${botaoPrimario} w-full`}>
          {ocupado ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar minha conta"}
        </button>
      </form>
    </main>
  );
}
