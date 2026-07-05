# P-B6 — Application Kanban Board

**Track:** Track B — Jobs Portal
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
FEATURE: P-B6 — Application Kanban Board
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Visual Kanban pipeline for employers to manage
applications: Applied → Screening → Interview →
Offer → Hired/Rejected.

NO NEW SCHEMA — use existing job_applications.status.
Add columns:
Migration 0061:
  ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS kanban_position INT
      DEFAULT 0,
    ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS interview_mode VARCHAR(20),
    -- in_person|video|phone
    ADD COLUMN IF NOT EXISTS offer_salary INT,
    ADD COLUMN IF NOT EXISTS internal_notes TEXT;

PAGES
apps/web/app/[locale]/employer/listings/[id]/kanban/page.js
  — Kanban board: 6 columns
    Applied · Screening · Interview · Offer ·
    Hired · Rejected
  — Each column: candidate cards
  — Card: candidate name, role, experience,
    applied date, quick action buttons
  — Drag and drop: use HTML5 draggable API
    (no new package — dragstart/dragover/drop events)
  — On drop: PATCH /api/jobs/applications/[id]/status
  — Column counts shown in header
  — Bulk actions: "Move all screened to interview"

  Desktop: horizontal scroll columns
  Mobile: vertical stack (one column visible,
    swipe or dropdown to switch column)

API ROUTE
PATCH /api/jobs/applications/[id]/kanban
  { status, kanban_position, interview_date,
    interview_mode, offer_salary, internal_notes }

Smoke tests:
  Drag card from Applied to Screening → DB updated
  Status change triggers candidate notification
  Bulk action moves all cards
  Mobile view renders column switcher


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
