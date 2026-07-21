# SidrahSoft Railway Production Readiness Report

**Task ID:** SIDRAHSOFT-RAILWAY-PRODUCTION-READINESS-001  
**Date:** 2026-07-21  
**Repository:** https://github.com/GamalNaserApdo/Sidrah-Soft.git  
**Local root:** `F:\What_i_Made\New\sidrah_web`  
**Investigation scope:** Determine whether the React/Vite frontend and Django backend are ready for deployment to Railway from the same GitHub monorepo. No deployment or code changes performed.

---

## 1. Current Repository Structure

```
F:\What_i_Made\New\sidrah_web
├── .env                         # gitignored, local only
├── .env.example                 # tracked, frontend template
├── .gitignore
├── package.json                 # Vite/React frontend
├── package-lock.json            # tracked
├── vite.config.js               # Vite config
├── index.html
├── src/                         # React source code
├── public/                      # Static assets (including /assets/training_images)
├── dist/                        # Vite build output (generated locally, gitignored)
├── backend/                     # Django backend
│   ├── .env                     # gitignored, local only
│   ├── .env.example             # tracked, backend template
│   ├── manage.py
│   ├── requirements.txt
│   ├── README.md
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── accounts/
│       ├── activity_logs/
│       ├── careers/
│       ├── case_studies/
│       ├── contact/
│       ├── core/
│       ├── homepage/
│       ├── insights/
│       ├── media_library/
│       ├── navigation/
│       ├── partners/
│       ├── services/
│       └── site_settings/
└── project-memory/
    └── evidence/                # this report
```

### 1.1 Monorepo Layout

- Frontend root: repository root (`F:\What_i_Made\New\sidrah_web`)
- Backend root: `backend/`
- Both frontend and backend share the same Git repository.
- No deployment configuration files exist yet (`Procfile`, `railway.toml`, `runtime.txt`, `Caddyfile`, `nginx.conf`).

---

## 2. Frontend Investigation

### 2.1 Build System

| Item | Value | Status |
|---|---|---|
| Framework | React 19.1 + Vite 7.1 | OK |
| Build command | `npm run build` → `vite build` | OK |
| Output directory | `dist/` | OK |
| Build result | PASS (4.34s, 161 modules) | OK |
| package-lock.json | Tracked in git | OK |

### 2.2 Vite Configuration

File: `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  }
});
```

- No production-specific build settings (chunking, base path, source maps, etc.).
- Development port `5174` is hardcoded but only affects `vite dev`, not production.
- No `base` path configured, so the app assumes it is served from `/`.

### 2.3 Environment Variables

File: `.env.example`

```
VITE_API_BASE_URL="http://localhost:8002"
```

- Only one VITE variable is used in the frontend: `VITE_API_BASE_URL`.
- File `src/services/apiClient.js` reads it:
  ```js
  const DEFAULT_API_BASE_URL = 'http://localhost:8002';
  export const API_BASE_URL =
    import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
  ```
- If `VITE_API_BASE_URL` is not set at build time, the frontend falls back to `http://localhost:8002`, which will fail in production.

### 2.4 Localhost / Port References

- `vite.config.js`: `port: 5174` (dev only, not a blocker).
- `src/services/apiClient.js`: `DEFAULT_API_BASE_URL = 'http://localhost:8002'` (production blocker if env var missing).
- `.env.example`: `VITE_API_BASE_URL="http://localhost:8002"` (template only).
- No other hardcoded `localhost` or `127.0.0.1` references found in `src/`.

### 2.5 Client-Side Routing

File: `src/main.jsx`

```jsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

- Uses `BrowserRouter` from `react-router-dom`.
- Routes include `/training`, `/training/:courseSlug`, `/leads/login`, `/leads`, etc.
- **Deployment implication:** Static server must serve `index.html` for all non-asset routes (SPA fallback). Without this, deep-link refresh on `/training/backend-development` returns 404.

### 2.6 Production Static Serving

- No static server configuration exists (no `Caddyfile`, `nginx.conf`, or Node server).
- `package.json` has `vite preview`, but `vite preview` is not intended for production.
- A production static server must be added (e.g., `serve`, `http-server`, Caddy, Nginx, or a custom Express server).
- Recommended for Railway: use `npx serve -s dist -l $PORT` or install `serve` as a dependency and run `serve -s dist`.

### 2.7 Build Warnings

The build completes successfully but emits two pre-existing warnings:

1. `src/contexts/CMSLanguageContext.jsx`: duplicate key `form.status` in object literal (English + Arabic objects). Non-blocking, should be cleaned up.
2. `src/services/insightsApi.js`: dynamically imported by `useInsights.js` but also statically imported. Non-blocking chunking warning.
3. `Some chunks are larger than 500 kB after minification`. Non-blocking performance warning.

---

## 3. Backend Investigation

### 3.1 Django Setup

| Item | Value | Status |
|---|---|---|
| `manage.py` location | `backend/manage.py` | OK |
| Settings module | `config.settings` | OK |
| WSGI application | `config.wsgi.application` | OK |
| ASGI application | `config.asgi.application` | OK |
| Python runtime file (`runtime.txt`) | Missing | BLOCKER |
| `Procfile` | Missing | BLOCKER |
| `railway.toml` / `railway.json` | Missing | NEEDS ADDING |
| Gunicorn | Not in `requirements.txt` | BLOCKER |
| WhiteNoise | Not in `requirements.txt` | BLOCKER |
| `DATABASE_URL` parsing | Not implemented | BLOCKER |

### 3.2 Python Dependencies

File: `backend/requirements.txt`

```
Django>=5.1,<6.0
djangorestframework>=3.15.0
django-cors-headers>=4.4.0
python-dotenv>=1.0.1
Pillow>=10.4.0
psycopg[binary]>=3.2,<4
```

- Missing for Railway production:
  - `gunicorn` (WSGI server)
  - `whitenoise` (static file serving in production)
  - `dj-database-url` (parse `DATABASE_URL` from Railway PostgreSQL)

### 3.3 Settings Analysis

File: `backend/config/settings.py`

- `load_dotenv(BASE_DIR / '.env')` loads `backend/.env`.
- `SECRET_KEY` loaded from env; `None` if missing.
- `DEBUG = os.environ.get('DEBUG', 'False').strip().lower() in ('true', '1', 'yes')`.
- `ALLOWED_HOSTS` from comma-separated env.
- `DATABASES` block reads individual `DB_*` variables; does **not** parse `DATABASE_URL`.
- `STATIC_URL` and `STATIC_ROOT` set; `STATIC_ROOT = BASE_DIR / 'staticfiles'`.
- `MEDIA_URL` and `MEDIA_ROOT` set; `MEDIA_ROOT = BASE_DIR / 'media'`.
- Static and media files are only served via Django in `DEBUG` mode (`urls.py` `static()` helper).
- In production, static files are not served unless WhiteNoise or an external CDN/reverse proxy is added.
- `SECURE_SSL_REDIRECT`, `SECURE_HSTS_*`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` are enabled only when `DEBUG=False`.
- `CSRF_COOKIE_SAMESITE = 'Lax'` and `SESSION_COOKIE_SAMESITE = 'Lax'` are set unconditionally.
- `CORS_ALLOW_CREDENTIALS = True`.

### 3.4 URL Configuration

File: `backend/config/urls.py`

- Health check endpoint: `/api/v1/health/` (name `core:health`).
- All API endpoints under `/api/v1/`.
- Admin at `/admin/`.
- Static/media serving only in `DEBUG`.

### 3.5 Migrations

- Migrations exist for all apps with concrete models.
- `apps/core/migrations/` only contains `__init__.py` because `core` only defines abstract models (`TimeStampedModel`).
- `python manage.py makemigrations --check --dry-run` returned: `No changes detected`.
- Migration command for Railway: `python manage.py migrate`.

### 3.6 Health Check

- Endpoint: `GET /api/v1/health/`
- Returns: `{ "status": "ok", "service": "SidrahSoft CMS API" }`
- Suitable for Railway health checks.

### 3.7 Startup / Runtime

- No `Procfile` or `railway.toml` exists.
- No `runtime.txt` to pin Python version.
- No Gunicorn command defined.
- `wsgi.py` and `asgi.py` are standard Django files.

---

## 4. Security Findings

### 4.1 Secret Exposure

| Item | Status |
|---|---|
| `.env` in repository root | Present locally, **gitignored** |
| `backend/.env` | Present locally, **gitignored** |
| Tracked `.env` files | None (only `.env.example` tracked) |
| Tracked DB passwords | None |
| Tracked SMTP passwords | None |
| Tracked private keys / PEM files | None |
| Local database dumps | `db_test.sqlite3`, `db_check.sqlite3`, `db_check.sqlite3` exist locally, all **gitignored** |
| Tracked SQLite files | None |
| `package-lock.json` | Tracked (expected and safe) |

### 4.2 Secrets Required for Production

