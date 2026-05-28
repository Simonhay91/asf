#!/usr/bin/env bash
# Full deploy on VPS: /var/www/russkiyasphalt
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> git pull"
git pull origin main

echo "==> frontend build"
cd frontend && npm run build && cd ..

echo "==> SPA meta HTML (optional static prerender)"
if [[ -x "$ROOT/venv/bin/python" ]]; then
  "$ROOT/venv/bin/python" scripts/generate_spa_meta_html.py || true
else
  python3 scripts/generate_spa_meta_html.py || true
fi

echo "==> restart backend"
pm2 restart russkiyasphalt-backend

echo "==> verify meta injection endpoint"
curl -sf "http://127.0.0.1:8000/__spa?path=/kontakty/" | grep -o '<title>[^<]*</title>' || {
  echo "WARN: /__spa not ready — check pm2 logs"
}

echo "Done. If nginx not patched yet, run:"
echo "  sudo cp deploy/nginx-russkiyasphalt.conf /etc/nginx/sites-available/russkiyasphalt"
echo "  sudo nginx -t && sudo systemctl reload nginx"
