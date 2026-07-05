# P-B7 — Interview Scheduling

**Track:** Track B — Jobs Portal
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
FEATURE: P-B7 — Interview Scheduling
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Employer proposes interview slots, candidate confirms.
No external calendar integration needed — internal system.

SCHEMA (additive migrations)
Migration 0062 — interview_schedules table:
  id uuid PK,
  application_id uuid FK job_applications NOT NULL,
  employer_id uuid FK employer_profiles,
  candidate_id uuid FK candidate_profiles,
  proposed_slots JSONB NOT NULL,
  -- [{"date":"2026-07-10","time":"10:00",
  --    "mode":"video","link":"..."},...]
  confirmed_slot JSONB,
  status VARCHAR(20) DEFAULT 'proposed',
  -- proposed|confirmed|rescheduled|cancelled
  employer_notes TEXT,
  candidate_notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

API ROUTES
POST /api/jobs/applications/[id]/interview
  — employer proposes up to 3 slots
  — candidate notified by email with confirm link
PATCH /api/jobs/interviews/[id]/confirm
  — candidate confirms one slot
  — both parties notified
PATCH /api/jobs/interviews/[id]/reschedule
  — either party can request reschedule

PAGES
In employer application detail:
  "Schedule Interview" button → modal:
  Propose up to 3 date/time/mode options
  Video link field (Jitsi/Meet/Zoom URL)
  Notes field

Candidate side:
  apps/web/app/[locale]/candidate/interviews/page.js
  — List of pending/confirmed interviews
  — Confirm slot → email confirmation sent
  — Add to calendar link (ics file download)

Smoke tests:
  Employer proposes slots → candidate sees them
  Candidate confirms → both get email
  ICS file downloads with correct event details


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
