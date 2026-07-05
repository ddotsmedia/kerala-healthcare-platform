# P-E6 — First Aid Guide

**Track:** Track E — Knowledge & Content
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
FEATURE: P-E6 — First Aid Guide
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Comprehensive first aid guide: 30+ emergency situations
with step-by-step instructions in Malayalam.
Life-saving information must be simple and accessible.

NO SCHEMA — static page with hardcoded content.
(Emergency info should not require DB calls.)

PAGES
apps/web/app/[locale]/first-aid/page.js
  — "പ്രഥമശുശ്രൂഷ — First Aid Guide"
  — Emergency numbers banner (always visible)
  — Categories: Cardiac · Breathing · Bleeding ·
    Poisoning · Burns · Fractures · Choking ·
    Drowning · Seizure · Diabetic Emergency

For each situation (30+ total):
  — Situation name (ml + en)
  — Signs to identify
  — Step-by-step instructions (numbered)
  — What NOT to do
  — When to call 112/108

All content hardcoded (no DB call) so page
works even during server issues.

DESIGN: Large text, high contrast, simple layout.
No jargon. Clear action steps.

Add to Emergency page navigation.

Smoke tests:
  Page loads without DB connection
  All 30+ situations present
  Emergency numbers visible above fold
  Steps numbered and clear


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
