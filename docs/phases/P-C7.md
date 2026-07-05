# P-C7 — Second Opinion Feature

**Track:** Track C — Patient Experience
**Priority:** 🟡 High
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
FEATURE: P-C7 — Second Opinion Feature
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Patient requests second opinion from another specialist
on the same condition/diagnosis.

SCHEMA (additive migrations)
Migration 0077 — second_opinion_requests table:
  id uuid PK,
  patient_id uuid FK users NOT NULL,
  requesting_doctor_id uuid FK healthcare_providers
    NULLABLE,
  -- referring doctor
  condition_description TEXT NOT NULL,
  existing_diagnosis TEXT,
  existing_treatment TEXT,
  urgency VARCHAR(20) DEFAULT 'routine',
  -- routine|soon|urgent
  preferred_specialty_id uuid FK specialties,
  preferred_district_id uuid FK districts NULLABLE,
  documents JSONB[],
  -- list of attached health record IDs
  status VARCHAR(20) DEFAULT 'open',
  -- open|matched|completed|cancelled
  matched_doctor_id uuid FK healthcare_providers
    NULLABLE,
  appointment_id uuid FK appointments NULLABLE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

PAGES
apps/web/app/[locale]/second-opinion/page.js
  — "Get a Second Opinion"
  — What it is: educational intro
  — "Request Second Opinion" form:
    Describe condition, existing diagnosis,
    existing treatment, select specialty,
    select district, attach health records,
    urgency level
  — After submit: platform matches to available
    specialist (manual or auto-suggest)
  — Patient sees matched doctors with "Book" CTA

API ROUTES
POST /api/second-opinion — create request
GET  /api/second-opinion/my — patient's requests
PATCH /api/second-opinion/[id] — update request

ADMIN
  apps/admin/app/second-opinion/page.js
  — Queue of open requests
  — Manually match to appropriate specialist
  — Auto-suggest: query doctors by specialty+district

Smoke tests:
  Create second opinion request → appears in queue
  Admin can match to doctor
  Patient notified when matched
  Booking CTA leads to doctor's booking page


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
