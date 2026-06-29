# Architecture — Kerala Health Portal

*Status: Phase 0. Additive edits only.*

---

## 1. Principles

- **Kerala-first, scalable later.** Single-region deploy now; design assumes horizontal scale and multi-region later.
- **Mobile-first.** Performance budget tuned for low-end Android on patchy networks.
- **Malayalam-first.** Locale and font handling are first-class, not an afterthought.
- **Boring, proven tech.** No exotic dependencies. JavaScript only.
- **Safety by construction.** Diagnosis/prescription paths do not exist in the data model or APIs.
- **Additive only.** Schema and infra evolve forward; nothing destructive.

---

## 2. Monorepo

```
apps/
  web/      Patient-facing public site (Next.js App Router)
  portal/   Doctor & hospital portal (Next.js)
  admin/    Internal admin dashboard (Next.js)
packages/
  ui/       Shared React components (Tailwind, mobile-first)
  config/   Shared ESLint, Tailwind, build config
  utils/    Pure shared utilities (no side effects)
services/
  auth/     OTP, JWT, refresh tokens, middleware
  db/       PostgreSQL pool, migrations, demo seed
  cache/    Redis helpers
  search/   Query builders (PG full-text → OpenSearch later)
  notifications/ SMS, email, templating
  ai-assistant/  Claude API client, RAG, safety rails
infra/
  docker/   Local + deploy container definitions
  scripts/  Operational scripts
```

Managed with **pnpm workspaces**.

---

## 3. Runtime topology

```
                 ┌──────────────┐
   Mobile/Web ──▶│  CDN / Edge  │
                 └──────┬───────┘
                        ▼
        ┌───────────────────────────────┐
        │  Next.js apps (web/portal/admin)│
        │  App Router · SSR/ISR · API     │
        └───────┬───────────────┬────────┘
                ▼               ▼
        ┌──────────────┐ ┌──────────────┐
        │ PostgreSQL 15│ │   Redis 7    │
        │  primary     │ │ cache+session│
        │  + PHR schema│ │ + BullMQ     │
        └──────────────┘ └──────┬───────┘
                                ▼
                        ┌──────────────┐
                        │ BullMQ worker│
                        │ notif · jobs │
                        └──────────────┘

  External: Anthropic API · SMS gateway · AWS SES · S3/R2 · NMC registry
```

---

## 4. Data layer

- **PostgreSQL 15+** is the system of record.
- UUID primary keys (`uuid_generate_v4()`).
- Every table carries `id`, `created_at`, `updated_at`, `deleted_at` (soft delete).
- **PHR (patient health records)** isolated in a **separate schema** with **row-level security**.
- Sensitive columns (mobile, email, DOB) **encrypted at column level**.
- Migrations: numbered plain-SQL in `services/db/migrations/`, **additive only** — never drop tables or columns.
- Seeds idempotent (`ON CONFLICT DO NOTHING`); demo seed only via `pnpm db:seed:demo`.

---

## 5. Caching, sessions, queues

- **Redis 7+** for cache, rate-limit counters, refresh-token store, and BullMQ backing.
- **BullMQ** workers handle async work: SMS/email dispatch, search indexing, verification pipelines, AI logging.

---

## 6. Search

- Phase 0–4: **PostgreSQL full-text** with GIN indexes on name/specialty tsvectors.
- Phase 5+: migrate to **OpenSearch** for scale.
- Must support **Malayalam script** and **Manglish** (Roman transliteration) — transliteration normalisation at index and query time.

---

## 7. Auth

- **Mobile OTP** login (Kerala SMS gateway primary, Twilio fallback).
- **JWT access token** (15 min) + **refresh token** (30 days, Redis-backed, revocable).
- Role-based access control (roles in [AGENTS.md](../../AGENTS.md) §8).

---

## 8. AI assistant

- `services/ai-assistant/` wraps the Anthropic API (`claude-haiku-20241022`).
- Hardcoded system prompt; user input sanitised against prompt injection.
- RAG retrieves top 5 **published, editorially-approved** KB articles; sources cited.
- Every interaction logged to `ai_interaction_log`; rate-limited 20/user/hour.
- Guardrails: [AI_SAFETY.md](../ai-safety/AI_SAFETY.md).

---

## 9. API conventions

- Versioned under `/api/v1/...`.
- Envelope: `{ data, meta, errors }`.
- List endpoints paginated (`?page=1&limit=20`).
- Authenticated by default. Public endpoints rate-limited 20 req/min/IP; authed 100 req/min/user.

---

## 10. Localisation

- Default locale `ml`; routes `/ml/...` and `/en/...`.
- Noto Sans Malayalam bundled — never system-font fallback.

---

## 11. Observability

- Structured logs, request IDs, audit trail for verification and publish actions.
- AI interactions auditable end-to-end.

---

## 12. Scalability path

1. Vertical scale PG; read replicas for directory/search reads.
2. Move search to OpenSearch (Phase 5).
3. Stateless app tier behind load balancer; Redis cluster.
4. Multi-region read replicas for India expansion.

---

*Architecture v1.0 · additive edits only.*
