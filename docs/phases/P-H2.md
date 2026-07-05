# P-H2 — S3 File Storage

**Track:** Track H — Infrastructure
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
FEATURE: P-H2 — S3 File Storage
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Wire AWS S3 or Cloudflare R2 for prescription,
lab report, and profile photo uploads.
Replace base64 DB storage.

NO NEW SCHEMA.
Update file_url columns to store S3 URLs
instead of base64 data URIs.

FILE SERVICE
services/storage/index.js:
  uploadFile(buffer, filename, contentType, folder):
    — Upload to S3/R2
    — Returns public URL
    — Folder structure: prescriptions/[userId]/
      lab-reports/[userId]/
      profile-photos/[providerId]/
      documents/[providerId]/

  deleteFile(url):
    — Delete from S3/R2

  getSignedUrl(key, expiresIn=3600):
    — For private files (lab reports, prescriptions)

S3 CONFIGURATION
  AWS S3 or Cloudflare R2 (R2 recommended —
  no egress fees, cheaper for India)
  Bucket: malayalidoctor-files
  CORS: allow malayalidoctor.com
  Lifecycle: delete prescription files after 7 years

.env.production additions:
  S3_BUCKET, S3_REGION, S3_ACCESS_KEY,
  S3_SECRET_KEY, S3_ENDPOINT (for R2)

MIGRATION OF EXISTING DATA
  services/storage/migrate.js:
  Find all records with base64 data URIs
  Upload each to S3, update file_url
  Run once, report results

UPLOAD COMPONENT UPDATE
  All file upload inputs → use multipart upload
  → services/storage/index.js
  → Return S3 URL

Smoke tests:
  Upload prescription → stored in S3, URL works
  Profile photo upload → serves from CDN
  Signed URL works for private lab reports
  Base64 migration script runs without errors


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
