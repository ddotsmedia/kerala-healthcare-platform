# P-D7 — Health Camps & Community Events

**Track:** Track D — Growth & Engagement
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
FEATURE: P-D7 — Health Camps & Community Events
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
List free health screening camps, blood donation drives,
vaccination camps, awareness events.

SCHEMA (additive migrations)
Migration 0093 — health_events table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  title_ml TEXT, title_en TEXT NOT NULL,
  type VARCHAR(50),
  -- screening_camp|blood_donation|vaccination|
  --  awareness|cme|wellness
  organiser TEXT, hospital_id uuid FK hospitals,
  venue_ml TEXT, venue_en TEXT,
  district_id uuid FK districts,
  event_date DATE NOT NULL,
  start_time TIME, end_time TIME,
  is_free BOOLEAN DEFAULT true,
  registration_required BOOLEAN DEFAULT false,
  registration_url TEXT,
  contact_phone TEXT,
  description_ml TEXT, description_en TEXT,
  max_participants INT,
  current_registrations INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

Seed 5 demo events (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/events/page.js
  — "ആരോഗ്യ ക്യാമ്പുകൾ & പരിപാടികൾ"
  — Filters: type, district, this week/month,
    free/paid
  — EventCard: type badge, date (prominent),
    venue, organiser, free badge

apps/web/app/[locale]/events/[slug]/page.js
  — Full event details
  — "Register" → external URL or in-app form
  — Schema.org: Event JSON-LD
  — Add to calendar (ICS)

Smoke tests:
  GET /ml/events returns 200
  Free filter works
  ICS download works


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
