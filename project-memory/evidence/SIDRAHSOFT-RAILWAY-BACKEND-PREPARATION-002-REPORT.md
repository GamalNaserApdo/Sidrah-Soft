# SidrahSoft Railway Backend Preparation Report

**Task ID:** SIDRAHSOFT-RAILWAY-BACKEND-PREPARATION-002  
**Date:** 2026-07-21  
**Local root:** `F:\What_i_Made\New\sidrah_web`  
**Backend root:** `F:\What_i_Made\New\sidrah_web\backend`

---

## 1. Files Created

| File | Purpose |
|---|---|
| `backend/Procfile` | Railway process definition |
| `backend/runtime.txt` | Python runtime version |
| `backend/railway.toml` | Railway build/deploy configuration |
| `backend/start.sh` | Production startup script (migrations, collectstatic, gunicorn) |

## 2. Files Modified

| File | Changes |
|---|---|
| `backend/requirements.txt` | Added `gunicorn>=23.0.0`, `whitenoise>=6.7.0`, `dj-database-url>=2.3.0` |
| `backend/config/settings.py` | Added `DATABASE_URL` support, WhiteNoise, DJANGO_ prefixed env vars, HTTPS proxy settings |
| `backend/.env.example` | Reorganized with DJANGO_ prefixed variables and Railway placeholders |

---

## 3. Dependencies Added and Versions

```text
Django>=5.1,<6.0
djangorestframework>=3.15.0
django-cors-headers>=4.4.0
python-dotenv>=1.0.1
Pillow>=10.4.0
psycopg[binary]>=3.2,<4
gunicorn>=23.0.0
whitenoise>=6.7.0
dj-database-url>=2.3.0
```

Installed locally:
- `gunicorn 26.0.0`
- `whitenoise 6.12.0`
- `dj-database-url 3.1.2`

---

## 4. Database Configuration Behavior

### Local Development
- Uses `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`.
- Defaults to `sidrahsoft_db` / `sidrahsoft_user` / `127.0.0.1` / `5432`.

### Railway Production
- When `DATABASE_URL` is set, it overrides the local PostgreSQL configuration.
- `dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=False)` is used.
- `ENGINE` is forced to `django.db.backends.postgresql`.
- No credentials are hardcoded or printed.

### SSL
- `ssl_require=False` is used because Railway handles TLS at the connection/network level.

---

## 5. Static Files Configuration

- `STATIC_URL = "/static/"`
- `STATIC_ROOT = BASE_DIR / "staticfiles"`
- `STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"`
- `WhiteNoiseMiddleware` added immediately after `SecurityMiddleware`.
- `collectstatic --noinput` copies 154 files into `backend/staticfiles`.

---

## 6. Production Security Behavior

When `DEBUG=False`:

- `SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")`
- `SECURE_SSL_REDIRECT = True`
- `SECURE_HSTS_SECONDS = 31536000`
- `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- `SECURE_HSTS_PRELOAD = True`
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`

When `DEBUG=True` (local development):
- None of the above are enabled, preserving local HTTP behavior.

### Environment Variables

Production variables support the `DJANGO_` prefix and fall back to non-prefixed names:

- `DJANGO_SECRET_KEY` (fallback: `SECRET_KEY`)
- `DJANGO_DEBUG` (fallback: `DEBUG`)
- `DJANGO_ALLOWED_HOSTS` (fallback: `ALLOWED_HOSTS`)
- `DJANGO_CORS_ALLOWED_ORIGINS` (fallback: `CORS_ALLOWED_ORIGINS`)
- `DJANGO_CSRF_TRUSTED_ORIGINS` (fallback: `CSRF_TRUSTED_ORIGINS`)
- `DATABASE_URL`

No wildcard `ALLOWED_HOSTS = ["*"]` is set.

---

## 7. Railway Startup Files

### `backend/Procfile`

```text
web: bash start.sh
```

### `backend/runtime.txt`

```text
python-3.12.7
```

Note: local venv is Python 3.14.2. `python-3.12.7` is used for Railway compatibility with Django 5.1 and wider Railway support.

### `backend/railway.toml`

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "bash start.sh"
healthcheckPath = "/api/v1/health/"
healthcheckTimeout = 60
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### `backend/start.sh`

```bash
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
```

- Fails immediately if migrations or collectstatic fail (`set -e`).
- Uses Unix-compatible line endings.
- Does not run `makemigrations`.
- Does not create superusers.
- Does not seed data.

---

## 8. Health Check Path

- Existing endpoint: `GET /api/v1/health/`
- Returns `200 OK` with `{ "status": "ok", "service": "SidrahSoft CMS API" }`.
- No database writes.
- No sensitive information.
- Configured in `backend/railway.toml` as `healthcheckPath = "/api/v1/health/"`.

