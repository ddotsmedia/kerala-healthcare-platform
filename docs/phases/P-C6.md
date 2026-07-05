# P-C6 — Post-Appointment Feedback

**Track:** Track C — Patient Experience
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
FEATURE: P-C6 — Post-Appointment Feedback
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Automated feedback request 2 hours after appointment.
Converts satisfied patients into reviews.

SCHEMA (additive migrations)
Migration 0076:
  ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS feedback_sent_at
      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS feedback_completed_at
      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS feedback_token
      VARCHAR(64) UNIQUE;
    -- unique token for feedback link

FEEDBACK SERVICE
services/appointments/feedback.js:
  sendFeedbackRequest(appointment):
    — 2 hours after appointment completed
    — Email to patient:
      "How was your visit with Dr. [Name]?"
      Star rating link (1-5 stars in email)
      "Leave a detailed review" link
    — Generate unique feedback_token
    — Link: /ml/feedback/[token]

CRON JOB
  Every 30 minutes: find completed appointments
  where completed_at < (now - 2 hours)
  and feedback_sent_at IS NULL
  → sendFeedbackRequest()

PAGES
apps/web/app/[locale]/feedback/[token]/page.js
  — "How was your visit with Dr. [Name]?"
  — Star rating picker (1-5)
  — "What went well?" text area
  — "What could be improved?" text area
  — Anonymous option
  — Submit → creates review (pending moderation)
  — Success: "Thank you! Your review helps others."

API ROUTE
POST /api/feedback/[token]
  — Validates token, creates review record
  — Marks feedback_completed_at

Smoke tests:
  Appointment completed → feedback email sent
    after 2 hours
  Feedback token link works
  Submission creates review in moderation queue


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
