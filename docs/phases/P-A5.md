# P-A5 — AYUSH & Ayurveda Directory

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
FEATURE: P-A5 — AYUSH & Ayurveda Directory
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Dedicated AYUSH directory: Ayurveda, Homeopathy, Yoga,
Naturopathy, Siddha, Unani. Kerala is famous for Ayurveda —
this section should be especially detailed.

SCHEMA (additive migrations)
Migration 0044 — ayush_centres table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  type VARCHAR(50),
  -- ayurveda|homeopathy|yoga|naturopathy|siddha|unani
  address_ml TEXT, address_en TEXT,
  district_id uuid FK districts,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  phone TEXT[], email TEXT, website TEXT,
  registration_number VARCHAR(100),
  -- AYUSH department registration
  specialisations TEXT[],
  -- panchakarma|kizhi|shirodhara|rasayana|...
  treatments_offered TEXT[],
  accommodation_available BOOLEAN DEFAULT false,
  accommodation_beds INT,
  has_pharmacy BOOLEAN DEFAULT false,
  -- in-house Ayurveda pharmacy
  is_kerala_tourism_approved BOOLEAN DEFAULT false,
  consultation_fee_inr INT,
  treatment_package_price_inr INT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed 5 demo AYUSH centres (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/ayush/page.js
  — Tabs: All · Ayurveda · Homeopathy · Yoga ·
    Naturopathy · Siddha
  — Filters: district, treatment type,
    accommodation, Kerala Tourism approved
  — AyushCard: name, type badge, specialisations,
    rating, accommodation badge

apps/web/app/[locale]/ayush/[slug]/page.js
  — Full profile: treatments, specialisations,
    accommodation details, registration
  — Panchakarma treatments grid with descriptions
  — Doctors/practitioners affiliated
  — Schema.org: MedicalOrganization JSON-LD
  — Non-dismissable disclaimer:
    "AYUSH treatments should complement, not replace
    modern medical care for serious conditions.
    Always inform your doctor about AYUSH treatments."

apps/web/app/[locale]/ayurveda/page.js
  — Dedicated Ayurveda landing page
  — Featured Panchakarma centres
  — "What is Ayurveda" educational section
  — Kerala tourism Ayurveda packages intro

NAV
  Add AYUSH to main nav under Hospitals

Smoke tests:
  GET /ml/ayush returns 200 with type tabs
  Ayurveda filter shows only Ayurveda centres
  Profile page renders with all sections
  Disclaimer visible


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
