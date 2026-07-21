# SidrahSoft Railway Healthcheck SSL Fix Report

**Task ID:** SIDRAHSOFT-RAILWAY-HEALTHCHECK-SSL-FIX-003  
**Date:** 2026-07-21  
**Files modified:**
- `backend/config/settings.py`
- `backend/.env.example`

---

## Problem

Railway's internal HTTP healthcheck to `/api/v1/health/` was receiving an HTTP `301` redirect because `SECURE_SSL_REDIRECT` was unconditionally enabled whenever `DEBUG=False`. Railway terminates HTTPS at its edge, so the internal container-to-container healthcheck reaches the application over HTTP and is redirected to HTTPS, causing the healthcheck to fail.

## Fix

Made `SECURE_SSL_REDIRECT` configurable via the environment variable `DJANGO_SECURE_SSL_REDIRECT` while keeping secure production behavior by default.

### `backend/config/settings.py`

```python
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    # Default True in production; set False on Railway because the edge terminates HTTPS.
    SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', default='True')
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

- `env_bool` checks `DJANGO_SECURE_SSL_REDIRECT`, then `SECURE_SSL_REDIRECT`, then defaults to `True`.
- `SECURE_PROXY_SSL_HEADER`, `SESSION_COOKIE_SECURE`, and `CSRF_COOKIE_SECURE` remain enabled in production.
- `/api/v1/health/` continues to return HTTP `200` directly when `SECURE_SSL_REDIRECT` is disabled.

### `backend/.env.example`

Added:

```env
# HTTPS redirect. Default is True in production. Set to False on Railway because the
# edge terminates HTTPS and internal healthchecks reach the container over HTTP.
DJANGO_SECURE_SSL_REDIRECT=True
```

## Validation

### `python manage.py check`

```text
System check identified no issues (0 silenced).
```

**Result: PASS**

### `python manage.py check --deploy`

Run with `DJANGO_SECURE_SSL_REDIRECT=False`:

```text
System check identified some issues (1 issue):

WARNINGS:
?: (security.W008) Your SECURE_SSL_REDIRECT setting is not set to True. Unless your
site should be available over both SSL and non-SSL connections, you may want to either
set this setting True or configure a load balancer or reverse-proxy server to redirect
all connections to HTTPS.
```

**Result: Expected warning only.**  
`security.W008` is generated intentionally when `DJANGO_SECURE_SSL_REDIRECT=False`. This is acceptable because Railway handles HTTPS termination at its edge; the public application is still served over HTTPS, and `SECURE_PROXY_SSL_HEADER`, `SESSION_COOKIE_SECURE`, and `CSRF_COOKIE_SECURE` remain active.

## Required Railway Configuration

After pushing to GitHub, set in the Railway backend service:

```env
DJANGO_SECURE_SSL_REDIRECT=False
```

## Summary

The backend now supports disabling `SECURE_SSL_REDIRECT` for Railway's internal HTTP healthchecks while preserving all other production HTTPS security settings. No health endpoint path changes were made.
