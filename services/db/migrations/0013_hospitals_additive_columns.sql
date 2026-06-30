-- 0013_hospitals_additive_columns.sql
-- Additive columns to align hospitals with PHASE_1_SPEC. Never drop.
-- NOTE: spec lists plaintext phone/email; we keep the existing ENCRYPTED
-- phone_enc/email_enc (SECURITY.md column-level encryption) and only add the
-- non-sensitive spec fields here. See BLOCKERS.md for this deviation.

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS type      varchar(50),   -- government|private|charitable|ayurveda|...
  ADD COLUMN IF NOT EXISTS icu_beds  integer CHECK (icu_beds  >= 0),
  ADD COLUMN IF NOT EXISTS nicu_beds integer CHECK (nicu_beds >= 0),
  ADD COLUMN IF NOT EXISTS website   text;
