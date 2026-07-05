# P-E2 — Lab Test Guide

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
FEATURE: P-E2 — Lab Test Guide
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
100+ lab tests explained: what it measures,
preparation, normal ranges.
"What is HbA1c", "what is CBC" — very high search volume.

SCHEMA (additive migrations)
Migration 0097 — lab_test_guides table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  abbreviation VARCHAR(20),
  -- HbA1c, CBC, LFT, KFT, TSH, ECG...
  category VARCHAR(100),
  -- hematology|biochemistry|microbiology|
  --  radiology|cardiology|endocrinology|...
  description_ml TEXT, description_en TEXT,
  what_it_measures_ml TEXT, what_it_measures_en TEXT,
  why_ordered_ml TEXT, why_ordered_en TEXT,
  preparation_ml TEXT, preparation_en TEXT,
  -- fasting instructions, etc.
  procedure_ml TEXT, procedure_en TEXT,
  -- what happens during the test
  normal_ranges JSONB,
  -- {"adult_male":{"min":13.5,"max":17.5,
  --   "unit":"g/dL"},"adult_female":{...}}
  abnormal_interpretation_ml TEXT,
  abnormal_interpretation_en TEXT,
  -- what high/low values may indicate
  related_conditions TEXT[],
  related_tests TEXT[],
  is_published BOOLEAN DEFAULT false,
  reviewed_by_doctor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

Seed 30 common tests:
  CBC, HbA1c, fasting glucose, lipid profile,
  thyroid panel (TSH/T3/T4), LFT, KFT,
  urine routine, ECG, Echo, chest X-ray,
  creatinine, uric acid, vitamin D, B12, etc.
ON CONFLICT DO NOTHING.

PAGES
apps/web/app/[locale]/lab-tests/page.js
  — "Lab Test Guide — Kerala Health"
  — Search by test name or abbreviation
  — Category tabs: Blood · Urine · Imaging ·
    Heart · Hormones · Infection · Cancer Markers
  — LabTestCard: name, abbreviation, category,
    preparation required badge

apps/web/app/[locale]/lab-tests/[slug]/page.js
  — Full test guide page (SSR)
  — Sections: What it measures · Why ordered ·
    How to prepare · What happens · Normal ranges ·
    What abnormal results may mean
  — Normal ranges table (gender/age based)
  — Non-dismissable disclaimer:
    "Abnormal results do not mean you have a disease.
    Always discuss your results with your doctor."
  — "Find a Lab" CTA → /ml/labs
  — Schema.org: MedicalTest JSON-LD
  — generateMetadata: "[Test Name] Test — Normal
    Range, Preparation | MalayaliDoctor"

Smoke tests:
  GET /ml/lab-tests returns 200
  Search "HbA1c" returns result
  Normal ranges table renders
  MedicalTest JSON-LD present
  Disclaimer visible and non-dismissable


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
