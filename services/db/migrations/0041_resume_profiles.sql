-- 0041_resume_profiles.sql
-- Resume Builder (P-B3). Multi-template CVs with AI-enhanced summary.
-- Additive only. (Spec labelled this 0057; numbered sequentially per runner.)
-- Section arrays stored as jsonb holding a JSON array (not jsonb[]) — simpler,
-- driver-friendly binding; see BLOCKERS.md.

CREATE TABLE IF NOT EXISTS resume_profiles (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL REFERENCES users(id),
  title               text NOT NULL,
  template_id         varchar(50) NOT NULL DEFAULT 'kerala_classic'
                        CHECK (template_id IN ('kerala_classic','modern_minimal','gulf_ready')),
  personal            jsonb NOT NULL DEFAULT '{}'::jsonb,
  experience          jsonb NOT NULL DEFAULT '[]'::jsonb,
  education           jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills              text[] NOT NULL DEFAULT '{}',
  certifications      jsonb NOT NULL DEFAULT '[]'::jsonb,
  publications        jsonb NOT NULL DEFAULT '[]'::jsonb,
  languages           jsonb NOT NULL DEFAULT '[]'::jsonb,
  refs                jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_enhanced_summary text,
  is_public           boolean NOT NULL DEFAULT false,
  last_exported_at    timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);
CREATE INDEX IF NOT EXISTS idx_resume_user ON resume_profiles (user_id) WHERE deleted_at IS NULL;
