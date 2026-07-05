# P-A6 — Dental Clinics Directory

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
FEATURE: P-A6 — Dental Clinics Directory
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Dedicated dental clinic directory. Dental searches are
extremely common — "dentist near me", "root canal Kochi".

SCHEMA (additive migrations)
Migration 0045 — dental_clinics table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  address_ml TEXT, address_en TEXT,
  district_id uuid FK districts,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  phone TEXT[], email TEXT, website TEXT,
  registration_number VARCHAR(100),
  treatments_offered TEXT[],
  -- cleaning|filling|root_canal|implant|braces|
  --  whitening|extraction|pediatric|orthodontics
  has_digital_xray BOOLEAN DEFAULT false,
  has_rct BOOLEAN DEFAULT false,
  has_implants BOOLEAN DEFAULT false,
  has_orthodontics BOOLEAN DEFAULT false,
  has_pediatric_dental BOOLEAN DEFAULT false,
  sterilisation_standard VARCHAR(100),
  consultation_fee_inr INT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed 5 demo dental clinics (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/dental/page.js
  — Filters: treatments, district, has implants,
    has orthodontics, pediatric dental
  — DentalCard: name, treatments badges,
    rating, district

apps/web/app/[locale]/dental/[slug]/page.js
  — Full clinic profile with treatments grid
  — Dentists list (from healthcare_providers
    where specialty = dentistry, district match)
  — Schema.org: Dentist JSON-LD
  — Disclaimer

SEO PAGES
  apps/web/app/[locale]/dental/[district]/page.js
  — "Dentists in [District]" — high search value

Smoke tests:
  GET /ml/dental returns 200
  Implants filter works
  Profile renders with treatment grid
  District SEO page renders


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
