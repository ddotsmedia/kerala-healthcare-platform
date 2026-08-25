#!/usr/bin/env bash
# Kerala Health Portal — VPS deployment (194.164.151.202).
# Run from the repo root on the VPS. Requires .env.production present (never committed).
#
# snap-Docker note: this VPS runs snap-packaged Docker whose confinement DENIES
# `docker stop/kill/rm/restart` on RUNNING containers. A plain `compose up -d`
# recreate therefore fails ("permission denied") on any app container swap.
# The safe method (see snap_safe_recreate) is:
#   docker update --restart=no  ->  kill PID  ->  docker rm  ->  compose up -d --no-deps --build
# Removing the restart policy first stops the killed container from auto-restart
# racing; `docker rm` is allowed once the container is STOPPED; and because the
# old container is gone, `compose up` does a clean CREATE (not a blocked recreate).
# NEVER apply this to postgres/redis — killing a datastore corrupts state.
# NEVER use port-incrementing / parallel-container workarounds.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/infra/docker/docker-compose.prod.yml"
ENV_FILE="$REPO_ROOT/.env.production"
cd "$REPO_ROOT"

log() { echo -e "\n\033[1;36m==> $*\033[0m"; }

[ -f "$ENV_FILE" ] || { echo "ERROR: .env.production missing at repo root"; exit 1; }

# snap-safe recreate of a single APP service (never a datastore).
snap_safe_recreate() {
  local svc="$1"
  local cid
  cid="$(docker compose -f "$COMPOSE_FILE" ps -q "$svc" 2>/dev/null || true)"
  if [ -n "$cid" ]; then
    echo "  $svc: recreating $cid (snap-safe)"
    # 1. drop the restart policy so the kill does not race an auto-restart
    docker update --restart=no "$cid" >/dev/null 2>&1 || true
    # 2. stop by killing PID (snap denies docker stop/kill on running containers)
    local pid
    pid="$(docker inspect -f '{{.State.Pid}}' "$cid" 2>/dev/null || echo 0)"
    if [ "${pid:-0}" -gt 0 ] 2>/dev/null; then kill -9 "$pid" 2>/dev/null || true; fi
    # 3. wait until docker sees it stopped, then remove (rm is allowed once stopped)
    for _ in $(seq 1 15); do
      [ "$(docker inspect -f '{{.State.Running}}' "$cid" 2>/dev/null || echo false)" = "false" ] && break
      sleep 1
    done
    docker rm "$cid" >/dev/null 2>&1 || docker rm -f "$cid" >/dev/null 2>&1 || true
  fi
  # 4. clean create from a freshly built image (no swap -> snap does not block)
  docker compose -f "$COMPOSE_FILE" up -d --no-deps --build "$svc"
}

log "1/5 Pulling latest from git"
git fetch --all --prune
git pull --ff-only origin main

log "2/5 Starting datastores (postgres + redis)"
# Datastores use stock images and are left running across deploys. Never killed here.
docker compose -f "$COMPOSE_FILE" up -d khp-postgres khp-redis
for _ in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T khp-postgres pg_isready -U khp -d khp >/dev/null 2>&1; then
    echo "  postgres ready"; break
  fi
  sleep 2
done

log "3/5 Running database migrations"
# From the host, the compose postgres is reachable at 127.0.0.1:5440 (authoritative path).
set -a; # shellcheck disable=SC1090
source "$ENV_FILE"; set +a
DATABASE_URL="postgres://khp:${POSTGRES_PASSWORD}@127.0.0.1:5440/khp" pnpm db:migrate

log "4/5 Recreating app containers (snap-safe, no port juggling)"
# Optional first arg limits the rebuild to one app: deploy.sh [web|portal|admin].
ONLY="${1:-}"
if [ -n "$ONLY" ]; then
  SERVICES="khp-$ONLY"
  echo "  (limited to $SERVICES)"
else
  SERVICES="khp-web khp-portal khp-admin"
fi
for svc in $SERVICES; do
  snap_safe_recreate "$svc"
done

log "5/5 Health checks"
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

# nginx serves the vhost from sites-available via a symlink in sites-enabled;
# app upstreams (:3001/:3002/:8081) are stable, so no nginx change is needed here.
docker compose -f "$COMPOSE_FILE" ps
[ "$FAIL" = "0" ] && log "Deployment OK" || { log "Deployment completed with health failures"; exit 1; }
