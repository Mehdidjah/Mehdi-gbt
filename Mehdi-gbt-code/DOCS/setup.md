## What this app does

The UI (`src/routes/+page.svelte`) calls backend routes in `src/routes/api/*`.
By default, the only enabled route is `/api/openai` (see `src/constants/ROUTES.ts`).

## Required env (default setup)

Create a `.env` file in the repo root and set:

- **`SECRET_OPENAI_KEY`**: your OpenAI API key.

This powers `src/routes/api/openai/+server.ts` which streams responses back to the browser via SSE.

## Optional env (only if you enable extra routes)

### Custom OpenAI-compatible endpoint (`/api/gpt` and `/api/sse`)

If you switch `src/constants/ROUTES.ts` to use `/api/gpt` (POST) or `/api/sse` (GET), set:

- **`SECRET_API_URL`**
  - For `/api/gpt`: should be a *chat completions* URL (e.g. `.../v1/chat/completions`)
  - For `/api/sse`: should be the base of a server that supports `GET /chat?...` as implemented by this project
- **`SECRET_API_KEY`**: bearer token used by `/api/gpt`

### Status probe (`/api/status`)

If you use `/api/status`, set:

- **`SECRET_STATUS_URL`**: any URL that responds (the route returns `response.status`).

### Fallback route (`/api/fallback`)

If you add `/api/fallback` to `src/constants/ROUTES.ts`, set:

- **`SECRET_FALLBACK_API_URL`**: OpenAI-compatible base URL (e.g. `https://api.openai.com/v1`)
- **`SECRET_FALLBACK_API_KEY`**: API key for that endpoint


