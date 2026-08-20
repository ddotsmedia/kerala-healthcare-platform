-- P-F9: doctor publications and awards for the public profile. Additive only.

CREATE TABLE IF NOT EXISTS provider_publications (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id  uuid NOT NULL REFERENCES doctors(id),
  title        text NOT NULL,
  journal      text,
  year         integer,
  doi          text,
  pubmed_id    text,
  url          text,
  type         varchar(50) NOT NULL DEFAULT 'paper'
                 CHECK (type IN ('paper','book','chapter','case_report','poster')),
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz,
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_provider_pubs ON provider_publications (provider_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS provider_awards (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id  uuid NOT NULL REFERENCES doctors(id),
  title        text NOT NULL,
  awarded_by   text,
  year         integer,
  description  text,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz,
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_provider_awards ON provider_awards (provider_id) WHERE deleted_at IS NULL;
