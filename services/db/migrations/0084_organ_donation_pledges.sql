-- 0084_organ_donation_pledges.sql
-- Organ donation awareness pledges. Additive only. Public pledge (user_id optional).
-- This is an awareness pledge only — NOT a legal donor registration. The official
-- registry is Kerala KNOS (linked from the page).

CREATE TABLE IF NOT EXISTS organ_donation_pledges (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  uuid REFERENCES users(id),
  name                     text NOT NULL,
  email                    text,
  phone                    text,
  district_id              uuid REFERENCES districts(id),
  organs_pledged           text[],           -- kidney|liver|heart|lungs|cornea|all
  knos_registration_number text,             -- if already registered with KNOS
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz,
  deleted_at               timestamptz
);
CREATE INDEX IF NOT EXISTS idx_organ_pledges_created ON organ_donation_pledges (created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organ_pledges_district ON organ_donation_pledges (district_id) WHERE deleted_at IS NULL;
