# P-F8 — Doctor Referral Network

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
FEATURE: P-F8 — Doctor Referral Network
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Doctor refers patient to specialist with one click.
Tracks referral outcome.

SCHEMA (additive migrations)
Migration 0110 — referral_letters table:
  id uuid PK,
  referring_doctor_id uuid FK healthcare_providers,
  referred_to_doctor_id uuid FK healthcare_providers,
  patient_id uuid FK users NOT NULL,
  reason TEXT NOT NULL,
  clinical_summary TEXT,
  urgency VARCHAR(20) DEFAULT 'routine',
  appointment_id uuid FK appointments NULLABLE,
  -- original appointment that triggered referral
  referred_appointment_id uuid FK appointments,
  -- appointment booked with specialist
  status VARCHAR(20) DEFAULT 'sent',
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

PAGES
Doctor portal (appointment/patient detail):
  "Refer to Specialist" button
  → Search specialist by name or specialty
  → Write referral reason + clinical summary
  → Select urgency
  → Patient notified to book with specialist
  → Specialist sees referral note in their portal

Specialist portal:
  Referral notification: "Dr. [Name] referred
    [Patient] to you — view referral"
  After consultation: update referral outcome

API ROUTES
POST /api/portal/referrals
GET  /api/portal/referrals/sent
GET  /api/portal/referrals/received
PATCH /api/portal/referrals/[id]/outcome

Smoke tests:
  Doctor creates referral → specialist notified
  Patient notified to book with specialist
  Specialist can update outcome


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
