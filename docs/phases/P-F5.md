# P-F5 — Patient Management

**Track:** Track F — Provider Tools
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
FEATURE: P-F5 — Patient Management
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Doctor's patient list with history, notes,
and follow-up reminders.

SCHEMA (additive migrations)
Migration 0106 — patient_notes table:
  id uuid PK,
  provider_id uuid FK healthcare_providers NOT NULL,
  patient_id uuid FK users NOT NULL,
  appointment_id uuid FK appointments NULLABLE,
  note TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'clinical',
  -- clinical|follow_up|lab_instruction|alert
  is_private BOOLEAN DEFAULT true,
  -- private to doctor, not shown to patient
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Migration 0107 — follow_up_reminders table:
  id uuid PK,
  provider_id uuid FK healthcare_providers NOT NULL,
  patient_id uuid FK users NOT NULL,
  due_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  -- pending|sent|completed|dismissed
  created_at TIMESTAMPTZ DEFAULT now()

PAGES
apps/portal/app/patients/page.js
  — List of all patients who booked with this doctor
  — Search by name, date of last visit
  — PatientRow: name, last visit, total visits,
    upcoming appointments, notes icon

apps/portal/app/patients/[patientId]/page.js
  — Patient: appointment history timeline
  — Add clinical note
  — Set follow-up reminder
  — View patient's shared health records
    (only records patient has is_shared=true)

apps/portal/app/follow-ups/page.js
  — Follow-ups due this week
  — Mark as completed, dismiss, reschedule

API ROUTES
GET /api/portal/patients
GET /api/portal/patients/[id]
POST/GET /api/portal/patients/[id]/notes
POST /api/portal/follow-ups

Smoke tests:
  Patient appears in list after booking
  Note added → visible in patient timeline
  Follow-up reminder appears in follow-ups list


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
