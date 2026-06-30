# Data Model — Phase 1 Healthcare Directory

*Additive only. Never drop tables or columns. Migrations live in `services/db/migrations/`.*

---

## Migration order

| # | File | Purpose |
|---|---|---|
| 0001 | `0001_extensions.sql` | `uuid-ossp`, `pgcrypto`, `unaccent`, `pg_trgm` |
| 0002 | `0002_reference_districts.sql` | 14 Kerala districts (ml + en) |
| 0003 | `0003_specialties.sql` | Specialty taxonomy (ml + en) — not diagnostic categories |
| 0004 | `0004_doctors.sql` | Doctor directory + NMC verification gate + search |
| 0005 | `0005_hospitals.sql` | Hospital directory + verification gate + search |
| 0006 | `0006_provider_verification.sql` | Verification queue + audit trail |
| 0007 | `0007_provider_specialties.sql` | Doctor ↔ specialty (many-to-many) |
| 0008 | `0008_provider_education.sql` | Doctor qualifications / education |
| 0009 | `0009_hospital_departments.sql` | Hospital departments |
| 0010 | `0010_hospital_services.sql` | Hospital services / facilities |
| 0011 | `0011_hospital_accreditations.sql` | Hospital accreditations (NABH/NABL/ISO) |
| 0012 | `0012_hospital_providers.sql` | Hospital ↔ doctor (many-to-many) |

---

## Conventions (all tables)

- PK `id uuid DEFAULT uuid_generate_v4()`.
- Timestamps `created_at`, `updated_at`, soft-delete `deleted_at`.
- Reference data inserted with `ON CONFLICT DO NOTHING` (idempotent).
- Sensitive contact (`mobile_enc`, `email_enc`, `phone_enc`) stored as `bytea`, encrypted at column level via `pgcrypto` in the app layer — never plaintext.

---

## Verification gate (mandatory)

Both `doctors` and `hospitals` carry `verification_status` and `listing_status`.

- A row **cannot** reach `listing_status = 'published'` unless `verification_status = 'verified'` (doctors also require `nmc_verified = true`).
- Enforced by **BEFORE INSERT/UPDATE triggers** (`trg_doctor_publish_guard`, `trg_hospital_publish_guard`) — defense in depth on top of app-layer checks.
- Every decision recorded in `provider_verifications` with `verified_by`, `verified_at`, `evidence_ref`, and (for doctors) NMC cross-check result.
- **NMC check (Phase 1) is MANUAL:** a `verification_agent` looks up the registration number on the NMC public search portal and records `nmc_checked` / `nmc_match` + evidence. Automated NMC API integration is deferred to a future phase.

---

## Search (Malayalam + Manglish)

- `search_ml` and `search_manglish` are `tsvector` columns, populated by the app/search service (`services/search/`).
- GIN indexes on both vectors; `pg_trgm` GIN index on display name for fuzzy matching.
- `unaccent` folds diacritics so Manglish (Roman transliteration) queries match.

---

## SEO slugs (permanent)

- Doctor: `/doctors/dr-[firstname]-[lastname]-[specialty]-[district]` → `doctors.slug` (UNIQUE).
- Hospital: `/hospitals/[name]-[district]` → `hospitals.slug` (UNIQUE).
- Slugs are permanent once published — never changed.

---

## Entity summary

### `districts`
14 Kerala districts. `code` unique. Malayalam-first naming.

### `specialties`
Specialty taxonomy only. **No clinical/diagnostic logic.** `slug` unique.

### `doctors`
Identity, permanent slug, NMC registration + verification, specialty/district FKs, languages array (default `['ml']`), bilingual profile, encrypted contact, search vectors. Publish-gated by verification.

### `hospitals`
Bilingual name, permanent slug, verification, district FK, location (lat/lng), profile, encrypted contact, search vectors. Publish-gated by verification.

### `provider_verifications`
Polymorphic (`provider_type` + `provider_id`) verification queue and audit log. NMC check fields for doctors.

### `provider_specialties`
Doctor ↔ specialty many-to-many (`is_primary` flag). `doctors.specialty_id` stays as the primary specialty for the SEO slug.

### `provider_education`
Doctor qualifications: degree, institution (ml/en), year completed.

### `hospital_departments`
Hospital departments (ml/en). Taxonomy only — no clinical content.

### `hospital_services`
Hospital services/facilities (ml/en, `available_24x7`). Facility listing only — no clinical claims.

### `hospital_accreditations`
Accreditations (NABH/NABL/ISO): body, number, validity, verified flag, evidence.

### `hospital_providers`
Hospital ↔ doctor many-to-many, optional `department_id` and `role`.

---

## Not in Phase 1

- Appointments / slots → Phase 2.
- Patient health records (separate RLS schema) → Phase 2.
- Knowledge content → Phase 3. Jobs → Phase 4. AI → Phase 5.

---

*Data Model v1.0 (Phase 1) · additive edits only.*
