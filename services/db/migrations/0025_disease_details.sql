-- 0025_disease_details.sql
-- Structured disease data extending content_items (type='disease'). Additive.
-- Educational only. No diagnosis; the app never infers a condition for a user.

CREATE TABLE IF NOT EXISTS disease_details (
  content_item_id  uuid PRIMARY KEY REFERENCES content_items(id),
  icd10_code       varchar(10),
  symptoms_ml      text[], symptoms_en text[],
  causes_ml        text[], causes_en text[],
  risk_factors_ml  text[], risk_factors_en text[],
  diagnosis_ml     text,   diagnosis_en text,
  treatment_ml     text,   treatment_en text,
  prevention_ml    text,   prevention_en text,
  emergency_signs_ml text[], emergency_signs_en text[],
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);
