# Do Toque à Visita (DTV)

CRM de uma tela só para follow-up de leads pelo WhatsApp (envio manual via link `wa.me`, sem risco de bloqueio).

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Telas

- **Hoje** — toques do dia (atrasados primeiro). "Enviar WhatsApp" abre a conversa com o texto pronto e já avança a cadência; "Desfazer" aparece por 6 segundos.
- **Leads** — busca, filtro por status e detalhe de cada lead (cadência, anotações, histórico).
- **Novo** — nome, WhatsApp, 2Q/3Q, origem.
- **Scripts** — textos de cada toque, por tipologia. Variáveis: `{nome}`, `{corretora}`, `{empreendimento}`, `{tipologia}`.

## Onde ficam os dados

- **Sem `.env.local`:** modo local, só no navegador (`localStorage`, chave `crm:v1`).
- **Com Supabase configurado:** na nuvem, com login por e-mail e senha. Sincroniza celular e computador.
  No primeiro login, o que estava no navegador é enviado para a nuvem.

### Ligar o Supabase

1. Crie um projeto em https://supabase.com (plano gratuito).
2. **SQL Editor → New query**: cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. **Project Settings → API**: copie a *Project URL* e a chave *publishable* (ou *anon*).
4. Copie `.env.example` para `.env.local` e preencha os dois valores. Nunca use a chave *secret*/*service_role*.
5. **Authentication → Sign In / Providers → Email**: desative **"Confirm email"**. Assim quem cria conta no app
   já entra na hora, sem depender de e-mail (o e-mail grátis do Supabase tem limite de ~2 por hora).
   Mantenha **"Allow new users to sign up"** ligado para outros corretores poderem se cadastrar.
6. Reinicie o `npm run dev`, toque em **Criar conta** e cadastre-se. Cada conta tem seus próprios leads e scripts.

### Publicar (Vercel)

Importe o repositório na Vercel e cadastre as mesmas duas variáveis do `.env.local` em **Environment Variables**.
Cada `git push` na `main` publica sozinho.

## Estrutura

- `src/lib/types.ts` — modelos (Lead, Toque, Registro, Config)
- `src/lib/seed.ts` — cadência inicial (scripts padrão)
- `src/lib/cadencia.ts` — regras (próximo toque, datas, link do WhatsApp) e ações
- `src/lib/store.ts` — armazenamento
