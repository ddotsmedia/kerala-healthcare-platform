# Phase 2 — Appointments & Patient Portal

**Duration:** 3 weeks
**Status:** ⬜ Not started
**Prerequisite:** Phase 1 complete and all smoke tests passing

---

## What This Phase Builds

- Appointment slot management — doctor creates and manages availability
- Patient booking flow — search → select slot → confirm → receive notification
- Online consultation (video link generation)
- Patient dashboard — upcoming, past, cancelled appointments
- Doctor dashboard — daily schedule, upcoming appointments
- SMS + email notifications: booking confirmation, reminders (24h + 2h)
- Cancellation and rescheduling flows

---

## Phase 2 Deliverables

| Deliverable | Definition of Done |
|---|---|
| Slot management | Doctor can create weekly recurring slots and block specific dates |
| Booking flow complete | Patient books appointment: slot locked, confirmation SMS sent within 30s |
| No double-booking | Concurrent booking attempts: only one succeeds, other gets clear error |
| Patient dashboard | Patient sees upcoming and past appointments with status |
| Doctor dashboard | Doctor sees today's schedule and can mark consultations complete |
| Reminders sent | 24h and 2h reminder SMS/email sent for every confirmed appointment |
| Cancel + reschedule | Patient can cancel (up to 2h before), doctor can reschedule |

---

## Claude Code Prompt — Phase 2

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNIVERSAL PROMPT LAW — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Fully autonomous. Never pause, never ask, never confirm.
• On ambiguity: pick best default, log 1-line in BLOCKERS.md.
• On errors: fix and continue. Never stop.
• NEVER touch: ayurconnect, ddots-erp, wa-crm,
  healthportal, ddotshop, ddotsmediajobs.
• NEVER run pnpm db:seed. Only: pnpm db:seed:demo.
• Additive migrations only. Never drop tables/columns.
• Always ON CONFLICT DO NOTHING in inserts.
• Build + commit after each phase. Conventional commits.
• Mobile-first. TypeScript forbidden. No new npm packages
  unless zero alternatives exist.
• Default AI model: claude-haiku everywhere.
• No verbose comments, no re-reads, batch writes per file.
• File >400 lines: split into sub-components.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Kerala Healthcare Platform
PHASE: 2 — Appointments & Patient Portal
PREREQUISITE: Phase 1 complete and all smoke tests passing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build end-to-end appointment booking. Correctness and concurrency
safety are the top priorities. No double-booking under any condition.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 TASKS — execute in order, commit after each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 2.1 — Appointment schema
Migrations:
• availability_templates
  (id, provider_id, day_of_week 0-6, start_time TIME, end_time TIME,
   slot_duration_minutes INT DEFAULT 30,
   consultation_mode VARCHAR(20), is_active BOOLEAN DEFAULT true)
• availability_overrides
  (id, provider_id, override_date DATE, is_blocked BOOLEAN,
   start_time TIME, end_time TIME, reason TEXT)
• appointments
  (id uuid PK, booking_ref VARCHAR(12) UNIQUE,
   provider_id uuid FK healthcare_providers,
   patient_id uuid FK users,
   hospital_id uuid FK hospitals NULLABLE,
   slot_date DATE, slot_start TIME, slot_end TIME,
   consultation_mode VARCHAR(20),
   status VARCHAR(20) DEFAULT 'confirmed',
   — confirmed|cancelled|completed|no_show
   notes_for_doctor TEXT, cancellation_reason TEXT,
   cancelled_at TIMESTAMPTZ, cancelled_by uuid,
   reminder_24h_sent BOOLEAN DEFAULT false,
   reminder_2h_sent BOOLEAN DEFAULT false,
   created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ)
• UNIQUE index on (provider_id, slot_date, slot_start) WHERE status='confirmed'
  — database-level double-booking prevention
• Commit: feat(appointments): appointment schema with concurrency-safe unique index

