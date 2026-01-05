#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3002}"

SERVER_LOG="$BACKEND_DIR/smoke_security.server.log"
REGISTER_JSON="$BACKEND_DIR/smoke_security.register.json"
PID_FILE="$BACKEND_DIR/smoke_security.pid"

rm -f "$SERVER_LOG" "$REGISTER_JSON" "$PID_FILE"

cd "$BACKEND_DIR"

DATABASE_URL='postgresql://postgres:postgres@localhost:5432/vixrad?schema=public'
JWT_SECRET='dev_secret'
JWT_REFRESH_SECRET='dev_refresh_secret'

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

# Register user
EMAIL="smoke_security_$(date +%s%N)@example.com"
REG_CODE=$(curl -sS -o "$REGISTER_JSON" -w '%{http_code}' \
  -X POST "http://localhost:$PORT/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Passw0rd!\"}")

echo "register_http_code=$REG_CODE"
if [[ "$REG_CODE" != "201" && "$REG_CODE" != "200" ]]; then
  echo "FAIL: expected /auth/register = 200|201" >&2
  tail -n 80 "$SERVER_LOG" >&2 || true
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
  -X POST "http://localhost:$PORT/reports/generate" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $EXPIRED_TOKEN" \
  -d '{"examType":"CT","templateId":"ct-cranio-normal-v1","contrast":"without","indication":"Teste","findings":"Teste"}')

echo "expired_token_http_code=$EXPIRED_CODE"
if [[ "$EXPIRED_CODE" != "401" ]]; then
  echo "FAIL: expected expired token -> 401" >&2
  tail -n 80 "$SERVER_LOG" >&2 || true
  exit 23
fi

# 429: rate limit after 10 req/min
for i in $(seq 1 10); do
  CODE=$(curl -sS -o /dev/null -w '%{http_code}' \
    -X POST "http://localhost:$PORT/reports/generate" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"examType":"CT","templateId":"ct-cranio-normal-v1","contrast":"without","indication":"Teste","findings":"Teste"}')
  if [[ "$CODE" != "200" ]]; then
    echo "FAIL: expected request $i -> 200 (got $CODE)" >&2
    tail -n 80 "$SERVER_LOG" >&2 || true
    exit 24
  fi
  sleep 0.05
done

CODE_11=$(curl -sS -o /dev/null -w '%{http_code}' \
  -X POST "http://localhost:$PORT/reports/generate" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"examType":"CT","templateId":"ct-cranio-normal-v1","contrast":"without","indication":"Teste","findings":"Teste"}')

echo "rate_limit_http_code=$CODE_11"
if [[ "$CODE_11" != "429" ]]; then
  echo "FAIL: expected 11th request -> 429 (got $CODE_11)" >&2
  tail -n 120 "$SERVER_LOG" >&2 || true
  exit 25
fi

echo "SMOKE_OK_SECURITY"

# Usage:
#   bash scripts/smoke_security.sh
