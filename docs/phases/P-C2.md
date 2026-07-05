# P-C2 — WhatsApp Appointment Reminders

**Track:** Track C — Patient Experience
**Priority:** 🔴 Critical
**Project:** malayalidoctor.com (kerala-healthcare-platform)
**VPS:** 194.164.151.202

---

## How to execute

1. Open Claude Code in VS Code
2. First message: `Read CLAUDE.md and confirm rules`
3. Second message: paste everything from the line below

---

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
• Build + commit after each task. Conventional commits.
• Mobile-first. TypeScript forbidden. No new npm packages
  unless zero alternatives exist.
• Default AI model: claude-haiku everywhere.
• No verbose comments, no re-reads, batch writes per file.
• File >400 lines: split into sub-components.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Kerala Healthcare Platform — malayalidoctor.com
FEATURE: P-C2 — WhatsApp Appointment Reminders
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Automated appointment reminders via WhatsApp.
wa.me pre-filled message links — no WhatsApp
Business API needed. Free, instant, reliable.

NO NEW SCHEMA.
Add to appointments table:
Migration 0071:
  ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS whatsapp_reminder_24h_sent
      BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS whatsapp_reminder_2h_sent
      BOOLEAN DEFAULT false;

REMINDER SERVICE
services/notifications/whatsapp.js:
  generateWhatsAppReminderLink(appointment):
    Doctor WhatsApp number from doctor.whatsapp_number
    Pre-filled message:
    "നമസ്കാരം Dr. [Name], നാളെ [time]-ന്
    [mode] appointment ഉണ്ട്.
    Booking ref: [ref]
    Patient: [patient name]
    MalayaliDoctor.com"
    Returns wa.me link

  sendWhatsAppReminder():
    — NOT automatic send (users must tap the link)
    — Generates reminder links, stores in DB
    — Sends email with WhatsApp deeplink:
      "Tap to send reminder to your doctor"
    — Or: shows reminder on patient dashboard

PATIENT DASHBOARD ENHANCEMENT
  Upcoming appointment card:
  "Remind Doctor via WhatsApp →" button
  Opens wa.me link in new tab with prefilled message

  Also: "Share appointment with family"
  WhatsApp link to share appointment details
  with a family member

NOTIFICATION JOB UPDATE
  services/notifications/reminder.js:
  At 24h before: generate WhatsApp link,
    include in reminder email to patient
  At 2h before: show in-app notification with
    WhatsApp reminder link

Smoke tests:
  WhatsApp button on appointment card generates
    correct wa.me link
  Pre-filled message includes correct details
  24h reminder email includes WhatsApp link


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOY TO VPS AFTER COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SSH into 194.164.151.202
cd /opt/kerala-healthcare-platform
git pull origin main
docker compose -f infra/docker/docker-compose.prod.yml \
  --env-file .env.production up -d --build
Verify: curl -I https://malayalidoctor.com/ml/[new-route]
Report: commit hash, migration count, live URL check.
```
