#!/usr/bin/env bash
set -euo pipefail

echo "==> Running Django migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Starting Gunicorn server..."
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 4 \
  --worker-class sync \
  --timeout 60 \
  --keep-alive 2 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --access-logfile - \
  --error-logfile -
