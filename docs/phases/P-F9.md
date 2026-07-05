# P-F9 — Publications Showcase

**Track:** Track F — Provider Tools
**Priority:** 🟢 Normal
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
FEATURE: P-F9 — Publications Showcase
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Doctor's research papers, awards, and case reports
displayed on their public profile.

SCHEMA
Uses existing doctor profile publications JSONB.
Enhance with:
Migration 0111:
  CREATE TABLE provider_publications (
    id uuid PK DEFAULT uuid_generate_v4(),
    provider_id uuid FK healthcare_providers NOT NULL,
    title TEXT NOT NULL,
    journal TEXT,
    year INT,
    doi TEXT,
    pubmed_id TEXT,
    url TEXT,
    type VARCHAR(50) DEFAULT 'paper',
    -- paper|book|chapter|case_report|poster
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE provider_awards (
    id uuid PK DEFAULT uuid_generate_v4(),
    provider_id uuid FK healthcare_providers NOT NULL,
    title TEXT NOT NULL,
    awarded_by TEXT,
    year INT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

PORTAL
  apps/portal/app/profile/publications/page.js
  — Add publications (title, journal, year, DOI)
  — Add awards
  — Reorder by drag

PUBLIC PROFILE
  Add Publications and Awards sections to
  doctor public profile page

Smoke tests:
  Add publication in portal → shows on profile
  DOI link works
  Award shows with year


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
