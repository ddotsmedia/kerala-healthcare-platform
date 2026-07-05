# P-C5 — Family Health Profiles

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
FEATURE: P-C5 — Family Health Profiles
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Add family members to one account — manage
health records for spouse, children, parents.

SCHEMA (additive migrations)
Migration 0074 — family_members table:
  id uuid PK,
  primary_user_id uuid FK users NOT NULL,
  name_ml TEXT, name_en TEXT NOT NULL,
  relationship VARCHAR(50),
  -- spouse|child|parent|sibling|grandparent|other
  date_of_birth DATE,
  gender VARCHAR(10),
  blood_group VARCHAR(5),
  is_minor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Migration 0075 — family_health_records:
  Link health_records, prescriptions, lab_reports
  to family_member_id (nullable):
  ALTER TABLE health_records
    ADD COLUMN IF NOT EXISTS family_member_id
    uuid REFERENCES family_members(id);
  ALTER TABLE prescriptions
    ADD COLUMN IF NOT EXISTS family_member_id
    uuid REFERENCES family_members(id);
  ALTER TABLE lab_reports
    ADD COLUMN IF NOT EXISTS family_member_id
    uuid REFERENCES family_members(id);

PAGES
apps/web/app/[locale]/patient/family/page.js
  — Family member cards: name, relationship,
    age, blood group
  — "Add family member" form
  — Click member → their health records

All PHR pages (health-records, prescriptions,
lab-reports):
  — "Viewing: [Self ▼]" dropdown at top
  — Switch between self and family members

BOOKING FLOW UPDATE
  /ml/book/[doctorSlug]:
  — "Booking for:" selector
  — Self or family member dropdown
  — Appointment linked to family_member_id

Smoke tests:
  Add family member → appears in selector
  Book appointment for child → saved with
    family_member_id
  Switch family member in PHR view


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
