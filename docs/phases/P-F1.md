# P-F1 — Bulk Provider Import

**Track:** Track F — Provider Tools
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
FEATURE: P-F1 — Bulk Provider Import
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
CSV/Excel import for adding hundreds of doctors
and hospitals at once. Critical for populating
the directory with real Kerala providers.

SCHEMA (additive migrations)
Migration 0101 — import_jobs table:
  id uuid PK,
  admin_user_id uuid FK users NOT NULL,
  type VARCHAR(20), -- doctors|hospitals|labs
  filename TEXT,
  total_rows INT,
  processed_rows INT DEFAULT 0,
  success_rows INT DEFAULT 0,
  error_rows INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  -- pending|processing|completed|failed
  errors JSONB[],
  -- [{row, field, error_message}]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

CSV IMPORT SERVICE
services/admin/import.js:
  parseCSV(fileContent, type):
    — Parse CSV rows
    — Validate each row against schema
    — Report errors per row without stopping
    — Insert valid rows (ON CONFLICT DO NOTHING)
    — Return import_job result

Expected CSV columns for doctors:
  name_en, name_ml, registration_number,
  registration_council, specialty_slugs (comma-sep),
  district_slug, consultation_modes (comma-sep),
  languages (comma-sep), experience_years,
  consultation_fee_inr, phone, email

Expected CSV columns for hospitals:
  name_en, name_ml, type, district_slug,
  address_en, address_ml, phone, email,
  website, bed_count, icu_beds, services
  (comma-sep service slugs)

PAGES
apps/admin/app/import/page.js
  — Upload CSV file (doctors or hospitals)
  — Preview first 5 rows before import
  — "Start Import" button
  — Progress bar during import
  — Results: N imported, N errors
  — Download error report CSV

apps/admin/app/import/[id]/page.js
  — Import job details: row-by-row status
  — Error rows with explanation
  — "Fix and reimport" instructions

API ROUTES
POST /api/admin/import/upload
  — multipart form, CSV file
  — Creates import_job, returns preview rows
POST /api/admin/import/[id]/execute
  — Runs the actual import
  — Returns real-time progress via SSE
    (Server-Sent Events — no websocket package)

DOWNLOAD TEMPLATE
  GET /api/admin/import/template/doctors.csv
  GET /api/admin/import/template/hospitals.csv
  Returns example CSV with correct headers

Smoke tests:
  Upload 10-row doctor CSV → all imported
  Invalid registration number → error logged
  Duplicate slug → silently skipped
  Error report CSV downloadable
  Template CSVs download with correct headers


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
