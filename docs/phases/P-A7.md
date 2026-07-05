# P-A7 — Eye Hospitals Directory

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
FEATURE: P-A7 — Eye Hospitals Directory
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Dedicated ophthalmology centre directory.
Eye hospitals, cataract surgery centres, optical shops.

SCHEMA (additive migrations)
Migration 0046 — eye_centres table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  type VARCHAR(50), -- hospital|clinic|optical_shop
  address_ml TEXT, address_en TEXT,
  district_id uuid FK districts,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  phone TEXT[], email TEXT, website TEXT,
  surgeries_offered TEXT[],
  -- cataract|lasik|glaucoma|retina|cornea|squint
  equipment TEXT[],
  -- oct|slit_lamp|field_analyser|fundus_camera
  has_optical_shop BOOLEAN DEFAULT false,
  has_low_vision_clinic BOOLEAN DEFAULT false,
  has_pediatric_ophthalmology BOOLEAN DEFAULT false,
  consultation_fee_inr INT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed 3 demo eye centres (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/eye-hospitals/page.js
apps/web/app/[locale]/eye-hospitals/[slug]/page.js
  Schema.org: MedicalOrganization JSON-LD
  Surgeries grid, equipment list
  Linked ophthalmologists from provider DB

Smoke tests:
  GET /ml/eye-hospitals returns 200
  Profile page renders with surgeries grid


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
