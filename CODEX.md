# CODEX.md — OpenAI Codex Agent Instructions

> Read by OpenAI Codex / Codex-style agents at the start of every task.
> This file mirrors the binding rules in [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md).
> If any instruction here conflicts with AGENTS.md, **AGENTS.md wins.**

---

## Project

**Kerala Health Portal** — Kerala-first digital healthcare ecosystem. Malayalam-first, English secondary. Enterprise-grade, India-expansion ready.

---

## Non-negotiable laws

- **Fully autonomous.** Never pause, never ask, never confirm. On ambiguity: pick best default, log one line in `BLOCKERS.md`. On errors: fix and continue.
- **No medical diagnosis.** No clinical diagnosis, no treatment recommendation — in any feature, copy, or UI.
- **No fake medical claims.** Every health statement must be verifiable and editorially approved.
- **AI guides only.** The assistant never prescribes or diagnoses; it redirects to a qualified professional and surfaces emergency numbers (`112`, ambulance `108`).
- **Verification mandatory.** No doctor or hospital is listed without verification.
- **Additive only.** Never delete files, never drop tables or columns. `ON CONFLICT DO NOTHING` on inserts.
- **NEVER touch other VPS projects:** `ayurconnect` · `ddots-erp` · `wa-crm` · `healthportal` · `ddotshop` · `ddotsmediajobs`.
- **NEVER run** `pnpm db:seed`. Only safe seed command: `pnpm db:seed:demo`.

---

## Language & code rules

- **JavaScript only — TypeScript forbidden.** Use JSDoc for type hints.
- **No new npm packages** unless zero alternative exists; log any addition in `BLOCKERS.md`.
- **No magic numbers** — name all constants.
- **No commented-out code** — use feature flags.
- **No raw string concatenation in SQL** — parameterised queries only.
- File max **400 lines**. Function max **50 lines**. Nesting max **3 levels**.
- Minimal token usage: no verbose comments, no re-reads, batch writes per file.

---

## Localisation

- Primary **Malayalam (`ml`)** — default locale for all new users.
- Secondary **English (`en`)**.
- URL pattern `/ml/...` and `/en/...`.
- Font: Noto Sans Malayalam — never fall back to system font.
- Search supports both Malayalam script and Manglish (Roman transliteration).

---

## Stack (do not substitute)

Next.js 14+ App Router · JavaScript · Tailwind (mobile-first) · PostgreSQL 15+ · Redis 7+ · BullMQ · pnpm · GitHub Actions. AI model `claude-haiku-20241022`.

---

## Database rules

- All primary keys UUID (`uuid_generate_v4()`).
- Every table: `id`, `created_at`, `updated_at`, `deleted_at` (soft delete).
- Migrations: plain numbered SQL in `services/db/migrations/`.
- Additive only — never drop. Always `ON CONFLICT DO NOTHING` in seeds.
- Sensitive fields (mobile, email, DOB) encrypted at column level.
- Patient health records in a separate schema with row-level security.

---

## API rules

- Routes under `/api/v1/...`.
- Response envelope `{ data, meta, errors }`.
- All list endpoints paginated (`?page=1&limit=20`).
- Authenticated by default; public endpoints rate-limited (20 req/min/IP); authed (100 req/min/user).

---

## Commit convention

```
<type>(<scope>): <subject>
type:  feat | fix | docs | style | refactor | perf | test | chore | ci
scope: auth | directory | appointments | cms | search | ai | jobs |
       notifications | admin | portal | db | ui | config
```

Build and commit after each phase.

---

## When unsure

Do not ask. Pick the best default consistent with these rules, log it in `BLOCKERS.md` under `[ASSUMPTION]`, and continue.

---

*Kerala Health Portal · Codex Agent Contract v1.0*
