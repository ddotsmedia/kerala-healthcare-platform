# P-H3 — Load Testing

**Track:** Track H — Infrastructure
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
FEATURE: P-H3 — Load Testing
REPO PATH: /opt/kerala-healthcare-platform (VPS)
LOCAL: C:\websites\kerala-healthcare-platform


OBJECTIVE
k6 load test: 1000 concurrent users,
p95 < 500ms on search and booking endpoints.

NO SCHEMA CHANGES.

LOAD TEST SCRIPTS
infra/load-testing/search-test.js (k6 script):
  VUs: 100 ramping to 1000
  Scenarios:
    1. Homepage load: GET /ml
    2. Doctor search: GET /ml/doctors?q=cardiology
    3. Hospital search: GET /ml/hospitals?district=ernakulam
    4. Doctor profile: GET /ml/doctors/[slug]
    5. Slot availability: POST /api/appointments/slots/available
  Thresholds:
    http_req_duration p(95) < 500ms
    http_req_failed < 1%

infra/load-testing/booking-test.js (k6 script):
  Concurrent booking attempts on same slot:
  50 VUs all trying to book the same time slot
  Assert: only 1 succeeds, others get 409

infra/load-testing/run-tests.sh:
  Install k6 if not present
  Run all test scripts
  Generate HTML report

docs/performance/LOAD_TEST_RESULTS.md:
  Document baseline results, bottlenecks found,
  optimisations made

Run tests against VPS staging environment.
Report p50, p95, p99 latencies for each endpoint.
Fix any bottlenecks found (add DB indexes, tune
Redis cache TTLs, etc.)

Smoke tests:
  k6 runs without errors
  All thresholds pass
  Report generated
  Booking concurrency test confirms no double-booking


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
