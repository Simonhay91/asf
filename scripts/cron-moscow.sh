#!/usr/bin/env bash
# Cron: 3× Moscow districts per invocation via running backend (same env as Telegram).
# Crontab (UTC server): 0 6,15 * * * /var/www/russkiyasphalt/scripts/cron-moscow.sh >> /var/www/russkiyasphalt/logs/cron-moscow.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p logs

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
COUNT="${MOSCOW_CRON_COUNT:-3}"

echo "$(date -Is) cron-moscow: POST ${BACKEND_URL}/api/generate count=${COUNT}"

HTTP_CODE=$(curl -sS -o /tmp/cron-moscow-response.json -w "%{http_code}" \
  -X POST "${BACKEND_URL}/api/generate" \
  -H "Content-Type: application/json" \
  -d "{\"location_type\":\"moscow\",\"count\":${COUNT},\"background\":true}")

echo "$(date -Is) cron-moscow: HTTP ${HTTP_CODE}"
cat /tmp/cron-moscow-response.json
echo

if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
  echo "$(date -Is) cron-moscow: backend not reachable — fallback to autopost.py" >&2
  PYTHON="${PYTHON:-python3}"
  if [ -x "$ROOT/venv/bin/python" ]; then
    PYTHON="$ROOT/venv/bin/python"
  fi
  export PYTHONPATH="$ROOT"
  exec "$PYTHON" "$ROOT/autopost.py" --count "${COUNT}"
fi
