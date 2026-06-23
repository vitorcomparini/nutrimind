# NutriMind Hub

Projeto trazido do Lovable para NutriMind Club.

## Preparar para editar

1. Copie `.env.example` para `.env`.
2. Preencha as variáveis de ambiente com os valores do Supabase e Lovable.
3. Instale dependências:
   - `bun install` ou `npm install`
4. Execute o projeto:
   - `npm run dev`

## Variáveis de ambiente principais

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY`
- `GOOGLE_DRIVE_API_KEY`
- `LOVABLE_SEND_URL`
- `VITE_SUPABASE_PROJECT_ID`

## Supabase

1. Crie um projeto no Supabase.
2. Configure as variáveis de ambiente no painel do Supabase ou no seu `.env` local.
3. Importe/migre o esquema do banco usando os arquivos de `supabase/migrations`.

## GitHub

1. Inicialize o repositório local:
   - `git init`
   - `git add .`
   - `git commit -m "Initial NutriMind Hub setup"`
2. Crie um repositório no GitHub e adicione o remoto:
   - `git remote add origin https://github.com/<seu-usuario>/<seu-repo>.git`
   - `git push -u origin main`

## Deploy

- Este projeto está configurado para rodar com `wrangler` / Cloudflare Workers via `wrangler.jsonc`.
- Se quiser subir no Vercel, será necessário adaptar o deploy para o ambiente Vercel, pois atualmente há configuração de servidor compatível com Workers.

## CI recomendado

Um workflow de build básico está disponível em `.github/workflows/ci.yml`.

## VS Code

Recomendações de extensões:
- ESLint
- Prettier

Use o `.vscode/extensions.json` para instalar recomendações automaticamente.
