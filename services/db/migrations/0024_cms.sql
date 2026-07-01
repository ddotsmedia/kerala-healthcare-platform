-- 0024_cms.sql
-- Health Knowledge Centre CMS. Additive only.

CREATE TABLE IF NOT EXISTS content_categories (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       text UNIQUE NOT NULL,
  name_ml    text NOT NULL,
  name_en    text NOT NULL,
  parent_id  uuid REFERENCES content_categories(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS content_items (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug               text UNIQUE NOT NULL,
  type               varchar(50) NOT NULL DEFAULT 'article'
                       CHECK (type IN ('article','disease','procedure','news','calculator','faq')),
  title_ml           text, title_en text,
  body_ml            text, body_en text,
  excerpt_ml         text, excerpt_en text,
  featured_image_url text,
  author_id          uuid REFERENCES users(id),
  reviewer_id        uuid REFERENCES users(id),
  reviewed_at        timestamptz,
  review_due_at      timestamptz,
  status             varchar(20) NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','in_review','approved','published','archived')),
  published_at       timestamptz,
  meta_title_ml      text, meta_title_en text,
  meta_desc_ml       text, meta_desc_en text,
  requires_disclaimer boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);
CREATE INDEX IF NOT EXISTS idx_content_type_status ON content_items (type, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_published ON content_items (published_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS content_item_categories (
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  category_id     uuid NOT NULL REFERENCES content_categories(id),
  PRIMARY KEY (content_item_id, category_id)
);

CREATE TABLE IF NOT EXISTS content_item_specialties (
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  specialty_id    uuid NOT NULL REFERENCES specialties(id),
  PRIMARY KEY (content_item_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS content_versions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  version_number  integer NOT NULL,
  body_ml         text, body_en text,
  changed_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_content_versions_item ON content_versions (content_item_id, version_number);
