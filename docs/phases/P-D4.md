# P-D4 — Community Forum

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
FEATURE: P-D4 — Community Forum
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Moderated patient support groups by condition.
Diabetes, cancer, heart disease — peer support
with professional oversight.

SCHEMA (additive migrations)
Migration 0088 — forum_categories table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  name_ml TEXT, name_en TEXT NOT NULL,
  description_ml TEXT, description_en TEXT,
  icon TEXT,
  post_count INT DEFAULT 0,
  member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()

Migration 0089 — forum_posts table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  category_id uuid FK forum_categories NOT NULL,
  author_id uuid FK users NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  views INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Migration 0090 — forum_replies table:
  id uuid PK,
  post_id uuid FK forum_posts NOT NULL,
  author_id uuid FK users NOT NULL,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_doctor_reply BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Seed categories: Diabetes · Heart Health ·
  Cancer Support · Mental Health · Pregnancy ·
  Child Health · General Health

PAGES
apps/web/app/[locale]/community/page.js
  — Forum categories grid
  — Active discussions section
  — Rules: "No medical advice, no diagnosis,
    be respectful, no spam"

apps/web/app/[locale]/community/[category]/page.js
  — Posts list with filters: latest/popular
  — "New Post" button (requires login)

apps/web/app/[locale]/community/[category]/[slug]/page.js
  — Post + replies
  — Doctor replies highlighted specially
  — Report button

MODERATION (strict)
  All posts and replies start as pending
  Admin reviews before publication
  apps/admin/app/forum/page.js — moderation queue

Smoke tests:
  Create post → in moderation queue
  Admin approves → appears in forum
  Doctor reply shows verified badge
  Report button works


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
