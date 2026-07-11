-- 0067_appointment_video.sql
-- P-C8: Jitsi video consultation tracking. Additive only.
-- (Spec labelled this 0078; numbered sequentially per runner.)

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS jitsi_room_name         text,
  ADD COLUMN IF NOT EXISTS consultation_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS consultation_ended_at   timestamptz;
