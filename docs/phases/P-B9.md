# P-B9 — LinkedIn-Style Professional Profiles

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
FEATURE: P-B9 — LinkedIn-Style Professional Profiles
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Rich professional profiles for healthcare workers:
headline, summary, experience timeline,
publications, awards, memberships.
Makes the platform a professional network too.

SCHEMA (additive migrations)
Migration 0063:
  ALTER TABLE candidate_profiles
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS headline TEXT,
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS awards JSONB[],
    -- [{title, issuer, year, description}]
    ADD COLUMN IF NOT EXISTS publications JSONB[],
    -- [{title, journal, year, url, doi}]
    ADD COLUMN IF NOT EXISTS memberships TEXT[],
    -- ["IMA","ISA","Kerala Medical Council"...]
    ADD COLUMN IF NOT EXISTS social_links JSONB,
    -- {linkedin, researchgate, twitter, website}
    ADD COLUMN IF NOT EXISTS profile_completeness INT
      DEFAULT 0;
    -- calculated: 0-100

PROFILE COMPLETENESS CALCULATOR
  calculateCompleteness(profile):
    Photo: +10 · Headline: +10 · Summary: +15
    Experience (1+): +20 · Education: +15
    Skills (3+): +10 · Certifications: +10
    Publications (1+): +5 · Awards (1+): +5
  Update on every profile save

PAGES
apps/web/app/[locale]/candidates/[slug]/page.js
  UPGRADE to rich profile:
  — Hero: photo, name, headline, location,
    "Open to work" badge, profile completeness ring
  — About: summary
  — Experience timeline (vertical, date markers)
  — Education (styled cards)
  — Publications (with DOI links)
  — Awards & Recognition
  — Professional Memberships
  — Skills grid
  — "Contact" CTA (employer auth required)

apps/web/app/[locale]/candidate/profile/page.js
  — Edit all new fields
  — Profile completeness progress bar
    with tips: "Add 2 more skills to reach 80%"

Smoke tests:
  Profile completeness calculated correctly
  Timeline renders in correct date order
  Publications show DOI links
  Completeness tips shown for incomplete sections


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
