# P-F6 — Digital Prescription

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
FEATURE: P-F6 — Digital Prescription
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Doctor writes digital prescription in portal,
patient sees it in their PHR immediately.

SCHEMA
Uses existing prescriptions table.
Add:
Migration 0108:
  ALTER TABLE prescriptions
    ADD COLUMN IF NOT EXISTS created_by_doctor_id
      uuid FK healthcare_providers NULLABLE,
    ADD COLUMN IF NOT EXISTS is_digital
      BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS digital_signature TEXT;
    -- doctor's digital signature (optional)

PAGES
apps/portal/app/schedule/appointments/[id]/
  prescription/page.js
  — "Write Prescription"
  — Patient info (read-only)
  — Add medications:
    Drug name, dosage, frequency, duration, notes
  — Additional instructions
  — Next visit date
  — "Issue Prescription" button
  → Creates prescription record linked to
    appointment, patient_id set
  → Patient notified: "New prescription available"

Patient side:
  Prescription appears in
  /patient/prescriptions automatically
  Tagged as "Digital" prescription

Smoke tests:
  Doctor issues prescription → appears in patient PHR
  Patient notified by email
  Prescription shows digital badge
  Medications list searchable in patient PHR


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
