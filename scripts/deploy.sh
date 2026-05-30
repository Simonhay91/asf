#!/usr/bin/env bash
# Full deploy on VPS: /var/www/russkiyasphalt
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> git pull"
git pull origin main

echo "==> frontend build"
cd frontend && npm run build && cd ..

echo "==> SPA meta HTML (static prerender)"
if [[ -x "$ROOT/venv/bin/python" ]]; then
  "$ROOT/venv/bin/python" scripts/generate_spa_meta_html.py
else
  python3 scripts/generate_spa_meta_html.py
fi

echo "==> restart backend"
pm2 restart russkiyasphalt-backend

echo "==> rebuild sitemap"
if [[ -x "$ROOT/venv/bin/python" ]]; then
  "$ROOT/venv/bin/python" scripts/rebuild_sitemap.py
else
  python3 scripts/rebuild_sitemap.py
fi

echo "==> verify meta injection endpoint"
curl -sf "http://127.0.0.1:8000/__spa?path=/kontakty/" | grep -o '<title>[^<]*</title>' || {
  echo "ERROR: /__spa not ready — check pm2 logs"
  exit 1
}

echo "==> verify nginx @spa (public URL)"
if curl -sf "https://russkiyasphalt.ru/kontakty/" | grep -q 'Контакты —'; then
  echo "OK: unique title on /kontakty/"
else
  echo "WARN: nginx may still serve root index.html without @spa."
  echo "Run on server:"
  echo "  sudo cp deploy/nginx-russkiyasphalt.conf /etc/nginx/sites-available/russkiyasphalt"
  echo "  sudo nginx -t && sudo systemctl reload nginx"
fi

echo "Done."
