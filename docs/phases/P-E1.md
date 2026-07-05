# P-E1 — Medicine Information Centre

**Track:** Track E — Knowledge & Content
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
FEATURE: P-E1 — Medicine Information Centre
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Drug/medicine information database: generic name,
brand names, uses, side effects, interactions.
Millions search for medicine information daily.
Educational only — never prescriptive.

SCHEMA (additive migrations)
Migration 0096 — medicines table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  generic_name_ml TEXT, generic_name_en TEXT NOT NULL,
  brand_names TEXT[],
  drug_class VARCHAR(100),
  therapeutic_category VARCHAR(100),
  -- antibiotics|antivirals|analgesics|...
  uses_ml TEXT, uses_en TEXT,
  mechanism_ml TEXT, mechanism_en TEXT,
  dosage_forms TEXT[],
  -- tablet|capsule|injection|syrup|cream|...
  common_side_effects_ml TEXT[],
  common_side_effects_en TEXT[],
  serious_side_effects_ml TEXT[],
  serious_side_effects_en TEXT[],
  contraindications_ml TEXT, contraindications_en TEXT,
  interactions_ml TEXT, interactions_en TEXT,
  pregnancy_category VARCHAR(10),
  -- A|B|C|D|X (FDA categories)
  is_otc BOOLEAN DEFAULT false,
  -- over the counter
  storage_ml TEXT, storage_en TEXT,
  disclaimer_ml TEXT, disclaimer_en TEXT,
  references TEXT[],
  -- WHO/ICMR/medical journal citations
  is_published BOOLEAN DEFAULT false,
  reviewed_by_doctor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

Seed 30 common medicines in Kerala
(paracetamol, metformin, atenolol, amlodipine,
aspirin, omeprazole, cetirizine, azithromycin,
amoxicillin, metronidazole, etc.)
ON CONFLICT DO NOTHING.

PAGES
apps/web/app/[locale]/medicines/page.js
  — "Medicine Information — Kerala Health"
  — Search by generic name or brand name
  — A-Z index
  — Category tabs: Antibiotics · Diabetes ·
    Heart · Pain · Allergy · Gastrointestinal
  — MedicineCard: generic name, drug class,
    OTC/prescription badge

apps/web/app/[locale]/medicines/[slug]/page.js
  — Full medicine information page (SSR)
  — Sections: Uses · How it works · Side Effects ·
    Serious Side Effects · Who Should Not Take ·
    Drug Interactions · Storage
  — Pregnancy category with explanation
  — Brand names list
  — Schema.org: Drug JSON-LD
  — NON-DISMISSABLE disclaimer (red banner):
    "This information is for education only.
    Never start, stop, or change any medication
    without consulting your doctor.
    This is NOT a prescription."
  — "Consult a Doctor" CTA button
  — generateMetadata: "[Medicine] — Uses, Side Effects,
    Dosage | MalayaliDoctor"

API ROUTES
GET /api/medicines?q=&category=&page=
GET /api/medicines/[slug]
GET /api/medicines/search?q= (autocomplete)

Search integration:
  Add medicines to unified search results

Smoke tests:
  GET /ml/medicines returns 200
  Search "paracetamol" returns result
  Medicine detail page has Drug JSON-LD
  Disclaimer banner visible and non-dismissable
  Brand name search works


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