The following environment variables must be set in Railway but are **not** in the repository:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL` (Railway provides this automatically)
- `EMAIL_HOST` (if SMTP enabled)
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `CONTACT_NOTIFICATION_EMAIL`
- `LEADS_DASHBOARD_BASE_URL`

### 4.3 Local `.env` Note

- `F:\What_i_Made\New\sidrah_web\.env` exists locally and is ignored by `.gitignore`.
- `F:\What_i_Made\New\sidrah_web\backend\.env` exists locally and is ignored.
- The report does not read or print values from these files.

---

## 5. Deployment Blockers

### 5.1 Backend Blockers

1. **No `runtime.txt` / Python version pinned.**
2. **No `Procfile` or `railway.toml`.**
3. **`gunicorn` not in `requirements.txt`.**
4. **`whitenoise` not in `requirements.txt`.**
5. **`DATABASE_URL` not parsed in `settings.py`.**
6. **Static files not served in production.**
7. **`collectstatic` not configured for WhiteNoise.**
8. **Health check path not documented for Railway service (exists in code).**

### 5.2 Frontend Blockers

1. **No production static server configured.**
2. **`vite.config.js` has no SPA fallback or `base` path handling.**
3. **`VITE_API_BASE_URL` must be set at build time; default `http://localhost:8002` will fail in production.**
4. **`dist/` output must be served with `index.html` fallback for all routes.**

### 5.3 Shared / Monorepo Blockers

1. **No documented Railway service separation.**
2. **No `nixpacks.toml` or `railway.toml` to define separate build/start commands per service.**
3. **Frontend build requires backend public URL to be known before it is deployed.**

---

## 6. Required Code/Config Changes

### 6.1 Backend Changes

1. Add to `backend/requirements.txt`:
   ```
   gunicorn>=23.0
   whitenoise>=6.7
   dj-database-url>=2.3
   ```
2. Add `backend/runtime.txt`:
   ```
   python-3.12.x
   ```
3. Add `backend/Procfile`:
   ```
   web: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4
   ```
4. Update `backend/config/settings.py`:
   - Import `dj_database_url` and parse `DATABASE_URL`.
   - Add `whitenoise.middleware.WhiteNoiseMiddleware` to `MIDDLEWARE` (after `SecurityMiddleware`).
   - Ensure `STATICFILES_STORAGE` uses WhiteNoise.
   - Keep `STATIC_ROOT` and `MEDIA_ROOT` as is.
5. Add `railway.toml` (or `nixpacks.toml`) in `backend/`.

### 6.2 Frontend Changes

1. Add a production static server dependency or use `npx serve`.
2. Add `railway.toml` (or `nixpacks.toml`) in repository root for the frontend service.
3. Add SPA fallback configuration to the static server (`-s` for `serve`).
4. Set `VITE_API_BASE_URL` at build time to the Railway backend public URL.
5. Optionally update `vite.config.js` with `base: '/'` and build chunking tuning.

### 6.3 Optional Cleanup

1. Fix duplicate `form.status` key in `src/contexts/CMSLanguageContext.jsx`.
2. Resolve insights API dynamic/static import warning.
3. Split large JS chunks for better performance.

---

## 7. Recommended Railway Architecture

### 7.1 Services

```
Railway Project: SidrahSoft
├── Frontend Service  (Root: /)
├── Backend Service   (Root: backend/)
└── PostgreSQL Service
```

### 7.2 Backend Service Settings

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4` |
| **Health Check Path** | `/api/v1/health/` |
| **Required Variables** | `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `DATABASE_URL`, `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`, `CONTACT_NOTIFICATION_EMAIL`, `LEADS_DASHBOARD_BASE_URL` |
| **PostgreSQL Reference** | `DATABASE_URL` (auto-provided by Railway PostgreSQL) |
| **Public Networking** | Generate public domain, add to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` |

### 7.3 Frontend Service Settings

| Setting | Value |
|---|---|
| **Root Directory** | `/` (repository root) |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npx serve -s dist -l $PORT` (or `serve -s dist` if `serve` is a dependency) |
| **Output Directory** | `dist/` |
| **SPA Fallback** | Required; `serve -s` handles this |
| **Required VITE Variables** | `VITE_API_BASE_URL` |
| **Backend Public URL Dependency** | Frontend build must run after backend public URL is known, or the URL must be stable (e.g., `https://api.sidrahsoft.com` custom domain) |

### 7.4 PostgreSQL Service

- Add Railway PostgreSQL.
- Railway will inject `DATABASE_URL` into the backend service.
- `settings.py` must be updated to parse `DATABASE_URL`.

---

## 8. Exact Service Root Directories

| Service | Root Directory (from repo root) |
|---|---|
| Frontend | `/` |
| Backend | `backend` |
| PostgreSQL | N/A (managed by Railway) |

---

## 9. Exact Build and Start Commands

