# P-F4 — Doctor Analytics Dashboard

**Track:** Track F — Provider Tools
**Priority:** 🟡 High
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
FEATURE: P-F4 — Doctor Analytics Dashboard
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
Doctor dashboard: profile views, appointment trends,
patient demographics, review summary.

NO NEW SCHEMA.
Add view tracking:
Migration 0105:
  CREATE TABLE provider_profile_views (
    id uuid PK DEFAULT uuid_generate_v4(),
    provider_id uuid FK healthcare_providers NOT NULL,
    viewer_ip INET,
    viewer_user_id uuid FK users NULLABLE,
    locale VARCHAR(5),
    viewed_at TIMESTAMPTZ DEFAULT now()
  );
  CREATE INDEX idx_provider_views
    ON provider_profile_views(provider_id, viewed_at);

ANALYTICS SERVICE
services/portal/doctor-analytics.js:
  getProfileStats(providerId, days=30):
    profile_views, unique_visitors,
    appointment_count, appointment_trend,
    review_avg, review_count,
    search_appearances (how often shown in search)

PAGES
apps/portal/app/analytics/page.js
  — "Your Performance"
  — Stats cards: views this month, appointments
    booked, avg rating, search appearances
  — Profile views chart (last 30 days, SVG)
  — Appointments by mode (in-person/video/phone)
  — Review summary: avg rating, recent reviews
  — Tips: "Add a photo to increase views by 3x"
    (static tips based on profile completeness)

Smoke tests:
  View doctor profile → view logged
  Analytics page shows correct view count
  Chart renders with data


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
