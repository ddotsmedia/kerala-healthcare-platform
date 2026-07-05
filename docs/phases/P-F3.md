# P-F3 — Hospital Admin Portal

**Track:** Track F — Provider Tools
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
FEATURE: P-F3 — Hospital Admin Portal
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Hospital admin dashboard: manage departments,
staff, services, and view appointment analytics.

SCHEMA (additive migrations)
Migration 0104 — hospital_admins table:
  id uuid PK,
  user_id uuid FK users NOT NULL,
  hospital_id uuid FK hospitals NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  -- admin|staff|readonly
  created_by uuid FK users,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true

PAGES
apps/portal/app/hospital/page.js
  — Hospital admin home: overview stats,
    pending verifications, today's appointments

apps/portal/app/hospital/profile/page.js
  — Edit hospital details, photos, description
  — Add/edit departments
  — Manage services (tick/untick availability)
  — Accreditations management
  — Submit for re-verification after major edits

apps/portal/app/hospital/doctors/page.js
  — List of affiliated doctors
  — Add doctor by registration number
  — Remove doctor affiliation
  — View doctor OPD schedules

apps/portal/app/hospital/appointments/page.js
  — Today's appointments at this hospital
  — Filter by department/doctor
  — Export to CSV

apps/portal/app/hospital/analytics/page.js
  — Profile views (last 30 days)
  — Appointment volume by department
  — Doctor performance overview

API ROUTES
GET/PATCH /api/portal/hospital/profile
  — hospital_admin role required
GET/POST/DELETE /api/portal/hospital/departments
GET/PATCH /api/portal/hospital/services
GET/POST/DELETE /api/portal/hospital/doctors
GET /api/portal/hospital/appointments
GET /api/portal/hospital/analytics

Smoke tests:
  Hospital admin logs in → sees own hospital
  Can edit profile → changes reflect on public page
  Can add/remove doctor affiliations
  Appointments list shows correctly
  Analytics dashboard loads


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
