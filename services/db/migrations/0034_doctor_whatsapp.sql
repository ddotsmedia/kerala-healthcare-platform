-- 0034_doctor_whatsapp.sql
-- Public WhatsApp contact number for doctors (plain text; NOT the encrypted mobile).
-- Additive only.

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS whatsapp_number varchar(15);
