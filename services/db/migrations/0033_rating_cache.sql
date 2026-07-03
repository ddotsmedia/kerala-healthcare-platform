-- 0033_rating_cache.sql
-- Cache avg rating + count on doctors/hospitals; recalc via trigger. Additive only.

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS rating_avg decimal(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS rating_avg decimal(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

CREATE OR REPLACE FUNCTION update_entity_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'doctor' THEN
    UPDATE doctors SET
      rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM reviews
                     WHERE entity_type = 'doctor' AND entity_id = NEW.entity_id
                       AND status = 'approved' AND deleted_at IS NULL),
      rating_count = (SELECT COUNT(*) FROM reviews
                       WHERE entity_type = 'doctor' AND entity_id = NEW.entity_id
                         AND status = 'approved' AND deleted_at IS NULL)
    WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'hospital' THEN
    UPDATE hospitals SET
      rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM reviews
                     WHERE entity_type = 'hospital' AND entity_id = NEW.entity_id
                       AND status = 'approved' AND deleted_at IS NULL),
      rating_count = (SELECT COUNT(*) FROM reviews
                       WHERE entity_type = 'hospital' AND entity_id = NEW.entity_id
                         AND status = 'approved' AND deleted_at IS NULL)
    WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_rating ON reviews;
CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_entity_rating();
