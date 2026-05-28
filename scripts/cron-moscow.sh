#!/usr/bin/env bash
# Cron: Moscow districts + optional daily blog via backend (same env as Telegram).
#
# Crontab (UTC): 0 6,15 * * * /var/www/russkiyasphalt/scripts/cron-moscow.sh >> /var/www/russkiyasphalt/logs/cron-moscow.log 2>&1
#
# Defaults per run:
#   06:00 UTC (09:00 MSK) — 3 districts + 1 blog (if CRON_BLOG_COUNT>0)
#   15:00 UTC (18:00 MSK) — 3 districts only
#
# Env overrides (.env):
#   MOSCOW_CRON_COUNT=3
#   CRON_BLOG_COUNT=1      (0 = no blog)
#   CRON_BLOG_WEEKDAYS=0   (1 = blog Mon–Fri only)
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
BLOG_COUNT="${CRON_BLOG_COUNT:-1}"
BLOG_WEEKDAYS="${CRON_BLOG_WEEKDAYS:-0}"

post_generate() {
  local label="$1"
  local payload="$2"
  local tmp="/tmp/cron-moscow-${label}.json"

  echo "$(date -Is) cron: POST ${BACKEND_URL}/api/generate (${label})"
  local http_code
  http_code=$(curl -sS -o "$tmp" -w "%{http_code}" \
    -X POST "${BACKEND_URL}/api/generate" \
    -H "Content-Type: application/json" \
    -d "$payload")

  echo "$(date -Is) cron: ${label} HTTP ${http_code}"
  cat "$tmp"
  echo

  if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
    return 1
  fi
  return 0
}

# ── Moscow districts ──
if ! post_generate "moscow×${COUNT}" \
  "{\"location_type\":\"moscow\",\"count\":${COUNT},\"background\":true}"; then
  echo "$(date -Is) cron: backend failed — fallback autopost.py" >&2
  PYTHON="${PYTHON:-python3}"
  if [ -x "$ROOT/venv/bin/python" ]; then
    PYTHON="$ROOT/venv/bin/python"
  fi
  export PYTHONPATH="$ROOT"
  exec "$PYTHON" "$ROOT/autopost.py" --count "${COUNT}"
fi

# ── Blog: once per day at 06:00 UTC (09:00 MSK), next topic from queue ──
utc_hour="$(date -u +%H)"
if [ "$BLOG_COUNT" -gt 0 ] && [ "$utc_hour" = "06" ]; then
  if [ "$BLOG_WEEKDAYS" = "1" ]; then
    dow="$(date -u +%u)"
    if [ "$dow" -gt 5 ]; then
      echo "$(date -Is) cron: blog skip (weekend, CRON_BLOG_WEEKDAYS=1)"
      exit 0
    fi
  fi
  post_generate "blog×1" '{"location_type":"blog","count":1,"background":true}' || true
fi
