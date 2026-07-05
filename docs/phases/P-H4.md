# P-H4 — ABDM Integration

**Track:** Track H — Infrastructure
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
FEATURE: P-H4 — ABDM Integration
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Ayushman Bharat Digital Mission integration:
ABHA ID creation and PHR linking.

IMPORTANT: ABDM sandbox registration required.
Register at sandbox.abdm.gov.in before starting.

SCHEMA (additive migrations)
Migration 0118:
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS abha_id VARCHAR(17),
    -- format: XX-XXXX-XXXX-XXXX
    ADD COLUMN IF NOT EXISTS abha_address TEXT,
    -- @abdm handle
    ADD COLUMN IF NOT EXISTS abha_verified
      BOOLEAN DEFAULT false;

ABDM SERVICE
services/abdm/index.js:
  createAbhaId(mobile, otp):
    — ABDM M1 API: generate ABHA ID via mobile OTP
  linkHealthRecords(abhaId):
    — ABDM M2 API: link PHR records to ABHA
  fetchLinkedRecords(abhaId):
    — Pull records from other ABDM-linked providers

PATIENT PORTAL
  apps/web/app/[locale]/patient/abha/page.js:
  — "Link your ABHA Health ID"
  — What is ABHA: brief explanation
  — Create ABHA: mobile OTP flow
  — View linked health records from other providers

Note: ABDM APIs are sandbox first — production
  requires NHA approval. Build sandbox integration,
  document production activation steps.

Smoke tests:
  ABHA ID creation flow works in sandbox
  ABHA ID stored in user record
  Linked records displayed


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
