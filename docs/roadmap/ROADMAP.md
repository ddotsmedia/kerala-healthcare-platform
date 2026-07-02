# Roadmap — Kerala Health Portal

*Status: Phase 0. Additive edits only.*

Kerala-first, scalable later. Each phase ends with a clean build and a conventional commit. Status updated at the end of each phase.

---

## Phase table

| Phase | Name | Status | Git Tag |
|---|---|---|---|
| 0 | Foundation & Infrastructure | ✅ Complete | — |
| 1 | Healthcare Directory | ✅ Complete | v0.2.0-directory |
| 2 | Appointments & Patient Portal | ✅ Complete | v0.3.0-appointments |
| 3 | Health Knowledge Centre | ✅ Complete | v0.4.0-knowledge |
| 4 | Healthcare Jobs Portal | ✅ Complete | v0.5.0-jobs |
| 5 | AI Assistant & Platform Scale | ⬜ Not started | — |

---

## Phase 0 — Foundation & Infrastructure

**Goal:** an AI-agent-ready enterprise repository. No application features yet.

- Repository scaffolding, agent contracts, governance docs.
- README, CLAUDE.md, CODEX.md, AGENTS.md.
- PRD, Architecture, Security, Compliance, AI-Safety, Roadmap docs.
- CI pipeline (lint + test) and `.gitignore`.
- No application code, no database migrations yet.

**Exit:** docs and CI in place; foundation committed.

---

## Phase 1 — Healthcare Directory

**Goal:** verified, searchable, SEO-ready directory of doctors and hospitals.

- Provider data model (additive migrations).
- **Mandatory verification** workflow; NMC registry cross-check for doctors.
- Public profiles with Schema.org (`Physician`, `Hospital`, `MedicalWebPage`).
- Search: PostgreSQL full-text; Malayalam script + Manglish.
- Malayalam-first UI; `/ml` and `/en` routes.

**Exit:** verified providers listed; Lighthouse SEO ≥ 90 on directory pages.

---

## Phase 2 — Appointments & Patient Portal

**Goal:** patients book verified providers; manage their own data.

- OTP auth; JWT + refresh tokens.
- Slot booking with **double-booking prevention** under concurrency.
- Patient portal; PHR in isolated RLS schema.
- DPDP consent flows (access, correction, erasure).

**Exit:** end-to-end booking; patient data rights satisfiable.

---

## Phase 3 — Health Knowledge Centre

**Goal:** trustworthy, editorially-approved health information.

- CMS with **editor ≠ publisher** separation of duties.
- Non-dismissable medical disclaimer on every health page.
- Sourced, versioned content in Malayalam and English.
- No diagnostic tools.

**Exit:** approved articles live; disclaimers enforced.

---

## Phase 4 — Healthcare Jobs Portal

**Goal:** verified healthcare hiring for Kerala.

- Verified employers; `JobPosting` structured data.
- Jobseeker profiles and applications.
- Search and filters (district, role, specialty).

**Exit:** verified jobs live; applications working.

---

## Phase 5 — AI Assistant & Platform Scale

**Goal:** safe AI guidance + scale-out.

- AI health assistant (`claude-haiku-20241022`) with full guardrails ([AI_SAFETY.md](../ai-safety/AI_SAFETY.md)).
- RAG over approved KB; source citation; emergency redirect; AI-generated labelling.
- Search migration to OpenSearch.
- Read replicas / multi-region groundwork for India expansion.

**Exit:** AI assistant passes safety self-check; platform horizontally scalable.

---

## Cross-cutting (every phase)

- Additive only — never drop or delete.
- Build + conventional commit at phase end.
- Assumptions/errors logged in [BLOCKERS.md](../../BLOCKERS.md).
- Mobile-first, Malayalam-first, verification-first, safety-first.

---

*Roadmap v1.0 · additive edits only.*