TASK 2.2 — Slot availability service
services/appointments/slots.js:
  getAvailableSlots(providerId, date) — compute from template minus booked
  getSlotsForRange(providerId, startDate, endDate)
  isSlotAvailable(providerId, date, startTime) — atomic check
• bookSlot(providerId, patientId, date, startTime, mode):
  BEGIN TRANSACTION
  SELECT ... FOR UPDATE on the slot
  Check no confirmed appointment exists
  INSERT appointment ON CONFLICT DO NOTHING
  COMMIT — return booking or conflict error
• Commit: feat(appointments): slot availability and atomic booking service

TASK 2.3 — Booking API routes
POST /api/appointments/slots/available  { providerId, date }
POST /api/appointments/book             { providerId, slotDate, slotStart, mode }
  — idempotency key via X-Idempotency-Key header
PATCH /api/appointments/:id/cancel      { reason }
  — patient can cancel up to 2h before; doctor can cancel anytime
PATCH /api/appointments/:id/reschedule  { newDate, newStart }
  — doctor only
PATCH /api/appointments/:id/complete
  — doctor only, sets status=completed
GET  /api/appointments/my               patient's own appointments
GET  /api/portal/appointments/schedule  doctor's schedule (date filter)
• Commit: feat(appointments): booking, cancellation, and schedule API routes

TASK 2.4 — Notification service (SMS + email)
services/notifications/sms.js — wrapper around SMS gateway env var
services/notifications/email.js — wrapper around SES/SMTP env var
services/notifications/templates/:
  appointment-confirmed.js  (ml + en)
  appointment-reminder.js   (ml + en)
  appointment-cancelled.js  (ml + en)
  appointment-rescheduled.js (ml + en)
Notification triggers (BullMQ jobs, not in request cycle):
  On booking confirmed → immediate SMS + email confirmation
  Daily cron 8AM → send 24h reminders for next day's appointments
  Cron every 30min → send 2h reminders
  On cancellation → notify the other party
• All notifications respect 10PM–7AM quiet hours
• notification_log table: channel, status, sent_at, error_message
• Commit: feat(notifications): appointment notifications via SMS and email

TASK 2.5 — Patient portal pages
apps/web/src/app/[locale]/patient/page.js — dashboard
  Sections: upcoming appointments, past appointments, quick book CTA
apps/web/src/app/[locale]/patient/appointments/page.js
  — full appointment history with filters (status, date range)
apps/web/src/app/[locale]/patient/appointments/[id]/page.js
  — appointment detail: provider info, slot, mode, cancel/reschedule CTA
apps/web/src/app/[locale]/book/[doctorSlug]/page.js
  — booking page: calendar slot picker → confirm → success
• Patient must be logged in (redirect to /login if not)
• Commit: feat(patient-portal): patient dashboard and booking pages

TASK 2.6 — Doctor portal: schedule
apps/portal/src/app/schedule/page.js
  — today's appointments list, mark complete, view patient notes
apps/portal/src/app/schedule/availability/page.js
  — manage weekly templates and date overrides (block days, add extra slots)
apps/portal/src/app/schedule/appointments/page.js
  — full appointment history, filter by status and date
• Commit: feat(portal): doctor schedule and availability management

TASK 2.7 — Online consultation link
• For video mode appointments: generate a unique consultation room URL
  using a simple UUID-based room ID (e.g. /consult/[roomId])
• Room URL included in confirmation SMS/email
• /consult/[roomId] page: placeholder for video embed (Jitsi or Daily.co
  integration deferred to Phase 5 — show room code and manual join link)
• Commit: feat(appointments): online consultation room URL generation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMOKE TESTS — verify before closing session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ GET /api/appointments/slots/available — returns slot array for a doctor
□ Book same slot twice concurrently — only one succeeds
□ Patient receives SMS confirmation within 30 seconds of booking
□ Patient dashboard shows confirmed appointment
□ Doctor schedule shows today's bookings
□ Cancel appointment — status changes, other party notified
□ 24h reminder job: run manually, check notification_log
□ Appointment with video mode — room URL in confirmation message
```
