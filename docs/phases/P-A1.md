# P-A1 — Diagnostic Labs Directory

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
FEATURE: P-A1 — Diagnostic Labs Directory
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Build a complete diagnostic laboratory directory as a new provider type.
Kerala patients search for "blood test near me" and "NABL lab Kochi" daily.

SCHEMA (additive migrations)
Migration 0039 — diagnostic_labs table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  type VARCHAR(50), -- pathology|radiology|imaging|multi-specialty
  address_ml TEXT, address_en TEXT,
  district_id uuid FK districts,
  lat DECIMAL(10,8), lng DECIMAL(11,8),
  phone TEXT[], email TEXT, website TEXT,
  is_nabl_accredited BOOLEAN DEFAULT false,
  nabl_cert_number VARCHAR(100),
  home_collection BOOLEAN DEFAULT false,
  home_collection_fee_inr INT,
  operating_hours JSONB,
  -- {"mon":{"open":"07:00","close":"20:00"},...}
  report_delivery_hours INT DEFAULT 24,
  online_reports BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Migration 0040 — lab_tests table:
  id uuid PK, lab_id uuid FK diagnostic_labs,
  test_name_ml TEXT, test_name_en TEXT NOT NULL,
  test_code VARCHAR(50),
  category VARCHAR(100),
  -- hematology|biochemistry|microbiology|radiology|...
  price_inr INT,
  sample_type VARCHAR(100),
  -- blood|urine|stool|swab|tissue|...
  fasting_required BOOLEAN DEFAULT false,
  preparation_ml TEXT, preparation_en TEXT,
  report_hours INT DEFAULT 24,
  home_collection_available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()

Seed 5 demo labs with 10 tests each (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/labs/page.js
  — Lab search results with filters:
    NABL accredited, home collection, district,
    test category, open now
  — LabCard component: name, NABL badge, home
    collection badge, rating, district
  — Search by lab name or test name

apps/web/app/[locale]/labs/[slug]/page.js
  — Lab profile page (SSR)
  — Header: name, NABL badge, home collection,
    rating, hours, phone (tap-to-call), address
  — Tests offered: searchable table with prices
  — How to book: steps (call/walk-in/online)
  — Nearby labs (same district, 3 cards)
  — Schema.org: MedicalOrganization JSON-LD
  — generateMetadata: "[Lab Name] — [District] |
    MalayaliDoctor"
  — Breadcrumb: Home → Labs → [Name]
  — Non-dismissable disclaimer

API ROUTES
GET /api/labs?district=&nabl=&home_collection=&q=&page=
GET /api/labs/[slug]
GET /api/labs/[slug]/tests?category=&q=

COMPONENTS (packages/ui/components/directory/)
  LabCard.js — name, NABL badge, home-collection
    badge, rating stars, district, phone
  TestRow.js — test name (ml+en), price, sample
    type, fasting, report time

HOMEPAGE + NAV
  Add "Labs" to navbar under Hospitals
  Add labs count to homepage stats
  Add "🧪 Diagnostic Labs" card to directory section

SITEMAP
  Add /[locale]/labs and /[locale]/labs/[slug] URLs

Smoke tests:
  GET /ml/labs returns 200 with lab cards
  GET /ml/labs/[slug] returns 200 with JSON-LD
  Search "blood test" returns matching labs
  NABL filter returns only accredited labs
  Home collection filter works correctly


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
