# P-G2 — Search Analytics

**Track:** Track G — Analytics
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
FEATURE: P-G2 — Search Analytics
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Most searched terms, zero-result queries,
filter usage patterns. Helps improve platform.

SCHEMA (additive migrations)
Migration 0115 — search_logs table:
  id uuid PK DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  locale VARCHAR(5),
  result_count INT NOT NULL,
  filters JSONB,
  -- {specialty_id, district_id, mode, etc}
  clicked_result_id uuid NULLABLE,
  clicked_result_type VARCHAR(50),
  session_id VARCHAR(64),
  searched_at TIMESTAMPTZ DEFAULT now()

Wire into search API:
  After every search → INSERT search_log
  (async, do not delay search response)

ANALYTICS
services/analytics/search.js:
  getTopQueries(days=7, limit=20)
  getZeroResultQueries(days=7)
    -- queries where result_count = 0
  getFilterUsage(days=30)
    -- which filters used most
  getQueryToClickRate()
    -- queries that led to profile clicks

ADMIN
apps/admin/app/analytics/search/page.js
  — Top 20 search queries
  — Zero-result queries (action items to fix)
  — Filter usage breakdown
  — "Queries with no doctors" → add missing
    specialty or doctor recommendation

Smoke tests:
  Search logged after each query
  Zero-result queries identified
  Admin search analytics page shows data


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
