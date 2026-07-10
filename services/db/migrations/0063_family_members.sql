-- 0063_family_members.sql
-- P-C5: family members under one account. Additive only.
-- (Spec labelled this 0074; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS family_members (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_user_id uuid NOT NULL REFERENCES users(id),
  name_ml         text,
  name_en         text NOT NULL,
  relationship    varchar(50)
                    CHECK (relationship IN ('spouse','child','parent','sibling','grandparent','other')),
  date_of_birth   date,
  gender          varchar(10),
  blood_group     varchar(5),
  is_minor        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members (primary_user_id) WHERE deleted_at IS NULL;
