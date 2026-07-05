# P-C3 — Prescription Upload & Storage

**Track:** Track C — Patient Experience
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
FEATURE: P-C3 — Prescription Upload & Storage
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Upload and store prescriptions in the PHR.
Doctor name, date, medications — searchable and organised.

SCHEMA (additive migrations)
Migration 0072:
  CREATE TABLE IF NOT EXISTS prescriptions (
    id uuid PK DEFAULT uuid_generate_v4(),
    user_id uuid FK users NOT NULL,
    appointment_id uuid FK appointments NULLABLE,
    doctor_name TEXT,
    doctor_id uuid FK healthcare_providers NULLABLE,
    hospital_name TEXT,
    prescribed_date DATE,
    valid_until DATE,
    medications JSONB[],
    -- [{name, dosage, frequency, duration, notes}]
    file_url TEXT,
    file_name TEXT,
    file_type VARCHAR(20), -- jpg|png|pdf
    file_size_kb INT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ
  );
  CREATE INDEX idx_prescriptions_user
    ON prescriptions(user_id)
    WHERE deleted_at IS NULL;

FILE HANDLING
  For now: store as base64 in DB (max 2MB)
  Log in BLOCKERS.md: migrate to S3/R2 when
  H3 (S3 storage) feature is built
  File types accepted: jpg, png, pdf only
  Validate file size before upload

API ROUTES
GET    /api/patient/prescriptions
POST   /api/patient/prescriptions
  — Accept file upload (multipart/form-data)
  — Convert to base64, store in file_url as
    data URI (temporary until S3)
PATCH  /api/patient/prescriptions/[id]
DELETE /api/patient/prescriptions/[id]
GET    /api/patient/prescriptions/[id]/file

PAGES
apps/web/app/[locale]/patient/prescriptions/page.js
  — Prescription list sorted by date
  — PrescriptionCard: doctor name, date,
    medications count, thumbnail if image
  — Upload button → modal with drag-drop zone
  — Add medications manually (JSONB editor)
  — Search by doctor name or medication

apps/web/app/[locale]/patient/prescriptions/[id]/page.js
  — Full prescription view
  — Medications list
  — Image preview or PDF viewer (browser native)
  — Edit metadata (doctor, date, medications)

Smoke tests:
  Upload prescription image → stored and viewable
  Medication list editable
  File size limit enforced
  Search by doctor name returns correct results


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
