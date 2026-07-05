# P-F2 — Doctor Self-Registration

**Track:** Track F — Provider Tools
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
FEATURE: P-F2 — Doctor Self-Registration
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Complete self-registration flow for doctors.
NMC verification automated (or semi-automated).
Doctors should be able to go live within 24-48 hours.

SCHEMA (additive migrations)
Migration 0102:
  ALTER TABLE healthcare_providers
    ADD COLUMN IF NOT EXISTS self_registered
      BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS registration_documents
      JSONB[],
    -- [{type, file_url, uploaded_at}]
    ADD COLUMN IF NOT EXISTS registration_ip INET,
    ADD COLUMN IF NOT EXISTS last_profile_update
      TIMESTAMPTZ;

Migration 0103 — nmc_verification_checks table:
  id uuid PK,
  provider_id uuid FK healthcare_providers,
  nmc_registration_number VARCHAR(100),
  council VARCHAR(100),
  check_method VARCHAR(50),
  -- manual|api|scrape
  check_result JSONB,
  verified BOOLEAN DEFAULT false,
  checked_by uuid FK users,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()

REGISTRATION FLOW
apps/web/app/[locale]/register/doctor/page.js
  Multi-step registration:

  Step 1: Basic Info
    Full name (ml + en), gender, date of birth,
    profile photo URL

  Step 2: Professional Details
    Registration number, council name,
    specialty (multi-select), experience years,
    languages spoken

  Step 3: Education
    Degree, institution, year (add multiple)

  Step 4: Practice Details
    District, consultation modes,
    consultation fee, WhatsApp number
    Hospital affiliations (search + add)

  Step 5: Document Upload
    Registration certificate (image upload)
    Degree certificate (image upload)
    Government ID (image upload)
    Files stored as base64 in DB (S3 when available)

  Step 6: Review & Submit
    Summary of all entered details
    Terms agreement checkbox
    Submit → account status = pending_verification

POST-REGISTRATION
  Admin notified of new registration
  Email to doctor:
    "Your profile is under review.
    You'll go live within 24-48 hours."

  Admin verification queue shows new registration
  with documents attached
  One-click approve → status = published
  One-click reject with reason → email to doctor

Smoke tests:
  Complete 6-step registration → status=pending
  Admin sees in verification queue
  Admin approves → doctor appears in directory
  Admin rejects → doctor gets email with reason


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
