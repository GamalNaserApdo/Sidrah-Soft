#!/usr/bin/env bash
set -euo pipefail

# Production runtime startup — Gunicorn only.
# Migrations and collectstatic must be run separately
# via deploy.sh during a controlled deployment.
# This prevents the runtime user from needing DDL privileges
# and avoids unintended database mutations on every restart.

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
