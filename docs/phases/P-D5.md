# P-D5 — Patient Referral System

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
FEATURE: P-D5 — Patient Referral System
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Refer a friend: both get benefits when friend
books appointment. Growth loop feature.

SCHEMA (additive migrations)
Migration 0091 — referrals table:
  id uuid PK,
  referrer_id uuid FK users NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_email TEXT,
  referred_user_id uuid FK users NULLABLE,
  status VARCHAR(20) DEFAULT 'shared',
  -- shared|registered|appointed|rewarded
  reward_type VARCHAR(50),
  -- priority_listing|free_consultation_info|...
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ

PAGES
apps/web/app/[locale]/patient/referrals/page.js
  — "Refer a Friend to MalayaliDoctor"
  — Your referral link (copy button)
  — WhatsApp share button
  — Referral status: N friends joined · N booked
  — How it works: 3 simple steps

Registration flow update:
  If ?ref=[code] in URL → track referral

Smoke tests:
  Referral link generates correctly
  Registration with ref code tracked
  Referral status updates when friend registers


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
