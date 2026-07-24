-- 0081_referrals.sql
-- Patient referral system (refer-a-friend growth loop). Additive only.
-- One canonical row per referrer holds the shareable code (referred_user_id NULL,
-- status 'shared'); each friend who registers gets a child row derived from it.

CREATE TABLE IF NOT EXISTS referrals (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id      uuid NOT NULL REFERENCES users(id),
  referral_code    varchar(20) UNIQUE NOT NULL,
  referred_email   text,                              -- stored hashed, never plaintext
  referred_user_id uuid REFERENCES users(id),
  status           varchar(20) DEFAULT 'shared',      -- shared|registered|appointed|rewarded
  reward_type      varchar(50),                       -- priority_listing|free_consultation_info
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz,
  deleted_at       timestamptz
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals (referral_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON referrals (referred_user_id) WHERE deleted_at IS NULL;
