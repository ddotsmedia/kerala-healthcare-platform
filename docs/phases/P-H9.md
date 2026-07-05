# P-H9 — Health Insurance Integration

**Track:** Track H — Infrastructure
**Priority:** 🟢 Normal
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
FEATURE: P-H9 — Health Insurance Integration
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Display health insurance panel information on
doctor and hospital profiles.

SCHEMA (additive migrations)
Migration 0121 — insurance_panels table:
  id uuid PK,
  entity_type VARCHAR(20), -- doctor|hospital
  entity_id uuid NOT NULL,
  insurer_name TEXT NOT NULL,
  policy_types TEXT[],
  -- cashless|reimbursement|both
  network_type VARCHAR(50),
  -- preferred|empanelled|not_in_network
  max_cashless_limit_inr INT,
  notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()

Seed insurance data for demo doctors/hospitals
with common insurers: Star Health, HDFC Ergo,
New India, National Insurance, United India

PAGES
Update doctor profile:
  "Insurance Accepted" section
  List of insurance companies with icons
  Cashless / reimbursement badge

Update hospital profile:
  Same insurance section
  "PMJAY / Ayushman Bharat" prominent badge if applicable

SEARCH FILTER
  Add insurance filter to doctor/hospital search:
  "Insurance: [dropdown of major insurers]"

Smoke tests:
  Doctor profile shows insurance section
  Insurance filter in search works
  PMJAY badge shows on eligible hospitals


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
