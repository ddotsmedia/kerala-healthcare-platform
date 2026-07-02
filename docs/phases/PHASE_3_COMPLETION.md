# Phase 3 — Health Knowledge Centre · Completion Report

*Reconciles the build against `PHASE_3_SPEC.md` (+ the pre-Phase-3 Task 3.0 auth directive). Verified against local Postgres 15 (`khp-demo-pg`, port 5439), migrations 0001–0026 applied, demo data seeded.*
*Status: build + smoke complete. NOT tagged — awaiting confirmation.*

---

## Task 3.0 — Real OTP/JWT auth (prerequisite directive)

| Item | Status | Evidence |
|---|---|---|
| Real OTP into services/auth/otp.js | ✅ Done | hashed codes, 5-min TTL, SMS delivery |
| Real JWT + refresh rotation into services/auth/jwt.js | ✅ Done | HS256 (node crypto), 15-min access, 30-day rotating refresh |
| Replace PATIENT_DEMO_USER_ID / PORTAL_DEMO_DOCTOR_ID with session reads | ✅ Done | web `currentPatientId`, portal `currentDoctorId` (via `doctors.user_id`), admin role from JWT |
| Protected routes enforce 401 without a token | ✅ Done | HTTP: unauth→401, login→200, logout→401 |
| Commit `feat(auth): real OTP/JWT auth replacing all demo stubs` | ✅ Done | commit `6a0f061` |

Deviation: Redis unavailable → OTP + refresh tokens persisted in Postgres (swappable). Cross-app SSO not implemented (per-app cookie). Both logged in BLOCKERS.

---

## Spec deliverables (DoD)

| Deliverable | Status | Evidence |
|---|---|---|
| CMS live (create → submit → publish) | ✅ Done | editorial workflow verified end-to-end; editor≠publisher enforced |
| Disease library — 20 pages ml+en, full structure | ✅ Done | 20 `content_items` (disease) + 20 `disease_details` |
| Symptom navigator — 10 symptoms → specialties | ✅ Done | 10 symptoms, 10 mappings, urgency levels |
| Articles feed — pagination, category filter, locale | ✅ Done | `/[locale]/health` |
| Calculators — BMI + due date (+ water) | ✅ Done | `/[locale]/tools/*`, mobile-first, Malayalam labels |
| Disclaimers — visible, non-dismissable, all health pages | ✅ Done | `KnowledgeDisclaimer` on health/disease/symptom pages; no close control |

---

## Tasks 3.1–3.7

| Task | Status | Commit |
|---|---|---|
| 3.1 CMS schema + seed | ✅ | `de75569` |
| 3.2 Editorial workflow API (role-gated) | ✅ | `a82db15` |
| 3.3 Admin CMS interface | ✅ | `5e6f440` |
| 3.4 Disease library schema + seed 20 | ✅ | `8de150f` |
| 3.5 Symptom navigator | ✅ | `68ebf89` |
| 3.6 Public knowledge pages (SSR + SEO) | ✅ | `e0aa2f6` |
| 3.7 Health calculators | ✅ | `a1403f4` |

---

## Smoke checklist — ALL PASS

| # | Check | Result |
|---|---|---|
| 1 | editor create → submit → approve → publish | ✅ PASS (editor blocked from approve/publish) |
| 2 | published article at /ml/health/[slug] with disclaimer | ✅ PASS |
| 3 | disease page has JSON-LD MedicalWebPage | ✅ PASS |
| 4 | symptom "fever" → specialties + find-doctor CTA | ✅ PASS (+ "not a diagnosis") |
| 5 | BMI calculator result in Malayalam | ✅ PASS |
| 6 | disclaimer visible + non-dismissable on all health pages | ✅ PASS (no close control) |
| 7 | CMS review queue shows in_review to reviewer | ✅ PASS (status filter + review page) |

---

## Quality gates
- `pnpm build` — web, admin, portal all exit 0.
- `pnpm lint` — web, admin, portal: no ESLint warnings or errors.

---

## Migrations added
0023 auth (mobile_hash, otp_codes, refresh_tokens) · 0024 CMS · 0025 disease_details · 0026 symptoms.

## Deviations & deferrals (logged in BLOCKERS.md)
- OTP/refresh persisted in Postgres (Redis not running).
- Real SMS/email delivery + BullMQ scheduling remain infra (carried from Phase 2).
- No cross-app SSO (per-app login/cookie).
- Rich-text editor is a textarea (Markdown-style), per spec "no new npm packages".
- Apps use `app/` not `src/app/` (accepted permanent).
