## Stack

- Next.js (App Router) + React 18
- Supabase (auth + banco) — **service role key somente no servidor**
- Mercado Pago (checkout) + Playwright para E2E

## Ambiente local

1. `npm install`
2. Crie `.env.local` com as variáveis abaixo.
3. `npm run dev` e abra http://localhost:3000.

Variáveis necessárias:

- `NEXT_PUBLIC_APP_URL` — URL base (ex.: http://localhost:3000)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **apenas no servidor**, não exponha no client
- `MERCADO_PAGO_ACCESS_TOKEN` ou `MERCADOPAGO_ACCESS_TOKEN`

Para rodar E2E:

- `E2E_BASE_URL` (opcional, padrão http://localhost:3000)
- `E2E_POOL_ID` (pool real para fluxo de convites)

## Deploy (Vercel)

Configure as mesmas variáveis no Dashboard:

- `NEXT_PUBLIC_APP_URL` (https://seuapp.vercel.app)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server)
- `MERCADO_PAGO_ACCESS_TOKEN` ou `MERCADOPAGO_ACCESS_TOKEN`

## Testes

- Unitários: `npm run test:unit`
- Integração: `npm run test:integration`
- E2E Playwright: `npm run test:e2e` (app rodando + `E2E_POOL_ID` configurado)
