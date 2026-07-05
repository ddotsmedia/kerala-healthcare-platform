# P-B5 — Featured Job Listings

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
FEATURE: P-B5 — Featured Job Listings
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Sponsored/featured job listings that appear at the top
of search results and on the homepage jobs section.
First monetisation feature for the jobs portal.

SCHEMA (additive migrations)
Migration 0060:
  ALTER TABLE job_listings
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN
      DEFAULT false,
    ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS featured_order INT DEFAULT 0;
    -- lower number = higher in results

ADMIN TOOLS
  apps/admin/app/jobs/featured/page.js
  — List all job listings
  — Toggle featured on/off per listing
  — Set featured_until date
  — Set featured_order (drag to reorder)

API ROUTES
PATCH /api/admin/jobs/[id]/feature
  { featured: true, featured_until, featured_order }
  — platform_admin only

SEARCH DISPLAY
  In buildJobQuery():
  — Featured jobs always appear first in results
  — Only while featured_until > now()
  — After featured period: fall back to normal sort
  — "FEATURED" badge on featured job cards

HOMEPAGE
  Add "Featured Healthcare Jobs" section:
  — 3 featured jobs from DB (is_featured + not expired)
  — "View all jobs →" link

Smoke tests:
  Featured job appears before non-featured
  Featured badge visible on card
  Expired featured job falls to normal position
  Admin can toggle featured status


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
