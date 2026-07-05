# P-A4 — Ambulance Providers Directory

**Track:** Track A — Healthcare Directory
**Priority:** 🔴 Critical
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
FEATURE: P-A4 — Ambulance Providers Directory
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Build ambulance provider directory. Kerala has both
government (108) and private ambulance services.
Emergency-first design — page must work offline-first.

SCHEMA (additive migrations)
Migration 0043 — ambulance_providers table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  type VARCHAR(50),
  -- government|private|ngo|hospital-based
  phone TEXT[] NOT NULL,
  whatsapp_number VARCHAR(15),
  district_id uuid FK districts,
  coverage_districts TEXT[],
  -- districts they serve
  address_ml TEXT, address_en TEXT,
  is_24hr BOOLEAN DEFAULT true,
  ambulance_types TEXT[],
  -- basic|advanced|icu|nicu|mortuary|air
  has_oxygen BOOLEAN DEFAULT false,
  has_ventilator BOOLEAN DEFAULT false,
  has_cardiac_monitor BOOLEAN DEFAULT false,
  has_trained_paramedic BOOLEAN DEFAULT false,
  base_fare_inr INT,
  per_km_fare_inr INT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed 5 demo providers (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/ambulance/page.js
  EMERGENCY-FIRST DESIGN:
  — Top section: hardcoded government numbers
    "🚑 108 (Free government ambulance — Kerala)"
    "📞 112 (National emergency)"
  — Then: private providers list
  — Filters: district, ambulance type (ICU/NICU/basic)
  — AmbulanceCard: name, phone (large), type badges,
    coverage area, 24hr badge

apps/web/app/[locale]/ambulance/[slug]/page.js
  — Profile: types of ambulances, equipment,
    coverage area map link, fares if provided
  — "Call Now" primary CTA

API ROUTES
GET /api/ambulance?district=&type=&q=
GET /api/ambulance/[slug]

EMERGENCY PAGE UPDATE
  Add ambulance section to /emergency page:
  "🚑 Find an Ambulance" card → /ml/ambulance

Smoke tests:
  GET /ml/ambulance returns 200
  Government 108 number visible above the fold
  ICU filter works
  Profile page renders correctly


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
