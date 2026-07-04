#!/usr/bin/env bash
# health-check.sh — verify all 5 khp containers Up/healthy + /api/health 200.
# Exit 0 = healthy, 1 = problem. Suitable for cron.
set -uo pipefail

CONTAINERS=(khp-khp-web-1 khp-khp-portal-1 khp-khp-admin-1 khp-khp-postgres-1 khp-khp-redis-1)
HEALTH_URL="${HEALTH_URL:-https://malayalidoctor.com/api/health}"
FAIL=0

for c in "${CONTAINERS[@]}"; do
  status="$(docker inspect -f '{{.State.Status}}' "$c" 2>/dev/null || echo missing)"
  health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$c" 2>/dev/null || echo none)"
  if [ "$status" = "running" ] && { [ "$health" = "healthy" ] || [ "$health" = "none" ]; }; then
    echo "OK   $c ($status/$health)"
  else
    echo "FAIL $c ($status/$health)"; FAIL=1
  fi
done

code="$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" || echo 000)"
if [ "$code" = "200" ]; then echo "OK   $HEALTH_URL -> 200"; else echo "FAIL $HEALTH_URL -> $code"; FAIL=1; fi

[ "$FAIL" = "0" ] && echo "health-check: ALL OK" || echo "health-check: PROBLEMS DETECTED"
exit "$FAIL"
