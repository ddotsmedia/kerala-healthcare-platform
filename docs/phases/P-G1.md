# P-G1 — User Analytics Dashboard

**Track:** Track G — Analytics
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
FEATURE: P-G1 — User Analytics Dashboard
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Page views, search queries, conversion funnel,
user journey tracking. Essential for platform growth.
Privacy-preserving — no personal data in analytics.

SCHEMA (additive migrations)
Migration 0113 — page_views table:
  id uuid PK DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  locale VARCHAR(5),
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  session_id VARCHAR(64),
  viewed_at TIMESTAMPTZ DEFAULT now()

CREATE INDEX idx_page_views_path_date
  ON page_views(path, viewed_at DESC);

Migration 0114 — conversion_events table:
  id uuid PK DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  -- search|profile_view|booking_started|
  --  booking_completed|registration|login|
  --  job_applied|article_read
  entity_type VARCHAR(50),
  entity_id uuid,
  session_id VARCHAR(64),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()

TRACKING MIDDLEWARE
  apps/web/middleware.js (or layout):
  On page load: POST /api/analytics/pageview
  On key events: POST /api/analytics/event

ANALYTICS SERVICE
services/analytics/index.js:
  getTopPages(days=30, limit=20)
  getDailyActiveUsers(days=30)
  getConversionFunnel():
    search → profile view → booking started →
    booking completed
  getTopSearchQueries(days=7)
  getRegistrationTrend(days=30)

ADMIN DASHBOARD
apps/admin/app/analytics/page.js — upgrade:
  Section 1: Overview (today, this week, this month)
    Active users, page views, new registrations,
    bookings completed
  Section 2: Top pages (table)
  Section 3: Conversion funnel (visual)
  Section 4: Traffic sources (pie: direct/organic/
    referral/social)
  Section 5: User registration trend (line chart)
  All charts: SVG-based, no charting package

API ROUTES
POST /api/analytics/pageview (public, no auth)
POST /api/analytics/event
GET  /api/admin/analytics/overview
GET  /api/admin/analytics/pages
GET  /api/admin/analytics/funnel
GET  /api/admin/analytics/registrations

Smoke tests:
  Page view recorded on visit
  Conversion event recorded on booking
  Analytics dashboard shows correct totals
  Funnel shows realistic conversion rates


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
