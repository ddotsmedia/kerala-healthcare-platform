-- P-G1: conversion / funnel event tracking (no personal data). Additive only.

CREATE TABLE IF NOT EXISTS conversion_events (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type   varchar(50) NOT NULL,
  -- search|profile_view|booking_started|booking_completed|registration|login|job_applied|article_read
  entity_type  varchar(50),
  entity_id    uuid,
  session_id   varchar(64),
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_type_date ON conversion_events (event_type, created_at DESC);
