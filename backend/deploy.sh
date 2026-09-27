#!/usr/bin/env bash
# ===========================================================================
# Controlled Production Deployment Script
# ===========================================================================
# Run this ONCE during a controlled deployment — NOT on every startup.
#
# This script performs the pre-deploy steps that were previously
# embedded in start.sh:
#   1. Django system checks (deploy mode)
#   2. Database migrations
#   3. Collect static files
#
# After this script completes successfully, start.sh (Gunicorn only)
# should be used for the application runtime.
#
# IMPORTANT:
#   - Take a verified database backup BEFORE running this script.
#   - Do NOT run training seed commands (seed_training_content) here.
#   - The runtime user should NOT need DDL privileges after this step.
#   - Review the output for errors before starting the application.
#
# ONE-TIME PRODUCTION INITIALIZATION (not included in this script):
#   - seed_inquiry_types: Run ONCE on a fresh database via:
#       python manage.py seed_inquiry_types
#     This command uses update_or_create and can overwrite admin-customized
#     inquiry type labels. Do NOT run it on every deploy if CMS admins have
#     customized inquiry types. It is only needed for initial setup.
# ===========================================================================
set -euo pipefail

echo "==> Step 1/3: Django deploy checks..."
python manage.py check --deploy

echo "==> Step 2/3: Running Django migrations..."
python manage.py migrate --noinput

echo "==> Step 3/3: Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "==> Deployment preparation complete."
echo "==> You may now start the application with: bash start.sh"
