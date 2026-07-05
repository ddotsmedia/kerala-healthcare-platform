# P-A3 — Blood Banks Directory

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
FEATURE: P-A3 — Blood Banks Directory
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Build a blood bank directory. Blood availability searches
are often emergency situations — this page must be fast,
no-JS fallback, and always show emergency numbers prominently.

SCHEMA (additive migrations)
Migration 0042 — blood_banks table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  hospital_id uuid FK hospitals NULLABLE,
  -- linked to hospital if part of one
  address_ml TEXT, address_en TEXT,
  district_id uuid FK districts,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  phone TEXT[] NOT NULL, -- required for blood banks
  emergency_phone TEXT,
  email TEXT,
  license_number VARCHAR(100),
  is_24hr BOOLEAN DEFAULT false,
  blood_types_available TEXT[],
  -- ['A+','A-','B+','B-','O+','O-','AB+','AB-']
  has_apheresis BOOLEAN DEFAULT false,
  has_component_separation BOOLEAN DEFAULT false,
  operating_hours JSONB,
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed 5 demo blood banks across districts
(ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/blood-banks/page.js
  EMERGENCY DESIGN: Red hero banner always visible
  "🩸 Need blood urgently? Call directly."
  List ALL blood banks with PHONE prominently displayed
  Filters: district, blood type, 24hr
  No pagination on first load — show all (blood
  searches are emergency, users need full list fast)
  BloodBankCard: name, phone (large, tap-to-call),
    district, available blood types (coloured badges),
    24hr badge

apps/web/app/[locale]/blood-banks/[slug]/page.js
  — Full profile with all details
  — Blood types available as large coloured grid
  — Emergency phone prominently displayed
  — Location + directions link
  — "Call Now" as primary CTA (not "Book")
  — Schema.ort: MedicalOrganization JSON-LD

API ROUTES
GET /api/blood-banks?district=&blood_type=&is_24hr=&q=
GET /api/blood-banks/[slug]

NAV + HOMEPAGE
  Add "Blood Banks" to emergency section
  Add to emergency page: "Find Blood Bank →"

Smoke tests:
  GET /ml/blood-banks returns full list
  Blood type filter (O+) returns correct results
  Profile page has emergency phone prominent
  Emergency banner visible


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
