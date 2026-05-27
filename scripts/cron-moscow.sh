#!/usr/bin/env bash
# Cron: 2× Moscow districts per invocation.
# Crontab (MSK server): 0 9,18 * * * /var/www/russkiyasphalt/scripts/cron-moscow.sh
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

PYTHON="${PYTHON:-python3}"
if [ -x "$ROOT/venv/bin/python" ]; then
  PYTHON="$ROOT/venv/bin/python"
elif [ -x "$ROOT/.venv/bin/python" ]; then
  PYTHON="$ROOT/.venv/bin/python"
fi

export PYTHONPATH="$ROOT"

exec "$PYTHON" "$ROOT/autopost.py" --count 2
