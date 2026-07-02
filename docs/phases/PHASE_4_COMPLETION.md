# Phase 4 — Healthcare Jobs Portal · Completion Report

*Reconciles the build against `PHASE_4_SPEC.md`. Verified against local Postgres 15 (`khp-demo-pg`, port 5439), migrations 0001–0029 applied, demo data seeded.*
*Status: build + smoke complete. NOT tagged — holding for confirmation.*

---

## Spec deliverables (DoD)

| Deliverable | Status | Evidence |
|---|---|---|
| Job listings live (post/edit/close) | ✅ Done | employer dashboard CRUD; close hides from search |
| Candidate profile | ✅ Done | candidate profile create/edit + education/experience schema |
| Apply flow (contact protected until shortlist) | ✅ Done | apply → employer view → contact revealed only at shortlisted+ |
| Job search (role/district/type) | ✅ Done | `buildJobQuery`; active-only |
| Dashboards (employer + candidate) | ✅ Done | overview, listings, applications, saved |
| Notifications on status change | ✅ Done | in-app `notifications` row + SMS (simulated) |

---

## Tasks 4.1–4.5

| Task | Status | Commit |
|---|---|---|
| 4.1 Jobs schema + seed (3 employers/10 jobs/5 candidates) | ✅ | `f77672e` |
| 4.2 Jobs search + public pages (JobPosting JSON-LD) | ✅ | `1ad7f3e` |
| 4.3 Application API (contact protection + notify) | ✅ | `fc04144` |
| 4.4 Employer dashboard | ✅ | `38e3955` |
| 4.5 Candidate dashboard | ✅ | `b549de7` |

---

## Smoke checklist — ALL 7 PASS (live DB + HTTP)

| # | Check | Result |
|---|---|---|
| 1 | employer job appears in public search | ✅ PASS |
| 2 | job detail has JobPosting JSON-LD | ✅ PASS |
| 3 | candidate applies → employer sees application | ✅ PASS |
| 4 | employer shortlists → candidate contact becomes visible | ✅ PASS (contact_visible false→true) |
| 5 | candidate notified on status change (SMS + in-app) | ✅ PASS (in-app row + SMS simulated) |
| 6 | employer closes listing → gone from public search | ✅ PASS |
| 7 | apply twice → second ignored (ON CONFLICT) | ✅ PASS (duplicate flagged) |

---

## Quality gates
- `pnpm build` — web, admin, portal all exit 0.
- `pnpm lint` — web, admin, portal: no ESLint warnings or errors.

---

## Migrations added
0027 jobs (employer_profiles, job_listings, candidate_profiles, candidate_education/experience, job_applications) · 0028 in-app notifications · 0029 saved_jobs.

## Deviations & deferrals (logged in BLOCKERS.md)
- **Roles:** employer/candidate capability is by profile-row existence (employer_profiles / candidate_profiles), NOT a `users.role` enum change (additive-safe — the CHECK constraint is not altered).
- **Contact protection:** candidate resume/linkedin are revealed to the employer at shortlisted+; real encrypted mobile/email decrypt-on-shortlist is deferred (candidates hold no plaintext contact yet).
- SMS delivery simulated (no gateway); in-app notification is real.
- Apps use `app/` not `src/app/` (accepted permanent).
