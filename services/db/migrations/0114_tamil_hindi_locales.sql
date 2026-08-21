-- P-H7: Tamil (ta) + Hindi (hi) locale content columns. Additive only.

ALTER TABLE districts   ADD COLUMN IF NOT EXISTS name_ta text;
ALTER TABLE districts   ADD COLUMN IF NOT EXISTS name_hi text;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS name_ta text;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS name_hi text;
ALTER TABLE symptoms    ADD COLUMN IF NOT EXISTS name_ta text;
ALTER TABLE symptoms    ADD COLUMN IF NOT EXISTS name_hi text;

ALTER TABLE content_items ADD COLUMN IF NOT EXISTS title_ta   text;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS title_hi   text;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS excerpt_ta text;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS excerpt_hi text;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS body_ta    text;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS body_hi    text;
