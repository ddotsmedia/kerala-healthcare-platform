# P-F7 — Lab Result Sharing

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
FEATURE: P-F7 — Lab Result Sharing
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Doctor shares lab result interpretation with patient.
Adds context to raw lab numbers.

SCHEMA (additive migrations)
Migration 0109 — lab_interpretations table:
  id uuid PK,
  provider_id uuid FK healthcare_providers NOT NULL,
  patient_id uuid FK users NOT NULL,
  lab_report_id uuid FK lab_reports NULLABLE,
  appointment_id uuid FK appointments NULLABLE,
  interpretation TEXT NOT NULL,
  recommendations TEXT,
  next_test_date DATE,
  urgency VARCHAR(20) DEFAULT 'routine',
  -- routine|soon|urgent
  is_shared_with_patient BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()

PAGES
Doctor portal (appointment detail):
  "Interpret Lab Results" button
  → Form: select lab report (from patient's records
    shared with this doctor), write interpretation,
    recommendations, next test date
  → Notification to patient

Patient side:
  Lab report detail shows doctor interpretation
  if shared

Smoke tests:
  Doctor adds interpretation → appears in patient lab report
  Patient notified
  Urgent interpretations highlighted in red


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
