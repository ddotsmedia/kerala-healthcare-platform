# P-B1 — Advanced Job Search

**Track:** Track B — Jobs Portal
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
FEATURE: P-B1 — Advanced Job Search
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Upgrade the basic job search to a professional
healthcare recruitment search with all filters.

NO NEW SCHEMA — extend existing job_listings.
Add columns via additive migration:
Migration 0055:
  ALTER TABLE job_listings
    ADD COLUMN IF NOT EXISTS salary_min INT,
    ADD COLUMN IF NOT EXISTS salary_max INT,
    ADD COLUMN IF NOT EXISTS salary_period VARCHAR(20)
      DEFAULT 'monthly',
    -- monthly|annual|daily|hourly
    ADD COLUMN IF NOT EXISTS experience_years_min INT
      DEFAULT 0,
    ADD COLUMN IF NOT EXISTS experience_years_max INT,
    ADD COLUMN IF NOT EXISTS is_remote BOOLEAN
      DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN
      DEFAULT false,
    ADD COLUMN IF NOT EXISTS job_type VARCHAR(30)
      DEFAULT 'full_time',
    -- full_time|part_time|contract|locum|internship
    ADD COLUMN IF NOT EXISTS qualification_required
      TEXT[],
    -- mbbs|bds|bsc_nursing|gnm|msc|md|ms|mch|...
    ADD COLUMN IF NOT EXISTS benefits TEXT[],
    -- accommodation|food|transport|insurance|...
    ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS applications_count
      INT DEFAULT 0;

SEARCH SERVICE UPGRADE
services/search/jobs.js — extend buildJobQuery():
  New filters:
  • salary_min/max range
  • experience_years range
  • is_remote
  • is_urgent
  • job_type (full_time/locum/etc)
  • qualification_required
  • keyword search in title + description
  Sort options: newest|salary_high|salary_low|
    most_applied|closing_soon

JOBS LISTING PAGE UPGRADE
apps/web/app/[locale]/jobs/page.js

Left sidebar filters (desktop) / bottom sheet (mobile):
  • Search bar (keyword)
  • Job type: All · Full-time · Part-time ·
    Locum · Contract · Internship
  • Specialty (from DB)
  • District (from DB)
  • Experience: Fresher · 1-3yr · 3-5yr · 5+yr
  • Salary range: slider (₹10k–₹5L/month)
  • Remote: toggle
  • Urgent: toggle
  • Posted: Last 24hrs · Last week · Last month

Job card upgrade:
  • Urgency badge (URGENT in red)
  • Salary range display
  • Job type badge
  • Remote badge
  • Experience requirement
  • Application deadline countdown
  • Views + applications count
  • "Save job" bookmark button

Sort bar: Newest · Salary (High-Low) · Closing Soon

Smoke tests:
  Salary range filter returns correct results
  Urgent filter returns only urgent jobs
  Locum filter works
  Sort by salary works
  Keyword search in title works


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
