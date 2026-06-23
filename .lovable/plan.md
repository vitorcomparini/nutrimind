# Aulas via Google Drive

## Como vai funcionar

1. Você sobe os MP4s na sua conta do Google Drive (em uma pasta dedicada da Nutrimind).
2. Conectamos sua conta do Google Drive ao projeto via conector do Lovable (autenticação OAuth feita uma única vez por você como admin).
3. No painel `/admin/aulas`, ao cadastrar/editar uma aula, você cola o **link** ou **ID do arquivo** do Drive — em vez do ID do YouTube.
4. Na plataforma, o mentorado ativo abre a aula e o vídeo toca dentro do player nativo do site. O arquivo NÃO é exposto publicamente: o site faz o streaming via backend autenticado.

## Proteção do conteúdo

- O arquivo no Drive permanece **privado** (somente sua conta tem acesso direto).
- O navegador do mentorado nunca recebe um link do Drive. Ele recebe os bytes do vídeo através de um endpoint do próprio site (`/api/lessons/$id/stream`) que:
  - Exige usuário autenticado e ativo (mesma RLS já existente).
  - Busca o vídeo do Drive usando as credenciais do conector (server-side).
  - Retransmite ao player com suporte a **Range requests** (necessário para seek/avançar e para começar a tocar antes de baixar tudo).
- Isso é a proteção "básica" combinada: impede compartilhamento casual e indexação pública. Um usuário muito técnico ainda pode capturar o stream — esse é o limite sem DRM.

## Mudanças no admin

- Campo "YouTube ID" vira "Google Drive – Link ou ID do arquivo" (aceita as duas formas, extrai o ID automaticamente).
- Indicação visual do status do arquivo (acessível / não encontrado) consultando metadados do Drive ao salvar.

## Mudanças na plataforma do mentorado

- `ProtectedYouTubePlayer` é substituído por um `ProtectedVideoPlayer` baseado em `<video>` HTML5 nativo, apontando para `/api/lessons/$id/stream`.
- Mantemos o registro de `lesson_views` (qual vídeo, quando, por quem) — sem mudança no banco.

## Engajamento

Sem alteração: os indicadores e o dashboard continuam funcionando normalmente. A métrica de "Consumo de conteúdo" segue contando os acessos registrados em `lesson_views`.

## O que você precisa fazer

1. Aprovar o plano.
2. Quando eu pedir, autorizar a conexão com sua conta Google Drive (vai abrir uma janela do Google).
3. Subir os MP4s no Drive e usar os links no admin.

## Detalhes técnicos

- **Conector**: `google_drive` via gateway do Lovable (`https://connector-gateway.lovable.dev/google_drive/drive/v3`).
- **Endpoint de streaming**: server route TanStack em `src/routes/api/lessons/$lessonId/stream.ts`.
  - Valida sessão Supabase (bearer token) + `is_active = true` via `requireSupabaseAuth`.
  - Lê `youtube_id` (renomeado para `drive_file_id`) da `lessons`.
  - Faz `GET ${GATEWAY_URL}/files/{fileId}?alt=media` repassando o header `Range` recebido do browser.
  - Retorna stream com `Content-Type: video/mp4`, `Accept-Ranges: bytes`, `Content-Range`/`Content-Length` espelhados.
  - Registra view em `lesson_views` (apenas no primeiro segmento de cada sessão para não inflar).
- **Migração SQL**: renomear `lessons.youtube_id` → `lessons.drive_file_id` (mantendo `text NOT NULL`).
- **Frontend**: `ProtectedVideoPlayer` com `<video controls controlsList="nodownload" disablePictureInPicture src="/api/lessons/{id}/stream">`. Substituir uso em `app.aula.$lessonId.tsx` e remover `ProtectedYouTubePlayer` + `src/lib/youtube.ts`.
- **Admin**: `admin.aulas.tsx` aceita link completo do Drive (`/file/d/{id}/...` ou `?id=`) e salva apenas o ID.
- **Limites do Worker**: streaming é fetch-pass-through (não bufferiza), então vídeos grandes são suportados desde que o Drive responda a Range — o que ele faz para `alt=media`.
