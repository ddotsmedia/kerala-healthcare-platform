# P-D8 — Social Sharing Enhancement

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
FEATURE: P-D8 — Social Sharing Enhancement
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Enhanced social sharing: doctor profiles, articles,
health tips to WhatsApp/Facebook/Twitter.
Better OG images per page type.

NO NEW SCHEMA.

OG IMAGE GENERATION
  Create dynamic OG image routes:
  apps/web/app/api/og/doctor/[slug]/route.js
  — Returns SVG/HTML image with doctor name,
    specialty, rating, malayalidoctor.com branding
  — 1200x630 pixels

  apps/web/app/api/og/article/[slug]/route.js
  apps/web/app/api/og/hospital/[slug]/route.js

  Update generateMetadata for these pages to
  use dynamic OG image URLs.

SHARING COMPONENTS UPGRADE
  Add to doctor profile, articles, hospital pages:
  — WhatsApp share (already exists — verify works)
  — "Copy link" button
  — Facebook share (window.open share URL)
  — Twitter/X share
  — Print button (for prescriptions, lab reports)

SHARE CARD TEMPLATES
  Pre-written share messages per page type:
  Doctor: "I found a great doctor on MalayaliDoctor:
    Dr. [Name] — [Specialty] in [District]"
  Article: "Useful health info: [Title] via
    MalayaliDoctor.com"

Smoke tests:
  OG image route returns valid image
  Share buttons open correct URLs
  WhatsApp message pre-filled correctly


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
