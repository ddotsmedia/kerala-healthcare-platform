# Phase 1 — Healthcare Directory

**Duration:** 3 weeks
**Status:** 🟡 In progress
**Prerequisite:** Phase 0 complete (v0.1.0-foundation)

---

## What This Phase Builds

- Doctor profiles: full schema, verification status, specialties, languages
- Hospital profiles: departments, services, accreditations, infrastructure
- Clinic and diagnostic centre listings
- Search: text search + filters (specialty, district, consultation mode, language)
- Malayalam + Manglish search support
- Public-facing directory pages (SSR, SEO-optimised)
- Provider verification queue (admin)
- Doctor and hospital portal — profile management

---

## Phase 1 Deliverables

| Deliverable | Definition of Done |
|---|---|
| Doctor schema live | healthcare_providers table migrated, seed data for 10 doctors |
| Hospital schema live | hospitals, departments, hospital_services tables migrated |
| Search working | Search by name, specialty, district returns correct results in ml + en |
| Public pages live | Doctor profile page and hospital profile page render with SSR |
| SEO tags correct | Lighthouse SEO score ≥ 90 on doctor profile page |
| Verification queue | Admin can see unverified providers and mark them verified |
| Portal: profile edit | Doctor can log in, edit their profile, changes save and reflect publicly |

---

## Claude Code Prompt — Phase 1

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
PHASE: 1 — Healthcare Directory
PREREQUISITE: Phase 0 complete and all smoke tests passing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build the complete Healthcare Directory — the platform's most
SEO-critical module. Every doctor and hospital profile is a unique
indexed landing page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 TASKS — execute in order, commit after each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 1.1 — Healthcare provider schema
Migrations (additive only, ON CONFLICT DO NOTHING in seeds):
• specialties (id, name_ml, name_en, slug, parent_id)
• districts (id, name_ml, name_en, slug)
• healthcare_providers
  (id uuid PK, user_id uuid FK users, slug VARCHAR(255) UNIQUE,
   type VARCHAR(50), — doctor|nurse|physio|psychologist|...
   registration_number VARCHAR(100), registration_council VARCHAR(100),
   verification_status VARCHAR(20) DEFAULT 'pending',
   verified_at TIMESTAMPTZ, verified_by uuid,
   name_ml TEXT, name_en TEXT NOT NULL,
   photo_url TEXT, bio_ml TEXT, bio_en TEXT,
   gender VARCHAR(10), languages TEXT[],
   experience_years INT, consultation_fee_inr INT,
   consultation_modes TEXT[], — in_person|video|phone
   district_id uuid FK districts,
   created_at TIMESTAMPTZ DEFAULT now(),
   updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ)
• provider_specialties (provider_id, specialty_id) — junction
• provider_education (id, provider_id, degree, institution, year)
• Seed:demo — 10 doctors across 5 districts, 3 specialties
• Commit: feat(directory): healthcare provider and specialty schema

TASK 1.2 — Hospital schema
Migrations:
• hospitals
  (id uuid PK, slug VARCHAR(255) UNIQUE,
   name_ml TEXT, name_en TEXT NOT NULL,
   type VARCHAR(50), — government|private|charitable|ayurveda|...
   photo_url TEXT, description_ml TEXT, description_en TEXT,
   address_ml TEXT, address_en TEXT,
   district_id uuid FK districts,
   lat DECIMAL(10,8), lng DECIMAL(11,8),
   phone TEXT[], email TEXT, website TEXT,
   bed_count INT, icu_beds INT, nicu_beds INT,
   verification_status VARCHAR(20) DEFAULT 'pending',
   created_at TIMESTAMPTZ DEFAULT now(),
   updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ)
• hospital_departments (id, hospital_id, name_ml, name_en, slug)
• hospital_services (id, hospital_id, service_slug, available BOOLEAN)
  — service_slug enum: mri|ct|icu|nicu|dialysis|ivf|cath_lab|...
• hospital_accreditations (id, hospital_id, body, certificate_url,
  valid_until TIMESTAMPTZ)
• hospital_providers (hospital_id, provider_id, primary BOOLEAN)
• Seed:demo — 5 hospitals, 2 departments each
• Commit: feat(directory): hospital, department, and services schema

TASK 1.3 — Search service
• services/search/index.js — PostgreSQL full-text search (no new packages)
  buildDoctorQuery(filters): name, specialty_id, district_id,
    consultation_mode, language, verification_status, limit, offset
  buildHospitalQuery(filters): name, district_id, service_slug,
    department, limit, offset
• Full-text: tsvector on name_ml + name_en, indexed with GIN
• Manglish support: transliteration map in services/search/manglish.js
  (common Manglish→Malayalam mappings for top 50 medical terms)
