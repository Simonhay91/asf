#!/usr/bin/env bash
# Cron: drain the Yandex recrawl backlog daily, within the API quota.
#
# The submit script is resumable (state file), so a daily run keeps sending
# up to the remaining quota until every sitemap URL is submitted, then no-ops.
# New pages are pinged automatically by the backend on generation.
#
# Crontab (UTC): 30 6 * * * /var/www/russkiyasphalt/scripts/cron-yandex.sh >> /var/www/russkiyasphalt/logs/cron-yandex.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p logs

PYTHON="python3"
if [ -x "$ROOT/venv/bin/python" ]; then
  PYTHON="$ROOT/venv/bin/python"
fi

echo "$(date -Is) cron-yandex: start"
"$PYTHON" "$ROOT/scripts/yandex_submit_all.py"
echo "$(date -Is) cron-yandex: done"
