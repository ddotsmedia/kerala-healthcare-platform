# P-B3 — Resume Builder

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
FEATURE: P-B3 — Resume Builder
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Multi-template resume builder with AI enhancement.
Healthcare professionals need CVs optimised for
medical job applications.

SCHEMA (additive migrations)
Migration 0057 — resume_profiles table:
  id uuid PK,
  user_id uuid FK users NOT NULL,
  title TEXT NOT NULL,
  -- "Dr. Anand Nair — Cardiologist CV"
  template_id VARCHAR(50) DEFAULT 'kerala_classic',
  -- kerala_classic|modern_minimal|gulf_ready
  personal JSONB,
  -- {name, email, phone, address, photo_url,
  --   linkedin, objective}
  experience JSONB[],
  -- [{title, org, from, to, current, description}]
  education JSONB[],
  -- [{degree, institution, year, grade}]
  skills TEXT[],
  certifications JSONB[],
  -- [{name, issuer, year, expiry}]
  publications JSONB[],
  -- [{title, journal, year, url}]
  languages JSONB[],
  -- [{language, proficiency}]
  references JSONB[],
  -- [{name, designation, org, phone, email}]
  ai_enhanced_summary TEXT,
  is_public BOOLEAN DEFAULT false,
  last_exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

API ROUTES
GET    /api/resume              — get my resume
POST   /api/resume              — create resume
PATCH  /api/resume/[id]         — update section
POST   /api/resume/[id]/enhance — AI enhance summary
  — Calls claude-haiku with resume context
  — Generates professional summary (ml + en)
  — Rate limit: 10 AI enhancements/day/user
GET    /api/resume/[id]/export  — export as HTML
  — Returns print-ready HTML for browser PDF

PAGES
apps/web/app/[locale]/candidate/resume/page.js
  5-step form wizard:
  Step 1: Personal Details + Photo URL + Objective
  Step 2: Work Experience (add/edit/remove entries)
  Step 3: Education + Certifications + Publications
  Step 4: Skills + Languages
  Step 5: Preview + Templates

  Live preview panel (split view desktop,
  tab toggle mobile)

  3 templates (CSS-only, print-optimised):
  Kerala Classic: clean, formal, Malayalam-friendly
  Modern Minimal: single column, ATS-friendly
  Gulf Ready: formatted for Middle East applications
    (common for Kerala healthcare workers)

  "✨ Enhance with AI" button on summary field
  → AI generates professional summary via Haiku
  → Shows before/after, user accepts or edits

  "Download PDF" → browser print dialog with
    print CSS that hides everything except resume
    (no @react-pdf needed — browser print works)

  Autosave every 30 seconds

CANDIDATE PROFILE LINK
  Link "Build Resume" from candidate dashboard

Smoke tests:
  Create resume → all 5 steps complete
  AI enhancement returns improved summary
  Print CSS hides navigation, shows only resume
  All 3 templates render correctly
  Autosave works


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
