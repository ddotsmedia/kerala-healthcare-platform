# P-D3 — Blood Donation Registry

**Track:** Track D — Growth & Engagement
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
FEATURE: P-D3 — Blood Donation Registry
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Register as a blood donor, get alerts when blood
is needed in your district. Community feature.

SCHEMA (additive migrations)
Migration 0086 — blood_donors table:
  id uuid PK,
  user_id uuid FK users NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  district_id uuid FK districts NOT NULL,
  last_donation_date DATE,
  is_available BOOLEAN DEFAULT true,
  notify_by_email BOOLEAN DEFAULT true,
  notify_by_sms BOOLEAN DEFAULT false,
  medical_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

Migration 0087 — blood_requests table:
  id uuid PK,
  requester_id uuid FK users,
  hospital_name TEXT,
  blood_group VARCHAR(5) NOT NULL,
  units_needed INT DEFAULT 1,
  district_id uuid FK districts NOT NULL,
  contact_phone TEXT NOT NULL,
  urgency VARCHAR(20) DEFAULT 'urgent',
  is_fulfilled BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()

PAGES
apps/web/app/[locale]/donate-blood/page.js
  — "Blood Donation — Save Lives"
  — Benefits of donating: educational
  — Eligibility checklist (age, weight, health)
  — "Register as Donor" form: blood group,
    district, availability, contact preferences
  — Active blood requests near you (by district)
  — "Request Blood" form for those in need

API ROUTES
POST /api/blood-donors/register
PATCH /api/blood-donors/availability
GET  /api/blood-requests?district=&blood_group=
POST /api/blood-requests

ALERT ENGINE
  When new blood_request created:
  Find available donors in same district
    with matching blood group
  Send email: "Urgent: [blood group] needed
    at [hospital], [district]"
  Rate limit: max 1 alert per donor per day

Smoke tests:
  Register as donor → appears in system
  Create blood request → matching donors alerted
  Donor can toggle availability
  District filter returns correct requests


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
