# Phase 3 — Health Knowledge Centre

**Duration:** 2 weeks
**Status:** ⬜ Not started
**Prerequisite:** Phase 2 complete and all smoke tests passing

---

## What This Phase Builds

- CMS: content types for articles, disease pages, procedure guides, news
- Editorial workflow: draft → in_review → approved → published → archived
- Disease library: structured pages with symptoms, causes, treatment, specialists
- Symptom navigator: symptom → possible specialties → nearby providers
- Health articles and medical news feed
- Health calculators: BMI, pregnancy due date, water intake
- Medical disclaimer system across all content

---

## Phase 3 Deliverables

| Deliverable | Definition of Done |
|---|---|
| CMS live | Content editor can create, submit for review, and publish an article |
| Disease library | 20 disease pages live (seed data) in ml + en with full structure |
| Symptom navigator | 10 symptoms mapped to specialties, links to doctor search |
| Articles feed | Public articles page with pagination, category filter, locale switch |
| Calculators | BMI and pregnancy due date calculators functional on mobile |
| Disclaimers | Every health content page shows medical disclaimer — visible, non-dismissable |

---

## Claude Code Prompt — Phase 3

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
• Build + commit after each phase. Conventional commits.
• Mobile-first. TypeScript forbidden. No new npm packages
  unless zero alternatives exist.
• Default AI model: claude-haiku everywhere.
• No verbose comments, no re-reads, batch writes per file.
• File >400 lines: split into sub-components.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Kerala Healthcare Platform
PHASE: 3 — Health Knowledge Centre
PREREQUISITE: Phase 2 complete and all smoke tests passing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build the Health Knowledge Centre — trusted, medically reviewed
content in Malayalam and English. All content is educational only.
No diagnosis. No treatment recommendations. Disclaimers everywhere.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 TASKS — execute in order, commit after each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 3.1 — CMS schema
Migrations:
• content_categories (id, slug, name_ml, name_en, parent_id)
• content_items
  (id uuid PK, slug VARCHAR(255) UNIQUE, type VARCHAR(50),
   — article|disease|procedure|news|calculator|faq
   title_ml TEXT, title_en TEXT,
   body_ml TEXT, body_en TEXT,
   excerpt_ml TEXT, excerpt_en TEXT,
   featured_image_url TEXT, author_id uuid FK users,
   reviewer_id uuid FK users, reviewed_at TIMESTAMPTZ,
   review_due_at TIMESTAMPTZ,
   status VARCHAR(20) DEFAULT 'draft',
   — draft|in_review|approved|published|archived
   published_at TIMESTAMPTZ,
   meta_title_ml TEXT, meta_title_en TEXT,
   meta_desc_ml TEXT, meta_desc_en TEXT,
   requires_disclaimer BOOLEAN DEFAULT true,
   created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ)
• content_item_categories (content_item_id, category_id)
• content_item_specialties (content_item_id, specialty_id)
  — links disease/procedure pages to relevant specialists
• content_versions
  (id, content_item_id, version_number INT, body_ml TEXT, body_en TEXT,
   changed_by uuid, created_at TIMESTAMPTZ DEFAULT now())
• Seed:demo — 20 disease pages, 10 articles, 5 procedure guides
• Commit: feat(cms): content management schema with versioning

TASK 3.2 — CMS API and editorial workflow
GET    /api/cms/content?type=&status=&locale=
POST   /api/cms/content                — create draft (content_editor+)
PATCH  /api/cms/content/:id            — update draft
POST   /api/cms/content/:id/submit     — submit for review
POST   /api/cms/content/:id/approve    — approve (reviewer role)
POST   /api/cms/content/:id/publish    — publish (platform_admin+)
POST   /api/cms/content/:id/archive
GET    /api/cms/content/:id/versions
• On publish: create content_version record, set published_at
• Commit: feat(cms): editorial workflow API with role-gated state transitions

TASK 3.3 — Admin CMS interface
apps/admin/src/app/cms/page.js — content list with status filters
apps/admin/src/app/cms/[id]/page.js — edit content with rich text editor
  Use: native contenteditable or textarea (no new npm packages)
  Support: headings, bold, italic, unordered list, links only
apps/admin/src/app/cms/[id]/review/page.js
  — reviewer view: side-by-side ml/en, approve/reject with notes
• Commit: feat(admin): CMS management interface with editorial workflow

TASK 3.4 — Disease library schema extension
• disease_details table extending content_items:
  (content_item_id PK FK, icd10_code VARCHAR(10),
   symptoms_ml TEXT[], symptoms_en TEXT[],
   causes_ml TEXT[], causes_en TEXT[],
   risk_factors_ml TEXT[], risk_factors_en TEXT[],
   diagnosis_ml TEXT, diagnosis_en TEXT,
   treatment_ml TEXT, treatment_en TEXT,
   prevention_ml TEXT, prevention_en TEXT,
   emergency_signs_ml TEXT[], emergency_signs_en TEXT[])
• Seed:demo — populate 20 disease records
• Commit: feat(cms): disease library structured schema

TASK 3.5 — Symptom navigator
• symptoms table (id, name_ml, name_en, slug, icon_name)
• symptom_specialties (symptom_id, specialty_id, urgency_level)
  — urgency: routine|soon|urgent|emergency
• API:
  GET /api/symptoms — full symptom list
  GET /api/symptoms/:slug — symptom + mapped specialties + urgency
  GET /api/symptoms/:slug/doctors — nearby doctors for top specialty
• Page: apps/web/src/app/[locale]/symptoms/page.js
  — grid of symptom cards with icons, tap to see guidance
  apps/web/src/app/[locale]/symptoms/[slug]/page.js
  — symptom detail: what it means, when to seek care (urgency banner),
    linked specialties, find a doctor CTA
  — MUST show disclaimer: "This is not a diagnosis. See a doctor."
• Commit: feat(knowledge): symptom navigator with urgency levels

TASK 3.6 — Public knowledge pages
apps/web/src/app/[locale]/health/page.js
  — article feed: latest published, category tabs, search
apps/web/src/app/[locale]/health/[slug]/page.js
  — article/disease/procedure page (SSR)
  — Schema.org: MedicalWebPage JSON-LD
  — Persistent disclaimer banner (not dismissable)
  — Related specialists and related articles from content_item_specialties
apps/web/src/app/[locale]/diseases/page.js — A-Z disease index
apps/web/src/app/[locale]/diseases/[slug]/page.js — disease detail page
• Commit: feat(knowledge): public health knowledge pages with SSR and SEO

TASK 3.7 — Health calculators
apps/web/src/app/[locale]/tools/bmi/page.js
  — Height + weight inputs (metric + imperial), BMI result, category,
    standard disclaimer about BMI limitations
apps/web/src/app/[locale]/tools/due-date/page.js
  — LMP date input → estimated due date, trimester info
apps/web/src/app/[locale]/tools/water-intake/page.js
  — Weight input → daily water intake recommendation
• All calculators: mobile-first, Malayalam labels, no external packages
• Each shows: "Consult your doctor for personalised advice."
• Commit: feat(knowledge): health calculators — BMI, due date, water intake

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMOKE TESTS — verify before closing session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Create article as content_editor → submit → approve → publish flow works
□ Published article visible at /ml/health/[slug] with disclaimer
□ Disease page has JSON-LD MedicalWebPage structured data
□ Symptom navigator: tap "fever" → see specialties + find doctor CTA
□ BMI calculator: enter height+weight → result shown in Malayalam
□ Disclaimer banner visible and not dismissable on all health pages
□ CMS review queue shows in_review items to reviewer role
```
