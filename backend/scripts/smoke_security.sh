#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3002}"
SMOKE_MODE="${SMOKE_MODE:-local}" # local | docker
API_BASE_URL="${API_BASE_URL:-http://localhost:$PORT}"
DOCKER_CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-vixrad-backend-dev}"

SERVER_LOG="$BACKEND_DIR/smoke_security.server.log"
REGISTER_JSON="$BACKEND_DIR/smoke_security.register.json"
PID_FILE="$BACKEND_DIR/smoke_security.pid"

rm -f "$SERVER_LOG" "$REGISTER_JSON" "$PID_FILE"

cd "$BACKEND_DIR"

assert_docker_ready() {
  command -v docker >/dev/null 2>&1 || { echo "FAIL: docker not found" >&2; exit 10; }
  if ! docker ps --format '{{.Names}}' | grep -qx "$DOCKER_CONTAINER_NAME"; then
    echo "FAIL: docker container not running: $DOCKER_CONTAINER_NAME" >&2
    echo "Hint: start dev stack with: docker compose -f docker-compose.dev.yml up -d" >&2
    exit 10
  fi
}

dump_logs_on_failure() {
  if [[ "$SMOKE_MODE" == "local" ]]; then
    tail -n 120 "$SERVER_LOG" >&2 || true
  else
    echo "Hint: last 120 docker log lines ($DOCKER_CONTAINER_NAME):" >&2
    docker logs --tail 120 "$DOCKER_CONTAINER_NAME" >&2 || true
  fi
}

DATABASE_URL='postgresql://postgres:postgres@localhost:5432/vixrad?schema=public'
JWT_SECRET='dev_secret'
JWT_REFRESH_SECRET='dev_refresh_secret'

if [[ "$SMOKE_MODE" == "local" ]]; then
  # Ensure DB schema is present (CI starts with a fresh Postgres)
  DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy >/dev/null 2>&1

  # Start server
  DATABASE_URL="$DATABASE_URL" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  PORT="$PORT" \
  node dist/main.js >"$SERVER_LOG" 2>&1 &
  SERVER_PID=$!
  echo "$SERVER_PID" > "$PID_FILE"

  cleanup() {
    kill "$SERVER_PID" 2>/dev/null || true
  }
  trap cleanup EXIT

  # Wait until boot
  for _ in $(seq 1 160); do
    if grep -q 'Nest application successfully started' "$SERVER_LOG"; then
      break
    fi
    sleep 0.25
  done

  grep -q 'Nest application successfully started' "$SERVER_LOG"

  echo "OK: server started (pid=$SERVER_PID)"
elif [[ "$SMOKE_MODE" == "docker" ]]; then
  assert_docker_ready
else
  echo "FAIL: invalid SMOKE_MODE=$SMOKE_MODE (expected local|docker)" >&2
  exit 10
fi

# Register user
EMAIL="smoke_security_$(date +%s%N)@example.com"
REG_CODE=$(curl -sS -o "$REGISTER_JSON" -w '%{http_code}' \
  -X POST "$API_BASE_URL/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Passw0rd!\"}")

echo "register_http_code=$REG_CODE"
if [[ "$REG_CODE" != "201" && "$REG_CODE" != "200" ]]; then
  echo "FAIL: expected /auth/register = 200|201" >&2
  dump_logs_on_failure
  exit 21
fi

TOKEN=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('$REGISTER_JSON','utf8'));process.stdout.write(j.accessToken||'')")
if [[ ${#TOKEN} -lt 10 ]]; then
  echo "FAIL: register JSON missing accessToken" >&2
  exit 22
fi

# 401: expired token
EXPIRED_TOKEN=$(node -e "const jwt=require('jsonwebtoken');const now=Math.floor(Date.now()/1000);process.stdout.write(jwt.sign({sub:'expired-user',exp:now-10}, '$JWT_SECRET'));" )
EXPIRED_CODE=$(curl -sS -o /dev/null -w '%{http_code}' \
  -X POST "$API_BASE_URL/reports/generate" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $EXPIRED_TOKEN" \
  -d '{"examType":"CT","templateId":"ct-cranio-normal-v1","contrast":"without","indication":"Teste","findings":null}')

echo "expired_token_http_code=$EXPIRED_CODE"
if [[ "$EXPIRED_CODE" != "401" ]]; then
  echo "FAIL: expected expired token -> 401" >&2
  dump_logs_on_failure
  exit 23
fi

# 429: rate limit after 10 req/min
for i in $(seq 1 10); do
  CODE=$(curl -sS -o /dev/null -w '%{http_code}' \
    -X POST "$API_BASE_URL/reports/generate" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"examType":"CT","templateId":"ct-cranio-normal-v1","contrast":"without","indication":"Teste","findings":null}')
  if [[ "$CODE" != "200" ]]; then
    echo "FAIL: expected request $i -> 200 (got $CODE)" >&2
    dump_logs_on_failure
    exit 24
  fi
  sleep 0.05
done

CODE_11=$(curl -sS -o /dev/null -w '%{http_code}' \
  -X POST "$API_BASE_URL/reports/generate" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"examType":"CT","templateId":"ct-cranio-normal-v1","contrast":"without","indication":"Teste","findings":null}')

echo "rate_limit_http_code=$CODE_11"
if [[ "$CODE_11" != "429" ]]; then
  echo "FAIL: expected 11th request -> 429 (got $CODE_11)" >&2
  dump_logs_on_failure
  exit 25
fi

echo "SMOKE_OK_SECURITY"

# Usage:
#   bash scripts/smoke_security.sh
