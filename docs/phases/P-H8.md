# P-H8 — Public API for Partners

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
FEATURE: P-H8 — Public API for Partners
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
REST API for partner integrations: hospitals,
insurance companies, government health departments.

SCHEMA (additive migrations)
Migration 0120 — api_keys table:
  id uuid PK,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  -- bcrypt hash of the actual key
  partner_name TEXT NOT NULL,
  partner_type VARCHAR(50),
  -- hospital|insurance|government|developer
  rate_limit_per_hour INT DEFAULT 1000,
  allowed_endpoints TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ

PUBLIC API
  Separate route prefix: /api/public/v1/
  Authentication: X-API-Key header
  
  Endpoints:
  GET /api/public/v1/doctors
    — Verified doctors only
    — Limited fields (no encrypted contact)
  GET /api/public/v1/hospitals
  GET /api/public/v1/specialties
  GET /api/public/v1/districts
  GET /api/public/v1/health-data/diseases/[slug]

DOCUMENTATION
  docs/api/PUBLIC_API.md
  — Authentication guide
  — All endpoints with examples
  — Rate limits
  — Terms of use

ADMIN
  apps/admin/app/api-keys/page.js
  — Issue + revoke API keys
  — Usage analytics per key

Smoke tests:
  API key authentication works
  Rate limit enforced per key
  Endpoints return correct data
  Admin can create and revoke keys


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
