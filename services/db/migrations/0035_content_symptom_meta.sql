-- 0035_content_symptom_meta.sql
-- Article category tag + symptom body-area grouping. Additive only.

ALTER TABLE content_items ADD COLUMN IF NOT EXISTS category varchar(40);
ALTER TABLE symptoms ADD COLUMN IF NOT EXISTS body_area varchar(30);
CREATE INDEX IF NOT EXISTS idx_content_category ON content_items (category) WHERE deleted_at IS NULL;
