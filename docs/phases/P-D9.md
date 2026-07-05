# P-D9 — Google Ads Landing Pages

**Track:** Track D — Growth & Engagement
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
FEATURE: P-D9 — Google Ads Landing Pages
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
High-converting landing pages for paid search campaigns.
"Best cardiologist Kochi", "MBBS jobs Kerala" etc.

NO NEW SCHEMA — uses existing data.

PAGES
These are enhanced versions of existing pages,
optimised for paid traffic conversion:

apps/web/app/[locale]/find/[specialty]-doctor-[district]/page.js
  — "[Specialty] Doctor in [District]"
  — Simpler layout, conversion-focused
  — Above fold: search + top 3 doctors
  — Trust signals: verified count, reviews
  — Clear "Book Appointment" CTA

apps/web/app/[locale]/find/[role]-jobs-[district]/page.js
  — "[Role] Jobs in [District]"
  — Top 5 current job listings
  — "Apply now" CTAs
  — "Set job alert" CTA

TRACKING
  Add UTM parameter preservation to links
  (pass utm_source/medium/campaign through
  to booking confirmation)

Smoke tests:
  Landing pages return 200
  Conversion CTAs link correctly
  UTM params preserved through booking flow


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
