-- 0060_appointments_whatsapp.sql
-- P-C2: track WhatsApp reminder sends per appointment. Additive only.
-- (Spec labelled this 0071; numbered sequentially per runner.)

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS whatsapp_reminder_24h_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_reminder_2h_sent  boolean NOT NULL DEFAULT false;
