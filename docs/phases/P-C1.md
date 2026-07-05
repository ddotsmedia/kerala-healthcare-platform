# P-C1 — Health Tracker

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
FEATURE: P-C1 — Health Tracker
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Daily health metrics tracker: weight, BP, blood sugar,
mood, sleep, steps. With trend charts.
Gives patients a reason to open the app daily.

SCHEMA (additive migrations)
Migration 0070 — health_metrics table:
  id uuid PK,
  user_id uuid FK users NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  -- weight|systolic_bp|diastolic_bp|
  --  blood_sugar_fasting|blood_sugar_pp|
  --  heart_rate|spo2|steps|sleep_hours|
  --  mood|temperature|hba1c
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  -- kg|mmHg|mg_dL|%|bpm|steps|hours|score
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()

CREATE INDEX idx_health_metrics_user_type
  ON health_metrics(user_id, metric_type,
    recorded_at DESC);

PAGES
apps/web/app/[locale]/patient/health-tracker/page.js
  — Dashboard with today's readings
  — Quick add widget per metric type
  — Trend chart for each metric (last 30 days)
    CSS-only sparkline or simple SVG path chart
    (no charting package)

  Metric cards (add reading inline):
  ⚖️ Weight: input kg + date
  🩸 Blood Pressure: systolic/diastolic
  🍬 Blood Sugar: fasting/post-prandial
  ❤️ Heart Rate: bpm
  😴 Sleep: hours
  🚶 Steps: count
  😊 Mood: 1-5 score with emoji picker
  🌡️ Temperature: Celsius

  Normal ranges shown per metric:
  "Normal: 70-120 mg/dL (fasting)"
  Out-of-range values highlighted in red/amber

  Charts: simple SVG line chart built inline
  (no external charting library)
  7-day and 30-day views

API ROUTES
POST /api/patient/health-metrics
  { metric_type, value, unit, notes, recorded_at }
GET  /api/patient/health-metrics?type=&days=30
  Returns: array of readings, latest value,
  trend (up/down/stable), min/max/avg

DISCLAIMER on all tracker pages:
  "This tracker is for personal monitoring only.
  Share your readings with your doctor — do not
  self-diagnose or adjust medications based on
  these readings."

Smoke tests:
  Add blood pressure reading → appears in list
  Chart renders with data points
  Out-of-range value highlighted
  Disclaimer visible


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
