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
- [FIXED] Search vector population WIRED into the write path: `apps/portal/lib/profile.js → updateProfile` repopulates `search_ml`/`search_manglish` via `@khp/search` `doctorVectorUpdate` in the same transaction as each profile save. Hospital editor will wire `hospitalVectorUpdate` identically. (A one-off backfill for pre-existing rows can reuse the same helpers if needed.)

## Session: 2026-06-30 — Phase 1 missing pieces (ui, portal, vector wiring)

### Assumptions
- [ASSUMPTION] `docs/phases/PHASE_1_SPEC.md` does NOT exist in the repo (referenced but never created). Could not read/reconcile against it — did not fabricate its contents. Built the three explicitly-named deliverables instead: `packages/ui/components/directory/`, `apps/portal` doctor profile management, and tsvector write-path wiring.
- [ASSUMPTION] `packages/ui` components are presentational and locale-agnostic (labels passed as props) to avoid duplicating the locale-bound cards already in `apps/web`. No existing web component was copied or replaced.
- [ASSUMPTION] `apps/portal` (port 3001) assumes the authenticated doctor; until Phase 2 auth, the doctor id is read from `PORTAL_DEMO_DOCTOR_ID`. Doctors cannot self-verify or self-publish — those fields are not editable in the portal.
- [ASSUMPTION] Added `next`/`react`/`react-dom` for `apps/portal`; `@khp/ui` has a react peer dep only. Workspace deps via `workspace:*`.

### Errors fixed
- (none)

### Needs human decision
- (none new)

### Needs human decision
- [FIXED] NMC verification (Phase 1): MANUAL cross-check. A `verification_agent` looks up the registration number on the NMC public search portal, then records `nmc_checked`/`nmc_match` + evidence in `provider_verifications`. Automated NMC API integration deferred to a future phase.
- [FIXED] Specialty taxonomy: 12 seeded specialties accepted for Phase 1 launch. More can be added later via additive migration (new INSERT ... ON CONFLICT DO NOTHING) without disrupting existing data.

## Session: 2026-06-30 — Hospital editor + demo seed

### Assumptions
- [ASSUMPTION] `files.zip` in repo root contains the 6 phase spec docs + a README (project files, not junk) — LEFT in place, not deleted, not committed. The specs were never unzipped into `docs/phases/` (still missing).
- [ASSUMPTION] Hospital editor mirrors the doctor editor: status fields read-only (no self-verify/self-publish), `hospitalVectorUpdate` wired into the same transaction as each save. `PORTAL_DEMO_HOSPITAL_ID` stand-in until Phase 2 auth.
- [ASSUMPTION] Implemented a real demo seed (`services/db/seed-demo.js`, `pnpm db:seed:demo`): runs migrations, inserts 3 verified+published doctors and 2 hospitals with `ON CONFLICT (slug) DO NOTHING`, then populates search vectors. Replaces the Phase-0 echo placeholder.
- [ASSUMPTION] Added `@khp/search` as a dependency of `services/db` (the seed imports it). Ran `pnpm install` — 35 packages linked, `pnpm-lock.yaml` committed.

### Errors fixed
- [FIXED] `db:seed:demo` was a no-op echo placeholder — replaced with a working additive seed.
- [FIXED] Seed `ERR_MODULE_NOT_FOUND @khp/search` from `services/db` — added the workspace dep + reinstalled.

### Needs human decision
- [NEEDS DECISION] Could NOT confirm the demo seed POPULATES data in this environment: no PostgreSQL (`psql`/`pg_ctl` absent), Docker daemon not running, `DATABASE_URL` unset. The seed runs correctly up to the connection step. To verify: set `DATABASE_URL` to a running Postgres 15 and run `pnpm db:seed:demo`.

---

## Session: 2026-06-30 — Phase 1 gap closure (spec reconciliation)

### Item 1 — schema reconciliation
- [ASSUMPTION] `healthcare_providers` reconciled as a VIEW over `doctors` (migration 0015), not a rename or data-copy table. `view.id == doctors.id` so existing junctions stay valid; added `provider_id` (= `doctor_id`) to the three junctions for spec-shape parity. `doctors` remains the physical write table; `type` column carries doctor|nurse|physio|psychologist. Chosen over a duplicate copy table to avoid dual-write drift.
- [ASSUMPTION] DEVIATION from spec: hospitals `phone`/`email` kept as ENCRYPTED `phone_enc`/`email_enc` (SECURITY.md column-level encryption) instead of the spec's plaintext `phone TEXT[]`/`email TEXT`. Added only non-sensitive spec fields (`type`, `icu_beds`, `nicu_beds`, `website`).
- [ASSUMPTION] `hospital_services.service_slug` added with a CHECK catalogue (mri|ct|icu|nicu|dialysis|ivf|cath_lab|...); existing free-text `name_ml/name_en` kept (no drop).
- [ASSUMPTION] `specialties.parent_id` and `districts.slug` from the spec NOT added yet (not required by the gap list items); can be additive later if needed.

---

*Kerala Health Portal · Universal Prompt Law · Claude Code Engineering Kit v1.0*
