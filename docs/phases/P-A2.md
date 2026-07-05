# P-A2 — Pharmacy Directory

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
FEATURE: P-A2 — Pharmacy Directory
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Build a pharmacy directory. "24-hour pharmacy near me" and
"generic medicine shop" are high-frequency Kerala searches.

SCHEMA (additive migrations)
Migration 0041 — pharmacies table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  type VARCHAR(50), -- retail|hospital|online|generic
  address_ml TEXT, address_en TEXT,
  district_id uuid FK districts,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  phone TEXT[], email TEXT,
  is_24hr BOOLEAN DEFAULT false,
  has_delivery BOOLEAN DEFAULT false,
  delivery_radius_km INT,
  sells_generic BOOLEAN DEFAULT false,
  has_cold_storage BOOLEAN DEFAULT false,
  -- for vaccines, insulin
  operating_hours JSONB,
  verification_status VARCHAR(20) DEFAULT 'pending',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed 5 demo pharmacies (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/pharmacies/page.js
  — Search with filters: 24hr, delivery, generic,
    district, open now
  — PharmacyCard: name, 24hr badge, delivery badge,
    generic badge, district, phone

apps/web/app/[locale]/pharmacies/[slug]/page.js
  — Profile: name, badges, hours, phone, address,
    services offered
  — Nearby pharmacies (3 cards)
  — Schema.org: Pharmacy JSON-LD
  — Medical disclaimer

API ROUTES
GET /api/pharmacies?district=&is_24hr=&has_delivery=&q=&page=
GET /api/pharmacies/[slug]

COMPONENTS
  PharmacyCard.js in packages/ui/components/directory/

NAV + HOMEPAGE
  Add "Pharmacies" link to navbar
  Add pharmacy count to stats

IMPORTANT DISCLAIMER on all pharmacy pages:
  "Always consult a doctor before taking any medication.
  Never self-medicate with prescription drugs."

Smoke tests:
  GET /ml/pharmacies returns 200
  24hr filter returns only 24hr pharmacies
  Delivery filter works
  Profile page renders with JSON-LD


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
