# P-C9 — Prescription Refill Request

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
FEATURE: P-C9 — Prescription Refill Request
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Patient requests repeat prescription from same doctor.
Common for chronic conditions (diabetes, hypertension).

SCHEMA (additive migrations)
Migration 0079 — refill_requests table:
  id uuid PK,
  patient_id uuid FK users NOT NULL,
  doctor_id uuid FK healthcare_providers NOT NULL,
  original_prescription_id uuid FK prescriptions
    NULLABLE,
  medications_requested JSONB NOT NULL,
  -- list of medication names and dosages
  reason TEXT,
  urgency VARCHAR(20) DEFAULT 'routine',
  status VARCHAR(20) DEFAULT 'pending',
  -- pending|approved|rejected|dispatched
  doctor_notes TEXT,
  new_prescription_id uuid FK prescriptions NULLABLE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

PAGES
Patient side:
  apps/web/app/[locale]/patient/refill/page.js
  — List previous prescriptions with "Request Refill"
  — Select medications to refill
  — Add notes
  — Submit → doctor notified

Doctor portal:
  apps/portal/app/refills/page.js
  — Queue of pending refill requests
  — View patient history
  — Approve (creates new prescription) or reject
  — Approved → patient notified

API ROUTES
POST /api/patient/refill-requests
GET  /api/patient/refill-requests
GET  /api/portal/refill-requests
PATCH /api/portal/refill-requests/[id]
  { status, doctor_notes }

Smoke tests:
  Patient requests refill → doctor sees in portal
  Doctor approves → new prescription created
  Patient notified of approval/rejection


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
