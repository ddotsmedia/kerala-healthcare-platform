#!/usr/bin/env bash
# backup-db.sh — nightly khp Postgres dump. Keeps last 7 days.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/backups}"
CONTAINER="${PG_CONTAINER:-khp-khp-postgres-1}"
STAMP="$(date +%Y%m%d)"
OUT="${BACKUP_DIR}/khp-${STAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "[backup] dumping khp -> $OUT"
docker exec "$CONTAINER" pg_dump -U khp khp > "$OUT"

SIZE="$(du -h "$OUT" | cut -f1)"
echo "[backup] wrote $OUT ($SIZE)"

# Retention: delete dumps older than 7 days.
find "$BACKUP_DIR" -name 'khp-*.sql' -type f -mtime +7 -print -delete | sed 's/^/[backup] pruned /' || true

echo "[backup] done $(date -u +%FT%TZ)"
