# P-E7 — Nutrition Database

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
FEATURE: P-E7 — Nutrition Database
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Kerala foods and their nutritional value,
healthy recipes for common conditions.

SCHEMA (additive migrations)
Migration 0100 — foods table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  category VARCHAR(50),
  -- grain|vegetable|fruit|protein|dairy|spice
  calories_per_100g INT,
  protein_g DECIMAL(5,2),
  carbs_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),
  fiber_g DECIMAL(5,2),
  key_nutrients TEXT[],
  health_benefits_ml TEXT, health_benefits_en TEXT,
  good_for TEXT[],
  -- diabetes|heart|weight_loss|pregnancy|...
  caution_for TEXT[],
  -- kidney_disease|gout|...
  created_at TIMESTAMPTZ DEFAULT now()

Seed 50 common Kerala foods:
  Rice, tapioca, fish, coconut, curry leaves,
  turmeric, jackfruit, banana, mango, etc.

PAGES
apps/web/app/[locale]/nutrition/page.js
apps/web/app/[locale]/nutrition/[slug]/page.js

Smoke tests:
  GET /ml/nutrition returns 200
  Food detail shows nutritional info


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
