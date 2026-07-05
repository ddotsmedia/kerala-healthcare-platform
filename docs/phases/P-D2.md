# P-D2 — Health News Feed

**Track:** Track D — Growth & Engagement
**Priority:** 🔴 Critical
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
FEATURE: P-D2 — Health News Feed
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Curated Kerala health news: health department updates,
disease outbreaks, advisories. Brings users back daily.
Positions platform as health news authority.

SCHEMA (additive migrations)
Migration 0085 — health_news table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  title_ml TEXT NOT NULL, title_en TEXT,
  summary_ml TEXT NOT NULL, summary_en TEXT,
  body_ml TEXT, body_en TEXT,
  source TEXT,
  -- "Kerala Health Department", "WHO", "ICMR"
  source_url TEXT,
  category VARCHAR(50),
  -- outbreak|advisory|policy|awareness|research
  district_id uuid FK districts NULLABLE,
  -- null = state/national level
  importance VARCHAR(20) DEFAULT 'normal',
  -- breaking|high|normal
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

CREATE INDEX idx_news_published
  ON health_news(published_at DESC)
  WHERE is_published = true AND deleted_at IS NULL;

Seed 10 demo news items (ON CONFLICT DO NOTHING).

PAGES
apps/web/app/[locale]/news/page.js
  — "Kerala ആരോഗ്യ വാർത്തകൾ"
  — Breaking news banner (red, importance=breaking)
  — Category tabs: All · Outbreaks · Advisories ·
    Policy · Awareness · Research
  — District filter
  — NewsCard: title, source, category badge,
    date (relative), summary
  — Auto-refresh every 5 minutes (simple
    window.setInterval fetch — no package)

apps/web/app/[locale]/news/[slug]/page.js
  — Full news article
  — Source attribution + link to original
  — Related news (same category)
  — WhatsApp share button
  — Schema.org: NewsArticle JSON-LD

ADMIN
  apps/admin/app/news/page.js
  — Create/edit news items
  — Set importance level
  — Bulk publish from RSS feed (manual paste
    for now — RSS auto-import in future)

HOMEPAGE
  Add "Latest Health News" section:
  3 news cards + "See all news →"
  Breaking news: red banner above hero

API ROUTES
GET /api/news?category=&district=&page=&q=
GET /api/news/[slug]
POST /api/admin/news (admin only)

Smoke tests:
  GET /ml/news returns 200 with news feed
  Breaking news shows red banner
  Category filter works
  District filter works
  Schema.org NewsArticle present


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
