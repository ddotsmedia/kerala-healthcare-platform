# P-B2 — Job Alerts Engine

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
FEATURE: P-B2 — Job Alerts Engine
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Email alerts when jobs matching saved criteria are posted.
This is the #1 retention feature for job seekers.

SCHEMA (additive migrations)
Migration 0056 — job_alerts table:
  id uuid PK,
  user_id uuid FK users NOT NULL,
  name TEXT NOT NULL,
  -- user-given name: "ICU Nurse Jobs Kochi"
  filters JSONB NOT NULL,
  -- {"specialty_id":"...","district_id":"...",
  --   "job_type":"full_time","salary_min":50000}
  frequency VARCHAR(20) DEFAULT 'daily',
  -- instant|daily|weekly
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

ALERT ENGINE
services/jobs/alerts.js:
  matchJobToAlerts(job):
    — When new job posted, find all active alerts
      where filters match the new job
    — Queue email notification for each match
    — Rate limit: max 5 emails per alert per day
  
  sendJobAlertEmail(userId, alertName, jobs[]):
    — Email template: services/notifications/
      templates/job-alert.js (ml + en)
    — Subject: "[N] new jobs matching [Alert Name]"
    — List up to 5 matching jobs with apply links
    — Unsubscribe link at bottom

  dailyDigest():
    — For "daily" frequency alerts
    — Run at 8AM via cron/BullMQ
    — Collect all matches since last send
    — Send digest if any matches

API ROUTES
GET    /api/jobs/alerts           — list my alerts
POST   /api/jobs/alerts           — create alert
PATCH  /api/jobs/alerts/[id]      — update alert
DELETE /api/jobs/alerts/[id]      — delete alert
POST   /api/jobs/alerts/[id]/test — send test email

UI
apps/web/app/[locale]/jobs/page.js:
  — "🔔 Save this search" button in search bar
  — Opens modal: name the alert + frequency
  — "Manage alerts" link → /ml/jobs/alerts

apps/web/app/[locale]/jobs/alerts/page.js:
  — List of saved alerts with toggle on/off
  — Edit criteria, change frequency
  — Delete alert

TRIGGER
  Wire matchJobToAlerts() into:
  POST /api/jobs — when employer posts new job
  Call matchJobToAlerts(newJob) after saving

Smoke tests:
  Create alert → post matching job → email queued
  Daily digest runs and sends
  Alert can be paused and resumed
  Unsubscribe link works


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
