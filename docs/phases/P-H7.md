# P-H7 — Multilingual Expansion (Tamil + Hindi)

**Track:** Track H — Infrastructure
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
FEATURE: P-H7 — Multilingual Expansion (Tamil + Hindi)
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Tamil and Hindi content support for non-Kerala users.
Platform infrastructure already supports multi-locale.

SCHEMA (additive migrations)
Migration 0119:
  — Add ta (Tamil) and hi (Hindi) locale support
  — Add name_ta, name_hi columns to:
    districts, specialties, symptoms
  — Add body_ta, body_hi, title_ta, title_hi
    to content_items

I18N EXPANSION
  packages/ui/locales/ta.json — Tamil translations
  packages/ui/locales/hi.json — Hindi translations
  Start with: navigation, common UI, error messages

URL STRUCTURE
  Add /ta/ and /hi/ locale prefixes
  Language detection for Tamil Nadu / Hindi belt IPs

SEED DATA
  Translate district names to Tamil and Hindi
  (automatic: use AI to generate, human review later)

Smoke tests:
  /ta/doctors renders with Tamil labels
  /hi/doctors renders with Hindi labels
  Language toggle switches correctly


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
