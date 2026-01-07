#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3002}"
SMOKE_MODE="${SMOKE_MODE:-local}" # local | docker
API_BASE_URL="${API_BASE_URL:-http://localhost:$PORT}"
DOCKER_CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-vixrad-backend-dev}"

SERVER_LOG="$BACKEND_DIR/smoke_audit.server.log"
REGISTER_JSON="$BACKEND_DIR/smoke_audit.register.json"
REPORT_JSON="$BACKEND_DIR/smoke_audit.report.json"
PID_FILE="$BACKEND_DIR/smoke_audit.pid"

rm -f "$SERVER_LOG" "$REGISTER_JSON" "$REPORT_JSON" "$PID_FILE"

cd "$BACKEND_DIR"

now_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

get_docker_logs_since() {
  local since="$1"
  docker logs --since "$since" "$DOCKER_CONTAINER_NAME" 2>/dev/null || true
}

LOG_SINCE="$(now_utc)"

if [[ "$SMOKE_MODE" == "local" ]]; then
  # Ensure DB schema is present (CI starts with a fresh Postgres)
  DATABASE_URL='postgresql://postgres:postgres@localhost:5432/vixrad?schema=public' \
    npx prisma migrate deploy >/dev/null 2>&1

  # Start server with absolute log path
  DATABASE_URL='postgresql://postgres:postgres@localhost:5432/vixrad?schema=public' \
  JWT_SECRET='dev_secret' \
  JWT_REFRESH_SECRET='dev_refresh_secret' \
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

  # Confirm log persists
  ls -l "$SERVER_LOG" >/dev/null
elif [[ "$SMOKE_MODE" == "docker" ]]; then
  command -v docker >/dev/null 2>&1 || { echo "FAIL: docker not found" >&2; exit 10; }
  if ! docker ps --format '{{.Names}}' | grep -qx "$DOCKER_CONTAINER_NAME"; then
    echo "FAIL: docker container not running: $DOCKER_CONTAINER_NAME" >&2
    echo "Hint: start dev stack with: docker compose -f docker-compose.dev.yml up -d" >&2
    exit 10
  fi
else
  echo "FAIL: invalid SMOKE_MODE=$SMOKE_MODE (expected local|docker)" >&2
  exit 10
fi

ROOT_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$API_BASE_URL/")
echo "root_http_code=$ROOT_CODE"
if [[ "$ROOT_CODE" != "200" ]]; then
  echo "FAIL: expected GET / = 200" >&2
  exit 11
fi

# Register user
EMAIL="smoke_audit_$(date +%s%N)@example.com"
REG_CODE=$(curl -sS -o "$REGISTER_JSON" -w '%{http_code}' \
  -X POST "$API_BASE_URL/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Passw0rd!\"}")

echo "register_http_code=$REG_CODE"
if [[ "$REG_CODE" != "201" && "$REG_CODE" != "200" ]]; then
  echo "FAIL: expected /auth/register = 200|201" >&2
  exit 12
fi

# Confirm JSON created and contains accessToken
if [[ ! -s "$REGISTER_JSON" ]]; then
  echo "FAIL: missing register JSON" >&2
  exit 13
fi

TOKEN=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('$REGISTER_JSON','utf8'));process.stdout.write(j.accessToken||'')")
if [[ ${#TOKEN} -lt 10 ]]; then
  echo "FAIL: register JSON missing accessToken" >&2
  exit 14
fi

echo "OK: accessToken present"

# Call reports
REPORT_CODE=$(curl -sS -o "$REPORT_JSON" -w '%{http_code}' \
  -X POST "$API_BASE_URL/reports/generate" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"examType":"CT","templateId":"ct-cranio-normal-v1","contrast":"without","indication":"Dor lombar. Achados compatíveis com hérnia discal.","findings":null}')

echo "report_http_code=$REPORT_CODE"
if [[ "$REPORT_CODE" != "200" ]]; then
  echo "FAIL: expected /reports/generate = 200" >&2
  exit 15
fi

if [[ ! -s "$REPORT_JSON" ]]; then
  echo "FAIL: missing report JSON" >&2
  exit 16
fi

# Give middleware time to log
sleep 0.75

if [[ "$SMOKE_MODE" == "local" ]]; then
  AUDIT_LOG_CONTENT="$SERVER_LOG"
else
  AUDIT_LOG_CONTENT="$BACKEND_DIR/smoke_audit.docker.logs"
  get_docker_logs_since "$LOG_SINCE" > "$AUDIT_LOG_CONTENT"
fi

# Validate audit log line exists (tolerant to Nest prefix/ANSI)
if ! grep -q '"endpoint":"/reports/generate"' "$AUDIT_LOG_CONTENT"; then
  echo "FAIL: audit line with endpoint not found" >&2
  echo "Hint: last 80 lines:" >&2
  tail -n 80 "$AUDIT_LOG_CONTENT" >&2 || true
  exit 17
fi

# Validate metadata present
grep -q '"templateId":"ct-cranio-normal-v1"' "$AUDIT_LOG_CONTENT"
grep -q '"examType":"CT"' "$AUDIT_LOG_CONTENT"
grep -q '"userId"' "$AUDIT_LOG_CONTENT"
grep -q '"timestamp"' "$AUDIT_LOG_CONTENT"
grep -q '"durationMs"' "$AUDIT_LOG_CONTENT"

# Validate sensitive content NOT present
if grep -q 'Dor lombar' "$AUDIT_LOG_CONTENT"; then
  echo "FAIL: logged indication" >&2
  exit 18
fi
if grep -q 'hérnia discal' "$AUDIT_LOG_CONTENT"; then
  echo "FAIL: logged findings" >&2
  exit 19
fi
if grep -q 'reportText' "$AUDIT_LOG_CONTENT"; then
  echo "FAIL: logged reportText" >&2
  exit 20
fi

echo "SMOKE_OK_AUDIT"

# Usage:
#   bash /home/juanr/vixrad-app/backend/scripts/smoke_audit.sh
