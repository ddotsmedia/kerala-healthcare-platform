# BLOCKERS.md — Kerala Health Portal

> This file is maintained automatically by Claude Code during every session.
> Claude Code writes here instead of asking questions.
> Review this file after each session and resolve NEEDS DECISION items before starting the next phase.
> Do not delete this file.

---

## How to read this file

| Tag | Meaning |
|---|---|
| `[ASSUMPTION]` | Claude Code picked a default and continued — review if needed |
| `[FIXED]` | An error was encountered and resolved automatically |
| `[NEEDS DECISION]` | Cannot be auto-resolved — human must decide before next phase |

---

## Session Log

<!-- Claude Code appends new sessions below this line -->

## Session: 2026-06-29 — Phase 0 Foundation (AI-agent repository)

### Assumptions
- [ASSUMPTION] `CLAUDE.md` already existed (comprehensive, v1.0). Kept as-is per no-delete/additive rule instead of overwriting from the task list.
- [ASSUMPTION] Repo slug/URL assumed `Ddotsmedia/kerala-healthcare-platform` for README CI badge (matches git user + folder name).
- [ASSUMPTION] CI lint/test/install steps set `continue-on-error: true` for Phase 0 since no app code, lockfile, or package.json exists yet; tightened in later phases.
- [ASSUMPTION] Default AI model recorded as `claude-haiku-20241022` per existing CLAUDE.md (not the platform default elsewhere).
- [ASSUMPTION] Docs marked "additive edits only" and dated to today's locale context.

### Errors fixed
- (none)

### Needs human decision
- [FIXED] GitHub repo slug confirmed: `ddotsmedia/kerala-healthcare-platform`. CI badge URL updated.
- [NEEDS DECISION] Legal review of COMPLIANCE.md (DPDP timelines, DPO appointment, data-residency) before launch.

## Session: 2026-06-30 — Phase 0 scaffolding completion

### Assumptions
- [ASSUMPTION] Created monorepo directory skeleton (apps/packages/services/infra) with `.gitkeep` so the structure documented in ARCHITECTURE.md physically exists. No app code inside.
- [ASSUMPTION] Added `.env.example` mirroring the env list in CLAUDE.md (placeholders only) — `.gitignore` already allowlists it.
- [ASSUMPTION] Added root `package.json` + `pnpm-workspace.yaml` with ZERO dependencies. Scripts are Phase-0 placeholders (echo). Deliberately omitted any `db:seed` script — only `db:seed:demo` exists.
- [ASSUMPTION] Recorded production VPS `194.164.151.202` as deploy target in ARCHITECTURE.md §12 (record-only, no connection made).

### Errors fixed
- (none)

### Needs human decision
- (none new)

## Session: 2026-06-30 — Phase 1 Healthcare Directory (DB foundation)

### Assumptions
- [ASSUMPTION] "PASTE INTO CLAUDE CODE — PHASE 1" arrived with header only, no spec body. Per Universal Prompt Law (never ask), built Phase 1 from the ROADMAP/CLAUDE.md definition: provider data model + mandatory verification + NMC gate + SEO slugs + Malayalam/Manglish search.
- [ASSUMPTION] Scoped this slice to the DB foundation (additive migrations 0001–0006) + DATA_MODEL.md. App/API/UI for the directory are the next sub-step, not built yet.
- [ASSUMPTION] Seeded reference data (14 districts, 12 specialties) inside migrations with ON CONFLICT DO NOTHING — additive, idempotent. Specialties are a taxonomy only, NOT diagnostic categories.
- [ASSUMPTION] Publish gate enforced by DB triggers in addition to app layer: a doctor/hospital cannot be 'published' unless verified (doctor also needs nmc_verified).
- [ASSUMPTION] Sensitive contact stored as bytea (mobile_enc/email_enc/phone_enc), encrypted app-layer via pgcrypto. Plaintext never stored.

### Errors fixed
- (none)

### Packages added (logged per rule)
- [ASSUMPTION] Added `pg` (node-postgres) in `services/db/package.json` — zero-alternative PostgreSQL driver for Node. Required by the migration runner and app data access.
- [ASSUMPTION] Added `next`, `react`, `react-dom` in `apps/web/package.json` — mandated stack (CLAUDE.md), zero-alternative for the Next.js App Router. Plus `tailwindcss`/`autoprefixer`/`postcss` config (dev styling). Workspace deps `@khp/db`, `@khp/search` via `workspace:*`.
- [ASSUMPTION] Added `next`, `react`, `react-dom` in `apps/admin/package.json` (port 3002) for the verification UI. Same mandated stack.

### Phase 1 build notes
- [ASSUMPTION] Admin verification UI assumes the request is already an authenticated `verification_agent` / `platform_admin`. Auth/session + `verified_by` capture land in Phase 2 (OTP/JWT). For now `verified_by` is recorded as null.
- [ASSUMPTION] `lockfileVersion`/install not run in this environment; package.jsons declare deps for CI/dev. `pnpm install` needed before `pnpm dev`/`build` succeed.
- [NEEDS DECISION] Search vector population: tsvectors (`search_ml`/`search_manglish`) are populated by `services/search` helpers on provider create/update — needs wiring into the (future) provider write/CMS path, or a backfill job.

### Needs human decision
- [FIXED] NMC verification (Phase 1): MANUAL cross-check. A `verification_agent` looks up the registration number on the NMC public search portal, then records `nmc_checked`/`nmc_match` + evidence in `provider_verifications`. Automated NMC API integration deferred to a future phase.
- [FIXED] Specialty taxonomy: 12 seeded specialties accepted for Phase 1 launch. More can be added later via additive migration (new INSERT ... ON CONFLICT DO NOTHING) without disrupting existing data.

---

*Kerala Health Portal · Universal Prompt Law · Claude Code Engineering Kit v1.0*
