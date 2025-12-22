# Mehdi GPT - ChatGPT Interface

> **© 2024 Mehdi** - All rights reserved

A beautiful ChatGPT-style interface built with SvelteKit, featuring real-time streaming responses and a modern UI inspired by OpenAI's ChatGPT.

## Project Structure

This repo contains **two** Svelte projects:

- **Root app (this folder)**: the SvelteKit Chat UI (`src/routes/...`). This is the main application.
- `my-svelte-app/`: a separate Vite + Svelte starter template (not used by the chat app).

## Run the SvelteKit chat app (root)

1) Install dependencies:

```bash
cd "/Users/a/Desktop/svelte project/sveltekit-chatGPT-main"
npm install
```

If you previously tried installing and it failed, do a clean install:

```bash
rm -rf node_modules package-lock.json
npm install
```

2) Create a `.env` file in the repo root with your OpenAI API key:

```bash
SECRET_OPENAI_KEY="sk-your-actual-openai-api-key-here"
```

**⚠️ Important:** You need a **real API key** from OpenAI. Get one at: https://platform.openai.com/api-keys

The keys you might find in GitHub repos are usually fake/example keys and won't work.

3) Start dev server:

```bash
npm run dev
```

## Env vars

See `DOCS/setup.md` for all supported env vars and what each route uses.


