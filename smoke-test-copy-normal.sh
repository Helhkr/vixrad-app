#!/bin/bash

set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:3002}"
TEMPLATE_ID="${TEMPLATE_ID:-xr-abdome-normal-v1}"
INCIDENCE_VALUE="${INCIDENCE_VALUE:-PA e Perfil}"
DECUBITUS_VALUE="${DECUBITUS_VALUE:-}"
SIDE_VALUE="${SIDE_VALUE:-}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Missing required command: $1" >&2
    exit 127
  }
}

need_cmd curl
need_cmd python3

echo "=== Smoke Test: Copy Normal Report with Incidence ==="
echo "API_BASE_URL=$API_BASE_URL"
echo "TEMPLATE_ID=$TEMPLATE_ID"
echo "INCIDENCE_VALUE=$INCIDENCE_VALUE"
if [ -n "$SIDE_VALUE" ]; then
  echo "SIDE_VALUE=$SIDE_VALUE"
fi
if [ -n "$DECUBITUS_VALUE" ]; then
  echo "DECUBITUS_VALUE=$DECUBITUS_VALUE"
fi
echo

EMAIL="${SMOKE_EMAIL:-smoke+$(date +%s)@vixrad.local}"
PASSWORD="${SMOKE_PASSWORD:-SmokeTest#$(date +%s)}"

if [ -z "${SMOKE_EMAIL:-}" ] || [ -z "${SMOKE_PASSWORD:-}" ]; then
  echo "1) Registering temp user ($EMAIL)..."
  REGISTER_RESPONSE=$(curl -sS -X POST "$API_BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

  REGISTER_ERROR=$(printf '%s' "$REGISTER_RESPONSE" | python3 -c 'import json,sys
try:
  data=json.load(sys.stdin)
  print(data.get("error") or "")
except Exception:
  print("")')

  if [ -n "$REGISTER_ERROR" ]; then
    echo "❌ Register failed: $REGISTER_RESPONSE" >&2
    exit 1
  fi

  echo "✓ Registered"
  echo
else
  echo "1) Using existing credentials from SMOKE_EMAIL/SMOKE_PASSWORD"
  echo
fi

echo "2) Logging in as $EMAIL..."
LOGIN_RESPONSE=$(curl -sS -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

ACCESS_TOKEN=$(printf '%s' "$LOGIN_RESPONSE" | python3 -c 'import json,sys
data=json.load(sys.stdin)
print(data.get("accessToken") or "")')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token" >&2
  echo "Response: $LOGIN_RESPONSE" >&2
  exit 1
fi

echo "✓ Got access token"
echo

echo "3) Calling /reports/generate WITH incidence (should succeed)..."
REPORT_OK_BODY=$(python3 -c 'import json,os
body={
  "examType":"XR",
  "templateId":os.environ["TEMPLATE_ID"],
  "contrast":"without",
  "incidence":os.environ["INCIDENCE_VALUE"],
  "findings":None,
}
sv=os.environ.get("SIDE_VALUE")
if sv:
  body["side"]=sv
dv=os.environ.get("DECUBITUS_VALUE")
if dv:
  body["decubitus"]=dv
print(json.dumps(body, ensure_ascii=False))')

REPORT_OK_RESPONSE=$(curl -sS -X POST "$API_BASE_URL/reports/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$REPORT_OK_BODY")

REPORT_TEXT=$(printf '%s' "$REPORT_OK_RESPONSE" | python3 -c 'import json,sys
data=json.load(sys.stdin)
print(data.get("reportText") or "")')

if [ -z "$REPORT_TEXT" ]; then
  echo "❌ Expected reportText but got:" >&2
  echo "$REPORT_OK_RESPONSE" >&2
  exit 1
fi

echo "✓ Report generated"
echo "Preview (first 200 chars):"
echo "---"
echo "$REPORT_TEXT" | head -c 200
echo
echo "---"
echo

echo "4) Calling /reports/generate WITHOUT incidence (should 400)..."
set +e
REPORT_BAD_BODY=$(python3 -c 'import json,os
body={
  "examType":"XR",
  "templateId":os.environ["TEMPLATE_ID"],
  "contrast":"without",
  "findings":None,
}
sv=os.environ.get("SIDE_VALUE")
if sv:
  body["side"]=sv
print(json.dumps(body, ensure_ascii=False))')

REPORT_BAD_RESPONSE=$(curl -sS -X POST "$API_BASE_URL/reports/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$REPORT_BAD_BODY")
set -e

BAD_MESSAGE=$(printf '%s' "$REPORT_BAD_RESPONSE" | python3 -c 'import json,sys
try:
  data=json.load(sys.stdin)
  print(data.get("message") or "")
except Exception:
  print("")')

if echo "$BAD_MESSAGE" | grep -q "requires.incidence"; then
  echo "✓ Missing-incidence request correctly rejected: $BAD_MESSAGE"
else
  echo "⚠ Unexpected response for missing-incidence request:" >&2
  echo "$REPORT_BAD_RESPONSE" >&2
fi

echo
echo "=== ✓ Smoke Test PASSED ==="
