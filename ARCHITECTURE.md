# Architecture

## Layers

**Frontend** (`frontend/`) — Next.js 15 App Router. Pages call FastAPI exclusively through
`lib/api.ts`'s `useApi()` hook (attaches the Clerk session JWT) and TanStack Query hooks in
`lib/hooks/*` — no page ever constructs a fetch call inline. Shared UI primitives live in
`components/ui/` (shadcn-style), cross-page composites (`PageHeader`, `EmptyState`,
`DocumentStatusBadge`) in `components/dashboard/`.

**Backend** (`backend/app/`):
- `api/routes/*` — HTTP layer only: parse request, call a service/model, shape the response.
- `services/*` — business logic with no HTTP awareness (chunking, cleaning, metadata
  extraction, retrieval/RAG, billing quotas, rate limiting).
- `ai/*` — provider-agnostic LLM/embedding abstraction (see below).
- `models/*` — SQLAlchemy ORM, one file per domain entity.
- `tasks/*` — Celery tasks, split by resource profile (`ingestion` queue = CPU-bound,
  `embedding` queue = API-bound), sharing stage/failure-handling via `services/pipeline_status.py`.

## Where SOLID shows up concretely

- **Single Responsibility** — extraction (`services/extractors/`), cleaning (`services/cleaning.py`),
  metadata (`services/metadata.py`), and chunking (`services/chunking.py`) are separate modules
  precisely because the pipeline treats them as separate stages with independent failure modes.
- **Open/Closed** — adding a file type means adding one class to `services/extractors/` and
  one entry in `services/extractors/registry.py`; nothing else changes. Same for AI providers
  (`ai/registry.py`) — a new provider is a new class implementing `ai/base.py`'s `LLMProvider`
  or `EmbeddingProvider`, never an `if provider == "x"` branch in business logic.
- **Liskov Substitution** — every `LLMProvider`/`EmbeddingProvider` implementation
  (`ai/providers/*`) is interchangeable through the same two-method interface; `services/rag.py`
  and the ingestion tasks never know which one they're holding.
- **Interface Segregation** — `LLMProvider` and `EmbeddingProvider` are separate interfaces
  because not every provider implements both (Anthropic has no embeddings endpoint).
- **Dependency Inversion** — routes depend on FastAPI `Depends(...)` seams
  (`get_auth_context`, `get_db`, `rate_limit(...)`), not on concrete implementations; which
  AI provider or embedding model runs is resolved at call time from org settings
  (`Organization.resolved_llm_provider()`), never hardcoded in a route or task.

## Multi-tenancy

Every domain table carries `org_id`. Identity is Clerk (humans) or a hashed API key
(integrations) — see `api/deps.py`'s `AuthContext`. Clerk orgs/users are lazily mirrored into
local `organizations`/`users` rows on first request (no webhook dependency).

## Document pipeline

```
Upload (API route) → process_document_version (queue: ingestion)
  OCR → Cleaning → Metadata extraction → Chunking
  → embed_and_index_document_version (queue: embedding)
    Embedding → Keyword indexing (Postgres generated tsvector, automatic)
    → Hybrid search indexing → Ready
```
Retry re-runs from the top but is non-destructive to already-embedded chunks; the embedding
stage specifically is idempotent (only embeds chunks lacking an `Embedding` row), so a retry
after a transient API failure resumes rather than redoing completed work.

## Retrieval

`services/rag.py` runs vector search (pgvector cosine distance) and keyword search (Postgres
full-text, `ts_rank`) in parallel, then fuses the two ranked lists via Reciprocal Rank Fusion —
not a weighted average of raw scores, since cosine similarity and `ts_rank` aren't on
comparable scales.

## What's intentionally not abstracted further

Routes query SQLAlchemy directly rather than through a repository layer. For a codebase this
size, with FastAPI's own `Depends()` already providing the seams needed for testing and
substitution, an additional repository layer would be indirection without a corresponding
problem — the threshold for introducing one is when query logic starts repeating across routes
or when swapping the underlying datastore becomes a real, planned requirement. Neither is true
here yet.
