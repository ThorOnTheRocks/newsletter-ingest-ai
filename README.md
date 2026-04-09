# Newsletter AI Assistant

A backend-first multi-agent prototype for ingesting newsletters and articles, generating structured summaries, extracting insights and actions, storing memory with embeddings, and answering follow-up questions over stored content.

## Apps

- `apps/api`: Express + TypeScript API
- `apps/web`: Next.js client

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Start the backend:

```bash
npm run dev --workspace @newsletter-ai-assistant/api
```

4. Start the frontend in another terminal:

```bash
npm run dev --workspace @newsletter-ai-assistant/web
```

## Postgres Rollout

The API supports two storage backends:

- `STORAGE_BACKEND=json` keeps using the local `documents.json` file
- `STORAGE_BACKEND=postgres` uses Postgres through Drizzle

For the first hosted setup, use Supabase Postgres with `pgvector` enabled.

### Environment

Add these fields to `apps/api/.env` when using Postgres:

```bash
STORAGE_BACKEND=postgres
DATABASE_URL=postgresql://...
DATABASE_SSL=true
```

### Database steps

1. Enable the `vector` extension in Supabase.
2. Run the initial migration:

```bash
npm run db:migrate --workspace @newsletter-ai-assistant/api
```

3. Import the current JSON data if needed:

```bash
npm run db:import-json --workspace @newsletter-ai-assistant/api
```

The import script is idempotent for existing document ids and is intended for a cautious cutover from local JSON to Postgres.

## First Deployment

- Deploy `apps/api` to Render
- Deploy `apps/web` to Vercel
- Use Supabase Postgres for persistent storage

Render API env vars:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `EMBEDDING_MODEL`
- `STORAGE_BACKEND=postgres`
- `DATABASE_URL`
- `DATABASE_SSL=true`
- `CLIENT_ORIGIN`

Vercel web env vars:

- `NEXT_PUBLIC_API_URL`

## Demo Flow

1. Paste a newsletter or article into the client.
2. Ingest it to generate a summary, insights, and actions.
3. Open a stored document from the history list.
4. Ask a follow-up question grounded in stored content.
