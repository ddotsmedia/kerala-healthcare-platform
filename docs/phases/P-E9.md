# P-E9 — Clinical Guidelines Simplified

**Track:** Track E — Knowledge & Content
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
FEATURE: P-E9 — Clinical Guidelines Simplified
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Simplified clinical guidelines for common conditions,
citing ICMR/WHO. Patient-friendly versions of
official guidelines.

NO SCHEMA — CMS content items.

Seed 10 guideline summaries:
  Diabetes management (RSSDI guidelines)
  Hypertension control (ISH guidelines)
  COVID-19 management (ICMR)
  TB treatment (RNTCP)
  Immunisation schedule (IAP)
  Antenatal care (FOGSI)
  Infant feeding (NHM)
  Mental health first aid (NIMHANS)
  Cancer screening (ICMR)
  Palliative care (IAPCON)

PAGES
apps/web/app/[locale]/guidelines/page.js
apps/web/app/[locale]/guidelines/[slug]/page.js

All pages cite the source organisation prominently.
Disclaimer: "This is a simplified summary.
Refer to the original guideline for clinical use."

Smoke tests:
  GET /ml/guidelines returns 200
  Source citation visible on each page


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
