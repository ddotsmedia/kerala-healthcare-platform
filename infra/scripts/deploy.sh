#!/usr/bin/env bash
# Kerala Health Portal — VPS deployment (194.164.151.202).
# Run from the repo root on the VPS. Requires .env.production present (never committed).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/infra/docker/docker-compose.prod.yml"
ENV_FILE="$REPO_ROOT/.env.production"
cd "$REPO_ROOT"

log() { echo -e "\n\033[1;36m==> $*\033[0m"; }

[ -f "$ENV_FILE" ] || { echo "ERROR: .env.production missing at repo root"; exit 1; }

log "1/6 Pulling latest from git"
git fetch --all --prune
git pull --ff-only origin main

log "2/6 Building Docker images"
docker compose -f "$COMPOSE_FILE" build

log "3/6 Starting datastores (postgres + redis)"
docker compose -f "$COMPOSE_FILE" up -d khp-postgres khp-redis
# Wait for postgres health before migrating.
for i in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T khp-postgres pg_isready -U khp -d khp >/dev/null 2>&1; then
    echo "postgres ready"; break
  fi
  sleep 2
done

log "4/6 Running database migrations"
# Migrations run against the compose postgres via DATABASE_URL from .env.production,
# but from the host that host is 127.0.0.1:5440.
set -a; # shellcheck disable=SC1090
source "$ENV_FILE"; set +a
DATABASE_URL="postgres://khp:${POSTGRES_PASSWORD}@127.0.0.1:5440/khp" pnpm db:migrate

log "5/6 Restarting app containers (rolling)"
docker compose -f "$COMPOSE_FILE" up -d --no-deps khp-web khp-portal khp-admin

log "6/6 Health checks"
sleep 5
declare -A APPS=( [web]=3001 [portal]=3002 [admin]=8081 )
FAIL=0
for name in "${!APPS[@]}"; do
  port="${APPS[$name]}"
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${port}/" || echo 000)
  if [ "$code" = "200" ] || [ "$code" = "307" ] || [ "$code" = "308" ]; then
    echo "  khp-$name (:$port) -> $code OK"
  else
    echo "  khp-$name (:$port) -> $code FAIL"; FAIL=1
  fi
done

docker compose -f "$COMPOSE_FILE" ps
[ "$FAIL" = "0" ] && log "Deployment OK" || { log "Deployment completed with health failures"; exit 1; }