• Unified search: searchAll(query, filters) returns {doctors, hospitals}
• Commit: feat(search): PostgreSQL full-text search for providers and hospitals

TASK 1.4 — Public directory pages (SSR)
apps/web/src/app/[locale]/doctors/page.js
  — Doctor search results page
  — Server-side data fetch, filter UI, paginated results
  — Filters: specialty, district, consultation mode, language spoken
apps/web/src/app/[locale]/doctors/[slug]/page.js
  — Doctor profile page (SSR)
  — SEO: generateMetadata() with name, specialty, district in title
  — Schema.org: Physician structured data in JSON-LD
  — Sections: bio, education, specialties, consultation info, hospitals
  — Medical disclaimer: "This profile is for information only.
    Consult this doctor for medical advice."
apps/web/src/app/[locale]/hospitals/page.js
  — Hospital search results page
apps/web/src/app/[locale]/hospitals/[slug]/page.js
  — Hospital profile page (SSR)
  — Schema.org: Hospital structured data in JSON-LD
• Commit: feat(directory): SSR doctor and hospital public pages with SEO

TASK 1.5 — Directory components
packages/ui/components/directory/:
  DoctorCard — photo, name, specialty, district, verification badge,
               fee, consultation modes, book CTA
  HospitalCard — photo, name, type, district, services badges
  SpecialtyFilter — multi-select with Malayalam labels
  DistrictFilter — dropdown with all 14 Kerala districts in ml+en
  VerificationBadge — verified|pending|unverified states
  ConsultationModeChip — in-person|video|phone pill badges
• Commit: feat(ui): directory components — DoctorCard, HospitalCard, filters

TASK 1.6 — Provider verification queue (admin)
apps/admin/src/app/verification/page.js
  — Table: unverified providers, sortable by submission date
  — Actions: view documents, mark verified, mark rejected (with reason)
  — Audit log entry on every verification action
API routes:
  GET  /api/admin/verification/queue
  POST /api/admin/verification/:id/approve
  POST /api/admin/verification/:id/reject  { reason }
• Only platform_admin and verification_agent roles can access
• Commit: feat(admin): provider verification queue with audit logging

TASK 1.7 — Doctor portal: profile management
apps/portal/src/app/profile/page.js — edit own profile
apps/portal/src/app/profile/education/page.js — manage education
apps/portal/src/app/profile/hospitals/page.js — manage hospital affiliations
API routes:
  GET  /api/portal/profile
  PATCH /api/portal/profile         — partial update (own profile only)
  POST /api/portal/profile/education
  DELETE /api/portal/profile/education/:id
• Profile edits set verification_status back to 'pending' on key field changes
  (name, registration_number, qualifications)
• Commit: feat(portal): doctor profile management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMOKE TESTS — verify before closing session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ GET /ml/doctors — renders doctor list in Malayalam
□ GET /ml/doctors/[slug] — doctor profile page renders, JSON-LD present
□ GET /ml/hospitals/[slug] — hospital profile page renders
□ Search "cardiology" returns cardiologist doctors
□ Search "thrissur" returns providers in Thrissur district
□ Manglish "kaliveedu" or "vaidyan" returns results
□ Admin verification queue loads, approve action works
□ Doctor logs into portal, edits bio, change visible on public profile
□ Lighthouse SEO score ≥ 90 on doctor profile page
```

---

## Reconciliation Note (added after partial build on 2026-06-30)

Phase 1 was partially built across multiple sessions due to chat-paste
truncation. The following was confirmed complete as of commit `a85902f`:

- Migrations 0001–0012 (specialties, districts, healthcare_providers,
  hospitals, provider_specialties, provider_education,
  hospital_departments, hospital_services, hospital_accreditations,
  hospital_providers, provider_verifications)
- services/search — Manglish↔Malayalam transliteration, parameterized
  doctor/hospital search, tsvector builders
- services/db — pg pool + checksum-tracked migration runner
- apps/web — /ml + /en doctor/hospital list + profile pages,
  Schema.org JSON-LD, non-dismissable disclaimer
- apps/admin — verification queue with manual NMC cross-check

**Still to verify against this spec before tagging v0.2.0-directory:**
- [ ] TASK 1.5 — Directory components in packages/ui (DoctorCard,
      HospitalCard, SpecialtyFilter, DistrictFilter, VerificationBadge,
      ConsultationModeChip)
- [ ] TASK 1.7 — Doctor portal profile management (apps/portal)
- [ ] tsvector population wired into write path (not just initial seed)
- [ ] Full smoke test checklist run end-to-end
