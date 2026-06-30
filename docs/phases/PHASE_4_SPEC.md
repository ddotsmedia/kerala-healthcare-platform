# Phase 4 — Healthcare Jobs Portal

**Duration:** 2 weeks
**Status:** ⬜ Not started
**Prerequisite:** Phase 3 complete and all smoke tests passing

---

## What This Phase Builds

- Job listings: employer posts vacancies with requirements
- Candidate profiles: healthcare professionals showcase qualifications
- Application flow: apply → employer reviews → shortlist → offer
- Employer dashboard: manage listings, review applications
- Candidate dashboard: track applications, saved jobs
- Job search: role, specialty, district, employment type, experience

---

## Phase 4 Deliverables

| Deliverable | Definition of Done |
|---|---|
| Job listings live | Employer can post, edit, and close a job listing |
| Candidate profile | Healthcare professional creates profile with qualifications and experience |
| Apply flow | Candidate applies, employer sees application, contact protected until shortlisted |
| Job search | Search by role, district, employment type returns correct results |
| Dashboards | Employer and candidate dashboards show correct data |
| Notifications | Candidate notified on application status change |

---

## Claude Code Prompt — Phase 4

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNIVERSAL PROMPT LAW — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Fully autonomous. Never pause, never ask, never confirm.
• On ambiguity: pick best default, log 1-line in BLOCKERS.md.
• On errors: fix and continue. Never stop.
• NEVER touch: ayurconnect, ddots-erp, wa-crm,
  healthportal, ddotshop, ddotsmediajobs.
• NEVER run pnpm db:seed. Only: pnpm db:seed:demo.
• Additive migrations only. Never drop tables/columns.
• Always ON CONFLICT DO NOTHING in inserts.
• Build + commit after each phase. Conventional commits.
• Mobile-first. TypeScript forbidden. No new npm packages
  unless zero alternatives exist.
• Default AI model: claude-haiku everywhere.
• No verbose comments, no re-reads, batch writes per file.
• File >400 lines: split into sub-components.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Kerala Healthcare Platform
PHASE: 4 — Healthcare Jobs Portal
PREREQUISITE: Phase 3 complete and all smoke tests passing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build the Healthcare Careers module — a two-sided marketplace
connecting employers (hospitals, clinics) with healthcare professionals.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 TASKS — execute in order, commit after each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 4.1 — Jobs schema
Migrations:
• employer_profiles
  (id uuid PK, user_id uuid FK users, org_name TEXT NOT NULL,
   org_type VARCHAR(50), district_id uuid FK districts,
   description TEXT, website TEXT, logo_url TEXT,
   verified BOOLEAN DEFAULT false,
   created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ)
• job_listings
  (id uuid PK, slug VARCHAR(255) UNIQUE, employer_id uuid FK employer_profiles,
   title TEXT NOT NULL, role_category VARCHAR(100),
   specialty_id uuid FK specialties NULLABLE,
   description TEXT, requirements TEXT,
   district_id uuid FK districts,
   employment_type VARCHAR(30), — full_time|part_time|contract|locum
   experience_years_min INT DEFAULT 0,
   salary_min INT, salary_max INT, — optional
   application_deadline DATE,
   status VARCHAR(20) DEFAULT 'active', — active|closed|draft
   created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ,
   deleted_at TIMESTAMPTZ)
• candidate_profiles
  (id uuid PK, user_id uuid FK users, slug VARCHAR(255) UNIQUE,
   role_category VARCHAR(100), specialty_id uuid FK specialties NULLABLE,
   experience_years INT, district_id uuid FK districts,
   headline TEXT, summary TEXT,
   resume_url TEXT, linkedin_url TEXT,
   is_open_to_work BOOLEAN DEFAULT true,
   created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ)
• candidate_education (id, candidate_id, degree, institution, year)
• candidate_experience (id, candidate_id, employer, role, from_year, to_year)
• job_applications
  (id uuid PK, job_id uuid FK job_listings, candidate_id uuid FK candidate_profiles,
   cover_letter TEXT, status VARCHAR(30) DEFAULT 'applied',
   — applied|shortlisted|interview|offered|rejected|withdrawn
   status_changed_at TIMESTAMPTZ, employer_notes TEXT,
   created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ)
• Seed:demo — 3 employers, 10 job listings, 5 candidate profiles
• Commit: feat(jobs): healthcare jobs portal schema

TASK 4.2 — Jobs search and public pages
services/search/jobs.js — buildJobQuery(filters):
  title text search, role_category, district_id, specialty_id,
  employment_type, experience_years_min, status='active'
apps/web/src/app/[locale]/jobs/page.js — job listings feed
apps/web/src/app/[locale]/jobs/[slug]/page.js — job detail (SSR)
  Schema.org: JobPosting structured data in JSON-LD
  Apply CTA — requires login
apps/web/src/app/[locale]/candidates/[slug]/page.js
  — candidate public profile (visible to employers only after shortlist)
• Commit: feat(jobs): job listings search and public pages with SEO

TASK 4.3 — Application API
POST /api/jobs/:id/apply            { cover_letter }
  — candidate only, one application per job (ON CONFLICT DO NOTHING)
GET  /api/jobs/:id/applications     — employer only, own listings
PATCH /api/jobs/applications/:id/status { status, notes }
  — employer: shortlist, interview, offer, reject
POST /api/jobs/applications/:id/withdraw — candidate withdraws
• Contact protection: candidate mobile/email hidden until status=shortlisted
• On status change: notify candidate via SMS + in-app notification
• Commit: feat(jobs): application flow with contact protection

TASK 4.4 — Employer dashboard
apps/web/src/app/[locale]/employer/page.js — overview: active listings, new apps
apps/web/src/app/[locale]/employer/listings/page.js — manage own listings
apps/web/src/app/[locale]/employer/listings/new/page.js — post new job
apps/web/src/app/[locale]/employer/listings/[id]/page.js — edit listing
apps/web/src/app/[locale]/employer/listings/[id]/applications/page.js
  — application pipeline: columns by status, update status inline
• Requires employer_profile. Redirect to create profile if missing.
• Commit: feat(jobs): employer dashboard and application management

TASK 4.5 — Candidate dashboard
apps/web/src/app/[locale]/candidate/page.js
  — overview: active applications, saved jobs
apps/web/src/app/[locale]/candidate/profile/page.js — edit own profile
apps/web/src/app/[locale]/candidate/applications/page.js
  — application history with status timeline
apps/web/src/app/[locale]/candidate/saved/page.js — saved job listings
• Commit: feat(jobs): candidate dashboard with application tracking

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMOKE TESTS — verify before closing session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Employer posts job listing → appears in public search
□ Job detail page has JobPosting JSON-LD structured data
□ Candidate applies → employer sees application
□ Employer shortlists candidate → candidate's contact becomes visible
□ Candidate receives SMS on application status change
□ Employer closes listing → it disappears from public search
□ Apply twice to same job — second attempt silently ignored (ON CONFLICT)
```
