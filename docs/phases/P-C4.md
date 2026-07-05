# P-C4 — Lab Report Storage & Trends

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
FEATURE: P-C4 — Lab Report Storage & Trends
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Upload and store lab reports. View trends over time
for key markers (HbA1c, cholesterol, etc).

SCHEMA (additive migrations)
Migration 0073:
  CREATE TABLE lab_reports (
    id uuid PK DEFAULT uuid_generate_v4(),
    user_id uuid FK users NOT NULL,
    lab_name TEXT,
    report_date DATE NOT NULL,
    report_type VARCHAR(100),
    -- cbc|lipid|thyroid|diabetes|kidney|liver|...
    file_url TEXT,
    file_name TEXT,
    file_type VARCHAR(20),
    file_size_kb INT,
    results JSONB,
    -- {"hba1c": {"value": 7.2, "unit": "%",
    --   "normal_min": 4, "normal_max": 6},
    --  "glucose_fasting": {...}}
    notes TEXT,
    ordered_by_doctor TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ
  );

TREND SERVICE
services/patient/lab-trends.js:
  getParameterHistory(userId, parameter):
    — Returns all values for a specific parameter
      across all lab reports
    — e.g. HbA1c history: [
        {date:"2025-01", value: 7.8},
        {date:"2025-06", value: 7.2},
        {date:"2026-01", value: 6.8}
      ]
    — Indicates improving/worsening trend

PAGES
apps/web/app/[locale]/patient/lab-reports/page.js
  — Reports list by date + type
  — Trend section: select parameter → see history
    as SVG line chart
  — Key markers tracked: HbA1c, fasting glucose,
    cholesterol (LDL/HDL), TSH, creatinine,
    haemoglobin, uric acid
  — Normal range lines on charts
  — "Add results manually" → JSONB form

apps/web/app/[locale]/patient/lab-reports/[id]/page.js
  — Report details, file view, results table
  — Out-of-range values highlighted

Disclaimer: "Share these trends with your doctor
for proper interpretation. Do not self-diagnose."

Smoke tests:
  Upload lab report → stored and viewable
  Add HbA1c manually → trend chart updates
  Out-of-range values highlighted in red
  Multiple reports show trend line


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