---

## 9. Required Railway Environment Variables

### Backend Core

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL` (provided automatically by Railway PostgreSQL)

### Local DB Fallback (optional, used when `DATABASE_URL` is absent)

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

### Optional / Localization

- `DEFAULT_LANGUAGE`
- `SUPPORTED_LANGUAGES`
- `MEDIA_URL`
- `STATIC_URL`
- `SESSION_COOKIE_AGE`

### Email

- `EMAIL_BACKEND`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `EMAIL_USE_TLS`
- `EMAIL_USE_SSL`
- `DEFAULT_FROM_EMAIL`
- `SERVER_EMAIL`

### Leads Dashboard

- `CONTACT_NOTIFICATION_EMAIL`
- `LEADS_DASHBOARD_BASE_URL`

---

## 10. Validation Results

### 10.1 `python manage.py check`

```text
System check identified no issues (0 silenced).
```

**Result: PASS**

### 10.2 `python manage.py check --deploy`

Run with production-like environment variables:

```bash
DJANGO_DEBUG=False \
DJANGO_SECRET_KEY=<random-60-char-key> \
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,sidrahsoft.com \
DJANGO_CSRF_TRUSTED_ORIGINS=https://sidrahsoft.com,http://localhost:5174 \
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend \
LEADS_DASHBOARD_BASE_URL=https://sidrahsoft.com \
DEFAULT_FROM_EMAIL='Sidrah Soft <sidrahsoft@gmail.com>' \
python manage.py check --deploy
```

```text
System check identified no issues (0 silenced).
```

**Result: PASS**

Note: without the production email and leads-dashboard values, `check --deploy` reports `contact.E001`, `contact.E002`, and `contact.E003`. These are expected and will be resolved once the corresponding environment variables are set in Railway.

### 10.3 `python manage.py makemigrations --check --dry-run`

```text
No changes detected
```

**Result: PASS**

### 10.4 `python manage.py collectstatic --noinput`

```text
154 static files copied to 'F:\What_i_Made\New\sidrah_web\backend\staticfiles'.
```

**Result: PASS**

---

## 11. Security Review

| Check | Status |
|---|---|
| `.env` remains gitignored | Yes (`backend/.env` and root `.env` are in `.gitignore`) |
| No secret values added | No secrets added to any tracked file |
| `SECRET_KEY` not hardcoded for production | Loaded from `DJANGO_SECRET_KEY` / `SECRET_KEY` env var |
| Database credentials not committed | Only placeholders in `.env.example` |
| SMTP credentials not committed | Only placeholders in `.env.example` |
| No permissive `ALLOWED_HOSTS = ["*"]` | Defaults to `localhost,127.0.0.1`; must be set explicitly in production |
| Session authentication unchanged | No changes to `SessionAuthentication` |
| CSRF middleware unchanged | `CsrfViewMiddleware` still active; `CSRF_COOKIE_SAMESITE = 'Lax'` preserved |
| RBAC unchanged | `rest_framework.permissions.AllowAny` for public APIs preserved |
| Rate limiting unchanged | Throttle rates preserved |
| Activity logging unchanged | No modifications to `apps.activity_logs` |

---

## 12. Remaining Deployment-Time Settings

The following must be set in the Railway backend service after the public domain is known:

- `DJANGO_SECRET_KEY` — long random string.
- `DJANGO_ALLOWED_HOSTS` — e.g. `<backend-public-domain>.up.railway.app`.
- `DJANGO_CORS_ALLOWED_ORIGINS` — frontend public URL(s).
- `DJANGO_CSRF_TRUSTED_ORIGINS` — frontend public URL(s).
- `EMAIL_BACKEND` — `django.core.mail.backends.smtp.EmailBackend` for production.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`.
- `DEFAULT_FROM_EMAIL` — a domain you control.
- `CONTACT_NOTIFICATION_EMAIL`.
- `LEADS_DASHBOARD_BASE_URL` — frontend public URL.

`DATABASE_URL` will be provided automatically by the Railway PostgreSQL service.

---

## 13. Final GO / NO-GO Decision for Backend Deployment

**Decision: GO — backend is prepared for Railway deployment.**

All required production configuration is in place:
- Dependencies updated.
- `DATABASE_URL` supported.
- WhiteNoise configured for static files.
- Gunicorn and startup script ready.
- Production security settings conditional on `DEBUG=False`.
- Health check endpoint configured.
- Validation checks pass.

The remaining work is deployment-time configuration in Railway itself (environment variables, PostgreSQL service, public domain). No further code changes are needed before opening Railway.
