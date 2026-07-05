# P-A9 — Mental Health Centres

**Track:** Track A — Healthcare Directory
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
FEATURE: P-A9 — Mental Health Centres
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Psychiatry/psychology centre directory.
Must include de-addiction and rehabilitation centres.
Extra care: compassionate language, crisis numbers prominent.

SCHEMA (additive migrations)
Migration 0048 — mental_health_centres table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  type VARCHAR(50),
  -- hospital|clinic|rehab|deaddiction|ngo|counselling
  address_ml TEXT, address_en TEXT,
  district_id uuid FK districts,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  phone TEXT[], emergency_phone TEXT,
  email TEXT, website TEXT,
  services TEXT[],
  -- psychiatry|psychology|counselling|
  --  deaddiction|rehabilitation|group_therapy
  has_inpatient BOOLEAN DEFAULT false,
  inpatient_beds INT,
  has_emergency BOOLEAN DEFAULT false,
  is_govt_approved BOOLEAN DEFAULT false,
  consultation_fee_inr INT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed 3 demo centres (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/mental-health-centres/page.js
  CRISIS BANNER (non-dismissable, always visible):
  "iCall: 9152987821 · Vandrevala: 1860-2662-345"
  Types: All · Psychiatry · Psychology ·
    Counselling · De-addiction · Rehabilitation
  MentalHealthCentreCard: compassionate design,
    services badges, emergency availability

apps/web/app/[locale]/mental-health-centres/[slug]/page.js
  Services grid, inpatient info, emergency availability
  Linked psychiatrists/psychologists
  Disclaimer: non-stigmatising language

Smoke tests:
  GET /ml/mental-health-centres returns 200
  Crisis banner visible
  De-addiction filter works


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
