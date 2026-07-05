# P-D6 — Health Awareness Campaigns

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
FEATURE: P-D6 — Health Awareness Campaigns
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Seasonal health awareness campaigns: World Diabetes Day,
Cancer Awareness Month, Heart Week etc.
Pre-built campaign pages with timely content.

SCHEMA (additive migrations)
Migration 0092 — campaigns table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  title_ml TEXT, title_en TEXT NOT NULL,
  description_ml TEXT, description_en TEXT,
  theme_color VARCHAR(7),
  -- hex color for campaign branding
  start_date DATE, end_date DATE,
  hero_image_url TEXT,
  content_ml TEXT, content_en TEXT,
  -- rich HTML content
  is_active BOOLEAN DEFAULT false,
  specialty_id uuid FK specialties NULLABLE,
  created_at TIMESTAMPTZ DEFAULT now()

Seed 5 campaigns:
  World Diabetes Day (Nov 14)
  World Heart Day (Sep 29)
  World Cancer Day (Feb 4)
  World Mental Health Day (Oct 10)
  Kerala Health Week

PAGES
apps/web/app/[locale]/campaigns/[slug]/page.js
  — Campaign-branded landing page
  — Educational content
  — Featured specialists for this condition
  — Related articles
  — "Book a screening →" CTA
  — Share on WhatsApp

HOMEPAGE
  Active campaign banner (between hero and stats)
  Only shows during campaign dates

Smoke tests:
  Active campaign banner shows on homepage
  Campaign page renders with branding
  Inactive campaign not shown on homepage


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
