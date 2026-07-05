# P-E3 — Medical Procedure Library

**Track:** Track E — Knowledge & Content
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
FEATURE: P-E3 — Medical Procedure Library
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
50+ medical procedures explained: what to expect,
preparation, recovery. Reduce patient anxiety.

SCHEMA (additive migrations)
Migration 0098 — procedures table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  category VARCHAR(100),
  -- surgery|diagnostic|therapeutic|cosmetic|dental
  specialty_id uuid FK specialties,
  description_ml TEXT, description_en TEXT,
  why_performed_ml TEXT, why_performed_en TEXT,
  preparation_ml TEXT, preparation_en TEXT,
  -- fasting, medications, pre-tests
  what_happens_ml TEXT, what_happens_en TEXT,
  duration_minutes_min INT,
  duration_minutes_max INT,
  anaesthesia_type VARCHAR(50),
  -- none|local|regional|general
  recovery_ml TEXT, recovery_en TEXT,
  hospital_stay_days_min INT DEFAULT 0,
  hospital_stay_days_max INT DEFAULT 0,
  risks_ml TEXT, risks_en TEXT,
  cost_range_min INT, cost_range_max INT,
  references TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()

Seed 20 common procedures:
  Cataract surgery, angioplasty, knee replacement,
  appendectomy, cholecystectomy, hysterectomy,
  C-section, endoscopy, colonoscopy, IVF,
  root canal, dental implant, LASIK,
  dialysis, chemotherapy session,
  MRI scan, CT scan, echo, ECG,
  coronary angiogram
ON CONFLICT DO NOTHING.

PAGES
apps/web/app/[locale]/procedures/page.js
  — Browse by specialty, anaesthesia type,
    hospital stay required
  — ProcedureCard: name, specialty, stay duration

apps/web/app/[locale]/procedures/[slug]/page.js
  — Full procedure guide
  — Timeline infographic (CSS-only):
    Before → During → Recovery → Follow-up
  — Cost range display with disclaimer
  — Schema.org: MedicalProcedure JSON-LD
  — Related specialists + hospitals

Smoke tests:
  GET /ml/procedures returns 200
  Procedure detail renders with timeline
  JSON-LD present


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
