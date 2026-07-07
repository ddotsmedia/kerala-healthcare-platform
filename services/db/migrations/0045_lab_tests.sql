-- 0045_lab_tests.sql
-- P-A1: tests offered by a diagnostic lab. Additive only.
-- (Spec labelled this 0040; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS lab_tests (
  id                        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id                    uuid NOT NULL REFERENCES diagnostic_labs(id),
  test_name_ml              text,
  test_name_en              text NOT NULL,
  test_code                 varchar(50),
  category                  varchar(100),
  price_inr                 integer,
  sample_type               varchar(100),
  fasting_required          boolean NOT NULL DEFAULT false,
  preparation_ml            text,
  preparation_en            text,
  report_hours              integer NOT NULL DEFAULT 24,
  home_collection_available boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lab_tests_lab ON lab_tests (lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_category ON lab_tests (category);
CREATE INDEX IF NOT EXISTS idx_lab_tests_name ON lab_tests (test_name_en);
