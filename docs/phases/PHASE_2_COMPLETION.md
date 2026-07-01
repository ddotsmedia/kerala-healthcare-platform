# Phase 2 — Appointments & Patient Portal · Completion Report

*Reconciles the build against `PHASE_2_SPEC.md`. Verified against local Postgres 15 (`khp-demo-pg`, port 5439), migrations 0001–0022 applied, demo data seeded.*
*Status: build + smoke complete. Tagged `v0.3.0-appointments`. Auth/infra items accepted as later scope.*

---

## Spec deliverables (DoD)

| Deliverable | Status | Evidence |
|---|---|---|
| Slot management (weekly templates + date blocks) | ✅ Done | `availability_templates`/`availability_overrides`; portal `/schedule/availability` CRUD |
| Booking flow (slot locked, confirmation ≤30s) | ✅ Done | `bookSlot`; confirmation logged ~12ms after booking |
| No double-booking (concurrent → one wins) | ✅ Done | partial UNIQUE index + `ON CONFLICT`; concurrent test → 1 success, other `slot_taken` |
| Patient dashboard (upcoming/past + status) | ✅ Done | `/[locale]/patient` |
| Doctor dashboard (today's schedule, mark complete) | ✅ Done | `/schedule` |
| Reminders (24h + 2h SMS/email) | 🟡 Done (jobs) | `sendReminders` + `pnpm notify:reminders`; honors quiet hours. Scheduling (BullMQ/cron) is infra |
| Cancel + reschedule | ✅ Done | patient cancel (>2h rule), doctor reschedule/cancel |

---

## Tasks 2.1–2.7

| Task | Status | Notes |
|---|---|---|
| 2.1 Appointment schema | ✅ Done | migrations 0017–0021 (users, templates, overrides, appointments, idempotency); concurrency-safe unique index |
| 2.2 Slot + atomic booking service | ✅ Done | `services/appointments` — slots, `FOR UPDATE` + `ON CONFLICT` booking, video room id |
| 2.3 Booking API routes | ✅ Done | web: slots/available, book (X-Idempotency-Key), my, cancel. portal: schedule, reschedule, complete, cancel |
| 2.4 Notification service | 🟡 Done | `services/notifications` SMS/email + ml/en templates + `notification_log` (0022) + jobs. SMS via fetch; real email SMTP + BullMQ scheduling deferred to infra (no new npm package) |
| 2.5 Patient portal pages | ✅ Done | dashboard, appointments + filter, detail + cancel, booking (slot picker) |
| 2.6 Doctor schedule pages | ✅ Done | schedule, availability CRUD, appointment history |
| 2.7 Consultation room URL | ✅ Done | video bookings get a UUID room; `/consult/[roomId]` page; room url in confirmation |

---

## Smoke checklist — ALL 8 PASS (verified against DB)

| # | Check | Result |
|---|---|---|
| 1 | slots/available returns slot array | ✅ PASS (10 slots) |
| 2 | concurrent same-slot booking → one wins | ✅ PASS |
| 3 | SMS confirmation logged within 30s | ✅ PASS (~12ms) |
| 4 | patient dashboard shows confirmed appt | ✅ PASS |
| 5 | doctor schedule shows today's bookings | ✅ PASS |
| 6 | cancel → status changes + other party notified | ✅ PASS |
| 7 | 24h reminder job runnable, writes notification_log | ✅ PASS (job ran; correctly skipped during 22:00–07:00 quiet hours) |
| 8 | video appointment → room url in confirmation | ✅ PASS |

---

## Quality gates
- `pnpm build` — web, admin, portal all exit 0.
- `pnpm lint` — web, admin, portal: no ESLint warnings or errors.

---

## Deviations & deferrals (logged in BLOCKERS.md)
- **No new npm packages.** SMS uses global `fetch`; without a gateway, sends log as `simulated`. Real email (SES SMTP) needs an SMTP client → deferred to infra; `simulated` until then. BullMQ queue + cron scheduling are the deployment wrapper (infra); reminder/notify jobs are directly-callable + a `pnpm notify:reminders` CLI.
- **Auth:** patient/doctor identity use demo stand-ins (`PATIENT_DEMO_USER_ID` / `PORTAL_DEMO_DOCTOR_ID`); OTP/JWT login + RBAC remain Phase 2-auth work carried over (accepted Phase 2/later scope). `/login` redirect target not built — pages show a login-required notice.
- **`provider_id` FK → `doctors(id)`** (the `healthcare_providers` view cannot be an FK target; ids are equal).
- Quiet hours (22:00–07:00) applied to reminders; immediate confirmation/cancel/reschedule always attempted.
- Apps use `app/` (not spec's `src/app/`), consistent with the tree.

---

## Not done (later phases)
- Real SMS/email delivery (gateway + SMTP creds) and BullMQ/cron scheduling — infra.
- OTP/JWT auth + session-based patient/doctor identity.
- Video calling embed (Jitsi/Daily) — Phase 5.
