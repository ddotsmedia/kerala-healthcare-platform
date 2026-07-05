# P-E8 — Yoga & Wellness Content

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
FEATURE: P-E8 — Yoga & Wellness Content
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Yoga poses for specific conditions, meditation guides,
wellness programs. Integrates with AYUSH directory.

NO SCHEMA — CMS content items with type=wellness.

Seed 10 wellness articles via content_items:
  Basic yoga poses for back pain
  Pranayama for stress
  Meditation for anxiety
  Yoga for diabetes management
  Yoga for hypertension
  Yoga during pregnancy (with disclaimer)
  Walking program for heart health
  Sleep hygiene program
  Stress reduction techniques
  Mindfulness basics in Malayalam

PAGES
apps/web/app/[locale]/wellness/page.js
  — "Wellness & Yoga"
  — Category: Yoga · Meditation · Breathing ·
    Fitness · Sleep · Stress Management

Disclaimer on all wellness pages:
  "Consult your doctor before starting any
  exercise program, especially if you have
  a medical condition."

Smoke tests:
  GET /ml/wellness returns 200
  Category filter works


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
