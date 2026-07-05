# P-B4 — Candidate Search for Recruiters

**Track:** Track B — Jobs Portal
**Priority:** 🔴 Critical
**Project:** malayalidoctor.com (kerala-healthcare-platform)
**VPS:** 194.164.151.202

---

## How to execute

1. Open Claude Code in VS Code
2. First message: `Read CLAUDE.md and confirm rules`
3. Second message: paste everything from the line below

---

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
• Build + commit after each task. Conventional commits.
• Mobile-first. TypeScript forbidden. No new npm packages
  unless zero alternatives exist.
• Default AI model: claude-haiku everywhere.
• No verbose comments, no re-reads, batch writes per file.
• File >400 lines: split into sub-components.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Kerala Healthcare Platform — malayalidoctor.com
FEATURE: P-B4 — Candidate Search for Recruiters
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Allow employers/recruiters to search verified
candidate profiles. This makes the platform a
true two-sided healthcare recruitment marketplace.

PRIVACY DESIGN:
  Contact details hidden until employer requests access.
  Candidate can set profile to private.
  All candidate searches logged for audit.

SCHEMA (additive migrations)
Migration 0058:
  ALTER TABLE candidate_profiles
    ADD COLUMN IF NOT EXISTS is_searchable BOOLEAN
      DEFAULT true,
    ADD COLUMN IF NOT EXISTS headline TEXT,
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS current_location
      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS preferred_districts
      TEXT[],
    ADD COLUMN IF NOT EXISTS preferred_job_types
      TEXT[],
    ADD COLUMN IF NOT EXISTS expected_salary_min INT,
    ADD COLUMN IF NOT EXISTS notice_period_days INT,
    ADD COLUMN IF NOT EXISTS profile_views INT
      DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

Migration 0059 — recruiter_contact_requests:
  id uuid PK,
  employer_id uuid FK employer_profiles,
  candidate_id uuid FK candidate_profiles,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  -- pending|accepted|rejected
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

SEARCH SERVICE
services/search/candidates.js:
  buildCandidateQuery(filters):
    role_category, specialty_id, district_id,
    experience_years_min/max, job_type,
    expected_salary_max, is_searchable=true
  Returns: candidate headline, role, experience,
    district, skills — NO contact info

API ROUTES (employer auth required)
GET /api/employer/candidates?specialty=&district=&exp=
GET /api/employer/candidates/[id]
  — returns profile WITHOUT contact info
POST /api/employer/candidates/[id]/request-contact
  — sends contact request to candidate
  — candidate notified by email

GET /api/candidate/contact-requests
  — candidate sees who wants to contact them
PATCH /api/candidate/contact-requests/[id]
  — accept (reveals contact) or reject

PAGES
apps/web/app/[locale]/employer/candidates/page.js
  — Search with filters
  — CandidateCard: headline, role, experience,
    district, skills (NO phone/email)
  — "View Profile" → full candidate profile
  — "Request Contact" button

apps/web/app/[locale]/employer/candidates/[id]/page.js
  — Full candidate profile (no contact details)
  — "Request Contact" CTA

apps/web/app/[locale]/candidate/contact-requests/page.js
  — Pending requests with employer details
  — Accept/Reject with one click

Smoke tests:
  Employer searches candidates → no contact shown
  Contact request sent → candidate sees notification
  Candidate accepts → employer gets contact details
  Private profile not appearing in search


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOY TO VPS AFTER COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SSH into 194.164.151.202
cd /opt/kerala-healthcare-platform
git pull origin main
docker compose -f infra/docker/docker-compose.prod.yml \
  --env-file .env.production up -d --build
Verify: curl -I https://malayalidoctor.com/ml/[new-route]
Report: commit hash, migration count, live URL check.
```
