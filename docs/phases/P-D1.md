# P-D1 — Doctor Q&A Feature

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
FEATURE: P-D1 — Doctor Q&A Feature
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Patients ask health questions publicly, doctors answer.
Moderated. Drives repeat visits, builds SEO content,
creates doctor engagement.

SCHEMA (additive migrations)
Migration 0083 — qa_questions table:
  id uuid PK, slug VARCHAR(255) UNIQUE,
  patient_id uuid FK users NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  specialty_id uuid FK specialties,
  is_anonymous BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  -- pending|published|rejected
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

Migration 0084 — qa_answers table:
  id uuid PK,
  question_id uuid FK qa_questions NOT NULL,
  doctor_id uuid FK healthcare_providers NOT NULL,
  body TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  -- pending|published|rejected
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ

MEDICAL SAFETY CONSTRAINTS:
  Questions must NOT ask for diagnosis.
  Content moderation template filters:
  — "diagnose", "do I have", "is this cancer" →
    redirect to "Consult a doctor for diagnosis"
  — Answers from doctors must not include
    diagnosis or prescription
  — All content reviewed before publishing

PAGES
apps/web/app/[locale]/ask/page.js
  — Browse published Q&As by specialty
  — Search questions
  — "Ask a Question" form (requires login)
  — Disclaimer: "Not for emergency situations.
    Answers are educational only."

apps/web/app/[locale]/ask/[slug]/page.js
  — Question + answers
  — "Was this helpful?" vote on each answer
  — "Ask a similar question" CTA
  — Schema.org: QAPage JSON-LD
  — Related questions (same specialty)

apps/web/app/[locale]/ask/new/page.js
  — Ask form: title, detailed description,
    specialty, anonymous option
  — Pre-submit checker: if "diagnose" or
    "do I have" in text → warning message

Doctor portal:
  apps/portal/app/qa/page.js
  — Questions in my specialty awaiting answers
  — "Answer" → inline text editor
  — My previous answers + ratings

API ROUTES
GET  /api/qa?specialty=&q=&page=
GET  /api/qa/[slug]
POST /api/qa/questions
POST /api/qa/questions/[id]/answers
POST /api/qa/answers/[id]/helpful

ADMIN moderation:
  apps/admin/app/qa/page.js
  — Review pending questions and answers
  — Approve/reject with reason

Smoke tests:
  Post question → appears in moderation queue
  Admin approves → public on /ask
  Doctor answers → answer in moderation queue
  Helpful vote count increments
  Schema.org QAPage present


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
