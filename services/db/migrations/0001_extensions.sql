-- 0001_extensions.sql
-- Phase 1 — Healthcare Directory. Additive only. Never drop.
-- Enable required PostgreSQL extensions.

-- UUID generation (uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Column-level encryption helpers (pgp_sym_encrypt etc.) for sensitive fields
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Accent/diacritic folding — supports Manglish (Roman transliteration) search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Trigram matching for fuzzy name search (Malayalam + Manglish)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