### 9.1 Backend

```bash
# Build
pip install -r requirements.txt
python manage.py collectstatic --noinput

# Start
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4
```

### 9.2 Frontend

```bash
# Build
npm ci
npm run build

# Start
npx serve -s dist -l $PORT
```

### 9.3 Migrations

Run once after backend deploy or as a startup step:

```bash
python manage.py migrate
```

---

## 10. Required Environment Variable Names

### 10.1 Backend

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL`
- `DEFAULT_LANGUAGE` (optional, defaults to `en`)
- `SUPPORTED_LANGUAGES` (optional, defaults to `en,ar`)
- `STATIC_URL` (optional, defaults to `/static/`)
- `MEDIA_URL` (optional, defaults to `/media/`)
- `SESSION_COOKIE_AGE` (optional, defaults to `28800`)
- `EMAIL_BACKEND`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `EMAIL_USE_TLS`
- `EMAIL_USE_SSL`
- `EMAIL_TIMEOUT`
- `DEFAULT_FROM_EMAIL`
- `SERVER_EMAIL`
- `CONTACT_NOTIFICATION_EMAIL`
- `LEADS_DASHBOARD_BASE_URL`

### 10.2 Frontend

- `VITE_API_BASE_URL`

---

## 11. Security Checklist

- [x] No `.env` files tracked in Git.
- [x] No production secrets in source code.
- [x] No database passwords committed.
- [x] No SMTP passwords committed.
- [x] No private keys / PEM files committed.
- [x] No database dumps committed.
- [x] `SECRET_KEY` is loaded from environment.
- [ ] `SECURE_SSL_REDIRECT`, `HSTS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` are conditional on `DEBUG=False` and will activate in production.
- [ ] `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` must be updated with Railway domains.

---

## 12. Validation Results

### 12.1 Frontend Build

```bash
npm run build
```

**Result:** PASS  
- 161 modules transformed
- Built in 4.34s
- `dist/` generated with `index.html`, `assets/`, `robots.txt`, `sitemap.xml`
- Warnings: duplicate `form.status` key, insights API import warning, chunk size > 500 kB

### 12.2 Django System Check

```bash
python manage.py check
```

**Result:** PASS  
- `System check identified no issues (0 silenced).`

### 12.3 Django Migrations Check

```bash
python manage.py makemigrations --check --dry-run
```

**Result:** PASS  
- `No changes detected`

### 12.4 Django Deploy Check

```bash
python manage.py check --deploy
```

**Result:** WARNINGS  
- 5 deployment warnings because local `DEBUG` is `True`.
- Warnings are about `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`.
- These settings are already conditional on `DEBUG=False` in `settings.py`, so they will activate once `DEBUG=False` is set in production.

---

## 13. Recommended Deployment Order

1. **Prepare backend code changes** (add `gunicorn`, `whitenoise`, `dj-database-url`, update `settings.py`, add `runtime.txt`, `Procfile`, `railway.toml`).
2. **Create Railway project** and add PostgreSQL service.
3. **Deploy backend service** from `backend/` root.
4. **Run migrations** in Railway shell: `python manage.py migrate`.
5. **Create superuser** in Railway shell: `python manage.py createsuperuser`.
6. **Seed initial data** if needed: `python manage.py seed_site_settings`, `python manage.py seed_navigation`, etc.
7. **Assign custom domain or note public URL** for backend.
8. **Prepare frontend** by setting `VITE_API_BASE_URL` to backend public URL.
9. **Deploy frontend service** from repository root.
10. **Verify public website** and CMS login.

---

## 14. GO / NO-GO Decision

**Decision: NO-GO for immediate deployment.**

The repository is **not ready** for Railway deployment as-is. Several required production files and dependencies are missing, and the backend settings do not yet handle Railway's standard `DATABASE_URL` or serve static files in production.

However, the codebase itself is healthy:
- Frontend builds successfully.
- Django system checks pass.
- Migrations are up-to-date.
- No secrets are committed.

With the required backend and frontend configuration changes listed in this report, the project will be ready for step-by-step Railway deployment.

---

## 15. Next Immediate Steps

1. Update `backend/requirements.txt` to add `gunicorn`, `whitenoise`, `dj-database-url`.
2. Add `backend/runtime.txt` with Python version.
3. Add `backend/Procfile` with Gunicorn start command.
4. Update `backend/config/settings.py` for `DATABASE_URL`, WhiteNoise, and Railway hosts.
5. Add frontend static server strategy (e.g., `serve`) and Railway config.
6. Re-run `npm run build` and `python manage.py check --deploy`.
7. Proceed to Railway deployment in the next session.
