# P-E4 — Treatment Journey Guides

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
FEATURE: P-E4 — Treatment Journey Guides
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
End-to-end guides for major treatment journeys:
knee replacement, IVF, cancer treatment, dialysis.
These are long-form, highly valuable SEO pages.

SCHEMA
Uses existing content_items table with
type = 'journey_guide'. Add journey_steps:

Migration 0099:
  ALTER TABLE content_items
    ADD COLUMN IF NOT EXISTS journey_steps JSONB[];
    -- [{step_number, title_ml, title_en,
    --   description_ml, description_en,
    --   duration, icon, tips}]

Seed 5 journey guides via CMS:
  Knee Replacement Journey
  IVF Treatment Journey
  Chemotherapy Journey
  Dialysis Journey
  Cardiac Bypass Surgery Journey

PAGES
apps/web/app/[locale]/journeys/page.js
  — "Treatment Journey Guides"
  — By specialty, by duration, by complexity

apps/web/app/[locale]/journeys/[slug]/page.js
  — Step-by-step visual timeline (CSS)
  — Estimated timeline per step
  — Tips for each stage
  — Related specialists + hospitals
  — Patient stories section (future)

Smoke tests:
  GET /ml/journeys returns 200
  Step timeline renders
  All 5 seeded journeys accessible


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
