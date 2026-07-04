# Uptime Monitoring — MalayaliDoctor

Free external uptime monitoring via [UptimeRobot](https://uptimerobot.com) (free tier: 50 monitors, 5-min interval).

## Monitors to create

| Monitor | URL | Type | Expected |
|---|---|---|---|
| Web health | `https://malayalidoctor.com/api/health` | HTTP(s), keyword `"status":"ok"` | 200 + keyword |
| Portal | `https://portal.malayalidoctor.com` | HTTP(s) | 200/307 |
| Admin | `https://admin.malayalidoctor.com` | HTTP(s) | 200/307 |

## Setup steps

1. Create a free UptimeRobot account.
2. **Add New Monitor** → type **HTTP(s)** for each URL above.
3. For the health monitor, set **Monitor Type: Keyword**, keyword `"status":"ok"` — this fails the check if DB or Redis is down (the endpoint returns 503 + `"status":"degraded"`).
4. **Monitoring Interval:** 5 minutes.
5. **Alert Contacts:** add email `admin@malayalidoctor.com` and attach it to every monitor.
6. Optionally enable a public status page.

## What the health endpoint reports

`GET /api/health` →
```json
{ "status": "ok", "timestamp": "...", "version": "1.0.0",
  "checks": { "database": "ok", "redis": "ok" } }
```
- `200` when both DB and Redis are reachable.
- `503` + `"status":"degraded"` when either check fails.

## On-VPS check (cron)

`infra/scripts/health-check.sh` verifies all 5 `khp-*` containers are Up/healthy and that `/api/health` returns 200. Schedule every 5 min:
```
*/5 * * * * /opt/kerala-healthcare-platform/infra/scripts/health-check.sh >> /var/log/khp-health.log 2>&1
```
