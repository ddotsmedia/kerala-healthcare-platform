# Phase 1 — Healthcare Directory · Completion Report

*Generated 2026-06-30. Reconciles the build against `PHASE_1_SPEC.md`.*
*Status: build + smoke complete. NOT yet tagged `v0.2.0-directory` (awaiting confirmation).*

Verified against a local Postgres 15 (`khp-demo-pg`, port 5439), migrations 0001–0016 applied, `pnpm db:seed:demo` loaded (11 doctors, 5 hospitals, 10 departments, 3 facilities).

---

## Spec deliverables (DoD table)

| Deliverable | Status | Evidence |
|---|---|---|
| Doctor schema live (10 doctors seeded) | ✅ Done | migrations 0004 + 0015 (`healthcare_providers` view); seed = 11 doctors across 5 districts |
| Hospital schema live (hospitals, departments, services) | ✅ Done | 0005/0009/0010/0013/0014; seed = 5 hospitals, 10 departments |
| Search working (name, specialty, district, ml+en) | ✅ Done | `services/search`; district + specialty indexed into vectors; verified `cardiology`→4, `thrissur`→2, `ഹൃദ്രോഗ`→4 |
| Public pages live (SSR doctor + hospital profile) | ✅ Done | `apps/web` `/[locale]/doctors/[slug]`, `/hospitals/[slug]` → HTTP 200 SSR |
| SEO tags (Lighthouse SEO ≥ 90 on doctor profile) | ✅ Done | **Lighthouse SEO 100/100** |
| Verification queue (admin can verify) | ✅ Done | `apps/admin` queue + approve/reject; verified approve→`verified`+`nmc_verified` |
| Portal profile edit (edits reflect publicly) | 🟡 Partial | Edit→public visibility verified; **login itself not built (Phase 2 auth)** — `PORTAL_DEMO_DOCTOR_ID` stand-in |

---

## Tasks 1.1–1.7

| Task | Status | Notes |
|---|---|---|
| 1.1 Provider schema | ✅ Done | `doctors` + `healthcare_providers` VIEW (additive, no rename); `provider_specialties`/`provider_education` with `provider_id` |
| 1.2 Hospital schema | ✅ Done | hospitals + departments + services (`service_slug`) + accreditations + `hospital_providers` |
| 1.3 Search service | ✅ Done | `manglish.js` dictionary, `buildDoctorSearch`/`buildHospitalSearch` (all filters), `searchAll()` |
| 1.4 Public pages (SSR) | ✅ Done | Schema.org `Physician`/`Hospital`/`MedicalWebPage` JSON-LD; non-dismissable disclaimer (112/108) |
| 1.5 Directory components | ✅ Done | `@khp/ui`: DoctorCard, HospitalCard, SpecialtyFilter, DistrictFilter, ConsultationModeFilter, VerificationBadge, ConsultationModeChip, Pagination |
| 1.6 Verification queue (admin) | 🟡 Partial | Queue UI + REST routes (queue/approve/reject{reason}) + audit via `provider_verifications`; **RBAC is a placeholder (`x-khp-role`)** until Phase 2 auth |
| 1.7 Portal profile mgmt | 🟡 Partial | Profile + education + hospital affiliations + REST routes + re-verification rule; **login is Phase 2** |

---

## Smoke checklist — ALL 8 PASS

| # | Check | Result |
|---|---|---|
| 1 | `/ml/doctors` renders Malayalam | ✅ PASS |
| 2 | `/ml/doctors/[slug]` renders + JSON-LD | ✅ PASS |
| 3 | `/ml/hospitals/[slug]` renders | ✅ PASS |
| 4 | search "cardiology" → cardiologists | ✅ PASS (4) |
| 5 | search "thrissur" → Thrissur providers | ✅ PASS (2) |
| 6 | manglish "vaidyan"/"kaliveedu" → results | ✅ PASS (1 each) |
| 7 | admin queue loads + approve works | ✅ PASS |
| 8 | doctor edits bio → visible publicly | ✅ PASS (login via stand-in; real auth = Phase 2) |
| + | Lighthouse SEO ≥ 90 (doctor profile) | ✅ PASS (100) |

**All 8 smoke items pass.** (Item 8's login uses the `PORTAL_DEMO_DOCTOR_ID` stand-in; OTP/JWT login is Phase 2.)

---

## Final quality gates
- `pnpm build` — web, admin, portal all exit 0.
- `pnpm lint` — web, admin, portal: no ESLint warnings or errors.

---

## Deviations & deferrals (all logged in BLOCKERS.md)
- **`healthcare_providers`** = a VIEW over `doctors` (additive reconciliation; no rename/drop). `doctors` is the physical table; `type` carries provider types.
- **Encryption:** hospital/doctor phone/email kept ENCRYPTED (`*_enc`) per SECURITY.md instead of the spec's plaintext fields.
- **Auth/RBAC:** admin RBAC + portal login are placeholders until Phase 2 (OTP/JWT). REST routes guard via `x-khp-role` header for now.
- **Path:** apps use `app/` (not the spec's `src/app/`), consistent with the existing tree.
- **Not added** (not required by closed gaps): `specialties.parent_id`, `districts.slug`.
- **Search:** tsvector kept `simple`/exact-token; trailing anusvara/visarga normalized in the Manglish dictionary. Full Malayalam stemming deferred.
- **Bonus:** clinic + diagnostic-centre listings (`facilities`, migration 0016) — spec line 13.

---

## Not done (Phase 2+)
- OTP/JWT auth, real session-based RBAC, `verified_by` capture.
- Facility profile pages (listings only for now).
- Full Malayalam text-search stemming.

**Recommendation:** ready to tag `v0.2.0-directory` once the auth-dependent partials (1.6 RBAC, 1.7 login) are explicitly accepted as Phase 2 scope. Awaiting confirmation before tagging.
