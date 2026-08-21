-- P-H8: partner API keys for the public REST API. Additive only.

CREATE TABLE IF NOT EXISTS api_keys (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 text NOT NULL,
  key_hash             text UNIQUE NOT NULL,        -- SHA-256 hex of the issued key
  key_prefix           text,                        -- first chars, shown in the admin list
  partner_name         text NOT NULL,
  partner_type         varchar(50) NOT NULL DEFAULT 'developer'
                         CHECK (partner_type IN ('hospital','insurance','government','developer')),
  rate_limit_per_hour  integer NOT NULL DEFAULT 1000,
  allowed_endpoints    text[] NOT NULL DEFAULT '{}',
  is_active            boolean NOT NULL DEFAULT true,
  request_count        bigint NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz,
  last_used_at         timestamptz,
  deleted_at           timestamptz
);

CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys (key_hash) WHERE is_active = true AND deleted_at IS NULL;
