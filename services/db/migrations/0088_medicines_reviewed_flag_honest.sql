-- 0088_medicines_reviewed_flag_honest.sql
-- Data correction: P-E1 seeded medicines with reviewed_by_doctor = true, but the
-- content has NOT been reviewed by a doctor. Set it to false so the DB does not
-- carry a false "doctor-reviewed" claim. Flip back to true only after a real
-- qualified-clinician review. Additive/data-only — no schema change.

UPDATE medicines
   SET reviewed_by_doctor = false, updated_at = now()
 WHERE reviewed_by_doctor = true AND deleted_at IS NULL;
