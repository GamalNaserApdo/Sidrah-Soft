# SIDRAHSOFT-PRODUCTION-READINESS-SECURITY-AUDIT-001-REPORT

**Task ID:** `SIDRAHSOFT-PRODUCTION-READINESS-SECURITY-AUDIT-001`  
**Date:** 2026-08-19  
**Repository root:** `F:\What_i_Made\New\sidrah_web`  
**Production verdict:** **NOT READY FOR PRODUCTION**

---

## 0. Executive Summary

The application is functionally feature-complete but is **NOT ready for production**. The current `main` branch (latest commit `571cc61`) contains several P0 blockers that must be resolved before deployment:

- `DEBUG=True` is active in the local environment, preventing the production security hardening block from running.
- The most recent push (`29a2e87`) accidentally committed and pushed local-only, generated, and experimental files: SQLite databases, a directory called `newstyle/`, a stray file named `truction]`, `hero-progress-*.png`, and 46 uploaded media assets under `backend/media/uploads/`.
- `npm audit` reports 6 high-severity vulnerabilities in `react-router-dom`/`react-router` and `postcss`.
- Core production environment variables (`SECRET_KEY`, `ALLOWED_HOSTS`, `DATABASE_URL`, `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS`, `VITE_API_BASE_URL`) are not present in the tracked source; they must be configured in Railway and never committed.
- No production-grade media storage (S3/R2) is configured; `MEDIA_URL` is only served in `DEBUG=True`.
- Django admin is exposed at the default `/admin/` path.

This report is strictly an audit. No code, configuration, or repository changes were made.

---

## A. Repository Hygiene

**Working tree status:** `nothing to commit, working tree clean`  
**Current commit:** `571cc61 (HEAD -> main, origin/main) chore: trigger Railway deployment`  
**Tracked files:** 1913  
**Ignored but present:** `__pycache__`, `dist/`, `node_modules/`, `backend/venv/`, `.env`, `backend/.env`, `project-memory/evidence/*.log`, `project-memory/logs/`

### Files that should not be in the repository

| Count | Pattern | Risk |
|---|---|---|
| 2 | `db_check.sqlite3`, `db_test.sqlite3` | Local SQLite databases with data/schema committed to `main`. |
| 1 | `truction]` | Stray/typo file. |
| 2 | `newstyle/index.html`, `newstyle/styles.css` | Old experiment/local-only directory. |
| 3 | `hero-progress-*.png` | Temporary/local validation screenshots in repository root. |
| 46 | `backend/media/uploads/...` | User-uploaded CMS media files. These should be on object storage, not in Git. |
| 154 | `backend/staticfiles/...` | `collectstatic` output (DRF/WhiteNoise static artifacts). Regenerated on deploy; should not be tracked. |
| 16 | `project-memory/evidence/*.png` | Validation/evidence screenshots. 4 of these were added by the most recent Arabic hero commit. |
| 2 | `src/assets/hero/clips/screenshots/...` | Large hero clip frame sequences (multiple PNGs per clip). Bloat repo and build. |

### Status classification

| PATH | CURRENT STATUS | RECOMMENDATION | TRACKED? | SAFE TO DELETE FROM REPO? |
|---|---|---|---|---|
| `db_check.sqlite3`, `db_test.sqlite3` | tracked | `git rm --cached` and add to `.gitignore` | YES | YES (after local backup if needed) |
| `truction]` | tracked | delete and add to `.gitignore` | YES | YES |
| `newstyle/` | tracked | delete and add to `.gitignore` | YES | YES |
| `hero-progress-*.png` | tracked | delete and add to `.gitignore` | YES | YES |
| `backend/media/uploads/` | tracked | move to external storage; `git rm --cached` | YES | YES (do not delete from S3/R2) |
| `backend/staticfiles/` | tracked | `git rm --cached`; `.gitignore` already covers it | YES | YES (regenerated) |
| `project-memory/evidence/*.png` | tracked | keep if evidence is required; otherwise delete | YES | REVIEW |
| `src/assets/hero/clips/screenshots/...` | tracked | move to CDN or compress | YES | NO (replace externally) |

**Note:** `.gitignore` already has `backend/media/`, `backend/staticfiles/`, `*.pyc`, `.env`, `dist/`, `node_modules/`, `__pycache__/`, `*.log`, etc. These rules protect new files, but **already-tracked files bypass `.gitignore`**. The cleanup implementation must use `git rm --cached`, not just `.gitignore`.

---

## B. .gitignore Audit

The root `.gitignore` is generally adequate for a clean project:

- `.env`, `.env.*` with `!.env.example` exception
- `*.pem`, `*.key`, `credentials.json`, `secrets.*`
- `__pycache__/`, `*.pyc`, `venv/`, `.venv/`, `env/`
- `db.sqlite3`, `db.sqlite3-journal`
- `node_modules/`, `dist/`, `build/`, `.vite/`
- `*.log`, `tmp/`, `temp/`, `coverage/`, `playwright-report/`, `test-results/`, `screenshots/`
- IDE/OS artifacts

**Gaps:**
- `db_*.sqlite3` is not specifically covered; only `db.sqlite3` is.
- `truction]` and `newstyle/` have no pattern (should be deleted rather than ignored).
- `hero-progress-*.png` in the repository root is not covered.

---

## C. Full Secret Audit

### Working-tree findings

| Finding | Severity | Where | Notes |
|---|---|---|---|
| `SECRET_KEY` loaded from env only | OK | `backend/config/settings.py` | No hardcoded value or fallback. |
| `DATABASE_URL`, `DB_PASSWORD` from env | OK | `backend/config/settings.py` | No hardcoded production credentials. |
| `EMAIL_HOST_PASSWORD` from env | OK | `backend/config/settings.py` | Placeholder only in `.env.example`. |
| Test-only passwords in test files | LOW | `backend/apps/*/tests*.py` | `testpass123`, `StrongPass123!` are used only in unit tests. |
| Local DB password in evidence reports | CRITICAL (local) | `project-memory/evidence/NAVIGATION-CMS-IMPLEMENTATION-001-REPORT.md`, `project-memory/evidence/POSTGRES-FINAL-BLOCKER-ANALYSIS-001.md` | `DB_PASSWORD=[redacted]` appears in committed reports. |

**No production secrets (API keys, bearer tokens, session cookies, CSRF tokens, live SMTP credentials, GitHub/Railway tokens) were found in the current working tree.**

### Historical secret exposure

`git log --all --oneline -S 'Postgres1234'` identified commit `20986d8` (Initial production-ready SidrahSoft website) as the commit where the local PostgreSQL password was introduced into the evidence reports. The value is for local development only, but it is now in Git history and on `origin/main`.

**Recommendation:**
- If `Postgres1234` was ever used for production or any non-throwaway environment, rotate it immediately.
- If it was only used for the original local `sidrahsoft_db`, delete the reports or redact the line in a future cleanup task and consider a `git filter-repo` or `git filter-branch` pass if the repository becomes public.

---

## D. Frontend Production Audit

### Build result

`npm run build` completed successfully in `7.87s`.

**Warnings:**
- Chunk `index-CZmWAvYH.js` is `533.06 kB` / `171.85 kB` gzipped, larger than 500 kB.
- Recommendation: code-split with dynamic `import()` or `manualChunks`.

### Configuration

- `vite.config.js` is minimal and correct for a Vite SPA.
- `src/services/apiClient.js` throws in production if `import.meta.env.VITE_API_BASE_URL` is not set. This is safe (prevents builds with a missing backend origin).
- No hardcoded `localhost` in the production bundle source; the fallback `http://localhost:8002` is only used when `VITE_API_BASE_URL` is not set.
- `console.error` calls remain in several data hooks (`useHomepageConfig`, `useInquiryTypes`, `useInsights`, etc.). These are safe but should be removed or converted to a proper error-reporting service before launch.

### Dependency audit

`npm audit` returned **6 high-severity vulnerabilities**:

- `postcss` — source map path-traversal issues (GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849)
- `react-router` / `react-router-dom` — XSS, open redirect, CSRF, and DoS advisories (multiple GHSA IDs up to 7.17.0)

The installed versions are `react-router-dom ^7.6.0` and `react-router` as resolved by `package-lock.json`. These must be patched, pinned, or mitigated before public launch.

---

## E. Backend Production Settings

### `settings.py` assessment

| Setting | Current Value | Production OK? | Notes |
|---|---|---|---|
| `SECRET_KEY` | `env_prefixed('SECRET_KEY')` | YES (if env set) | No hardcoded fallback. |
| `DEBUG` | `env_bool('DEBUG', default='False')` | CONDITIONAL | Current local `.env` has `DEBUG=True`; production MUST set `DJANGO_DEBUG=False`. |
| `ALLOWED_HOSTS` | `env_list('DJANGO_ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])` | NO | Defaults are unsafe for production. Must set `DJANGO_ALLOWED_HOSTS` to production domains. |
| `CORS_ALLOWED_ORIGINS` | `env_list(..., default=['http://localhost:5174', ...])` | NO | Must set `DJANGO_CORS_ALLOWED_ORIGINS` to the Railway frontend domain(s). |
| `CSRF_TRUSTED_ORIGINS` | `env_list(..., default=['http://localhost:5174', ...])` | NO | Must set `DJANGO_CSRF_TRUSTED_ORIGINS` to the Railway frontend domain(s). |
| `DATABASES` | PostgreSQL block; `DATABASE_URL` overrides | CONDITIONAL | Local fallback values are fine only for dev; production must use `DATABASE_URL`. |
| `STATIC_ROOT` | `BASE_DIR / 'staticfiles'` | YES | WhiteNoise serves from this. |
| `MEDIA_ROOT` / `MEDIA_URL` | `BASE_DIR / 'media'`, `/media/` | NO | No object storage; `MEDIA_URL` only served when `DEBUG=True`. |
| `SESSION_COOKIE_HTTPONLY` | `True` | YES |  |
| `SESSION_COOKIE_AGE` | `28800` (8h) | YES |  |
| `SESSION_COOKIE_SAMESITE` | `None` when `DEBUG=False` | YES | Required for cross-origin Railway. |
| `SESSION_COOKIE_SECURE` | `True` when `DEBUG=False` | YES |  |
| `CSRF_COOKIE_HTTPONLY` | `False` | YES (required) | JS needs to read CSRF token. |
| `CSRF_COOKIE_SAMESITE` | `None` when `DEBUG=False` | YES |  |
| `CSRF_COOKIE_SECURE` | `True` when `DEBUG=False` | YES |  |
| `SECURE_SSL_REDIRECT` | `env_bool('SECURE_SSL_REDIRECT', default='True')` | CONDITIONAL | Must be `False` on Railway because Railway healthchecks reach the container over HTTP. |
| `SECURE_PROXY_SSL_HEADER` | `('HTTP_X_FORWARDED_PROTO', 'https')` when `DEBUG=False` | YES |  |
| `SECURE_HSTS_SECONDS` | `31536000` when `DEBUG=False` | YES |  |
| `X_FRAME_OPTIONS` | `DENY` | YES |  |
| `SECURE_CONTENT_TYPE_NOSNIFF` | `True` | YES |  |
| `DEFAULT_FROM_EMAIL` | `Sidrah Soft <sidrahsoft@gmail.com>` | NO | Hardcoded; should be configurable. |
| `CONTACT_NOTIFICATION_EMAIL` | from env | OK | Defaults to `sidrahsoft@gmail.com`. |
| `LEADS_DASHBOARD_BASE_URL` | from env | OK | Defaults to `http://localhost:5174`; must be set in production. |

### `python manage.py check` result

- `System check identified no issues (0 silenced).` — PASS

### `python manage.py check --deploy` result

With the current local environment, `DEBUG=True` is detected:

- `security.W004` — `SECURE_HSTS_SECONDS` not set
- `security.W008` — `SECURE_SSL_REDIRECT` not set to `True`
- `security.W012` — `SESSION_COOKIE_SECURE` not set to `True`
- `security.W016` — `CSRF_COOKIE_SECURE` not set to `True`
- `security.W018` — `DEBUG` is `True`

These warnings will disappear when `DJANGO_DEBUG=False` and the relevant env values are provided because the settings file only enables the HSTS/SSL/Cookie-Secure block inside `if not DEBUG:`. This is the intended design, but it means **the security hardening is not active right now**.

---

## F. Authentication / Session / CSRF

- `/api/v1/auth/csrf/` is `AllowAny` and returns a CSRF token — correct.
- `/api/v1/auth/login/` is `AllowAny` with `@csrf_protect` and `ScopedRateThrottle` (`cms_login` scope) — correct.
- `/api/v1/auth/logout/` uses `django.contrib.auth.logout` — correct.
- `/api/v1/auth/me/` requires `IsAuthenticated` — correct.
- Login rejects non-CMS users and inactive users — correct.
- Session rotation on login is performed by Django's `login()` — correct.
- The `IsCMSUser` permission is enforced on all CMS endpoints — correct.
- `HasModulePermission` and `HasCapability` enforce fine-grained module/action authorization — correct.

**P2 observation:** `REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES']` is `AllowAny`. All CMS views explicitly set `permission_classes`, but any future view that forgets to do so would be public by default. Recommend switching the default to `IsAuthenticated` or `IsCMSUser` and explicitly opening only public views.

---

## G. CMS Security

Every CMS endpoint inspected requires `IsAuthenticated`, `IsCMSUser`, and `HasModulePermission`. The `CMSViewMixin` and `CMSModulePermissionMixin` correctly enforce this for `list`, `retrieve`, `create`, `update`, `partial_update`, `destroy`, and `delete`.

No `AllowAny`, `permission_classes = []`, or missing `permission_classes` were found in CMS `cms_views.py` files.

Activity logging is wired into create/update/destroy via `log_content_action` and `sanitize_metadata` redacts `password`, `token`, `secret`, `csrf`, `session`, `cookie`, `authorization`, etc. — PASS.

---

## H. Leads / Contact Security

- `InquiryTypeListView` is public (`AllowAny`) and throttled by `AnonRateThrottle` — correct; only active inquiry types are returned.
- `ContactSubmissionCreateView` is public (`AllowAny`) and throttled to `5/m` (`contact_submission`) — correct.
- CMS contact views require `IsAuthenticated + IsCMSUser + HasModulePermission`.
- Public users cannot list or retrieve contact/lead submissions.
- `ContactSubmissionCreateView` captures `ip_address` and `user_agent` but truncates to 1000 chars.

---

## I. Training & Education Security

- `ProgramListView` and `ProgramDetailView` are `AllowAny` and return only `STATUS_ACTIVE` programs — correct.
- `training/cms_views.py` requires `IsAuthenticated`, `IsCMSUser`, `HasModulePermission` for all CRUD — correct.
- `Program` model has `status`, `branch`, `display_order`, and draft/archive logic — correct.

---

## J. File Upload / Media Security

### Upload validation

`backend/apps/media_library/validators.py` is strong:

- Whitelist: `jpg`, `jpeg`, `png`, `webp`, `gif`
- Rejects double extensions (e.g., `file.jpg.exe`)
- Maximum file size 5 MB
- Maximum dimension 4000 px
- 40 megapixel decompression-bomb protection
- Pillow `verify()` and `load()` integrity checks
- Rejects SVG explicitly
- Cross-checks extension MIME against detected MIME

### Upload authorization

- `CMSMediaListCreateView` and `CMSMediaDetailView` require `IsAuthenticated`, `IsCMSUser`, `HasModulePermission`.
- Delete is blocked if the asset is referenced elsewhere.

### Production media storage gap

- `MEDIA_URL` is only served when `DEBUG=True` (`config/urls.py` line 30-32).
- No S3/Cloudflare R2/`django-storages` backend is configured.
- 46 uploaded media files are committed to the repo under `backend/media/uploads/`, which will bloat deployments.

**P0:** Uploaded files are not accessible in production without a real object storage strategy and a corresponding `MEDIA_URL` serve path.

---

## K. API Security

### Public APIs (AllowAny)

- `/api/v1/site-settings/`
- `/api/v1/navigation/`
- `/api/v1/partners/`
- `/api/v1/services/`
- `/api/v1/case-studies/`
- `/api/v1/insights/`
- `/api/v1/jobs/`
- `/api/v1/contact/` (inquiry types and submission create)
- `/api/v1/homepage/`
- `/api/v1/training/programs/`
- `/api/v1/auth/csrf/`
- `/api/v1/health/`
- `robots.txt` and `sitemap.xml`

### Protected CMS APIs

All `/api/v1/cms/...` and `/api/v1/admin/...` routes require `IsAuthenticated`, `IsCMSUser`, and `HasModulePermission`. No inconsistent protection was found.

---

## L. Rate Limiting / Abuse

```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'contact_submission': '5/m',
        'cms_login': '5/m',
    },
}
```

- `AnonRateThrottle` at `100/hour` is modest and may be reached by legitimate users if the public site makes more than 100 unauthenticated API calls per hour per IP. Consider `UserRateThrottle` for logged-in users and a separate `burst` rate.
- `contact_submission` at `5/m` is reasonable for a single form.
- `cms_login` at `5/m` is reasonable but should be combined with account lockout or captcha for stronger brute-force protection.

No `UserRateThrottle` is configured; logged-in CMS users are not rate-limited beyond `AnonRateThrottle` (they are not anonymous, so `ScopedRateThrottle` only applies to their scopes). This is acceptable for launch but a hardening target.

---

## M. Database Production Safety

- `settings.py` uses `dj_database_url.parse(database_url, conn_max_age=600, ssl_require=False)` when `DATABASE_URL` is set.
- When `DATABASE_URL` is not set, it falls back to local `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`.
- `ssl_require=False` means the connection does not enforce TLS. For Railway, the connection string usually contains `sslmode=require`; the final TLS posture depends on the provided `DATABASE_URL`.

**P1:** Verify the production `DATABASE_URL` contains `sslmode=require` or set `ssl_require=True` if Railway forces TLS.

**Database user privileges:** The repository does not manage PostgreSQL users. The production DB user should have `CREATE`, `READ`, `WRITE`, and `EXECUTE` on the application database but **not** `SUPERUSER` or `CREATEDB`.

---

## N. Django Admin

The Django admin is mounted at `admin/` in `config/urls.py`.

- Path is the default `/admin/`.
- It uses Django's default admin templates and authentication.
- There is no brute-force protection beyond the `cms_login` scoped throttling, which does not apply to the Django admin login form.

**P1:** For a production CMS, either (a) change the admin URL to an unguessable path, (b) restrict `/admin/` by IP/network, or (c) disable Django admin in production if the React CMS is the only management surface.

---

## O. Dependency / Supply-Chain Audit

### Python

`requirements.txt` uses lower-bound versions:

```
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

**P1:** Pin exact versions and update `requirements.txt` to match the resolved lock (or use `poetry.lock` / `pip-tools`) to avoid supply-chain drift. The currently installed versions are:

- `Django 5.2.16`
- `djangorestframework 3.17.1`
- `django-cors-headers 4.9.0`
- `Pillow 12.3.0`
- `psycopg 3.3.4`
- `gunicorn 26.0.0`
- `whitenoise 6.12.0`
- `dj-database-url 3.1.2`

### JavaScript

`package.json` uses caret ranges. `package-lock.json` locks the actual tree.

**P0:** `react-router` and `react-router-dom` have 6 high-severity advisories (XSS, open redirect, CSRF, DoS). Upgrade to a patched version and re-run `npm audit` before launch.

---

## P. Security Headers

Django provides the following when `DEBUG=False`:

- `SECURE_BROWSER_XSS_FILTER = True`
- `SECURE_CONTENT_TYPE_NOSNIFF = True`
- `X_FRAME_OPTIONS = 'DENY'`
- HSTS with `31536000` seconds, include subdomains, preload
- HTTPS redirects (if `SECURE_SSL_REDIRECT` is enabled and appropriate)

**Missing:**
- `Content-Security-Policy` is not configured.
- `Referrer-Policy` is not configured (Django default `same-origin` is used).
- `Permissions-Policy` is not configured.

**P2:** Add a staged CSP after launch. Start with `Content-Security-Policy-Report-Only`, then enforce.

---

## Q. Error Handling / Information Disclosure

- `DEBUG=True` would expose Django debug pages, stack traces, and SQL in production. **P0:** must be `False`.
- `DEFAULT_PERMISSION_CLASSES = [AllowAny]` could accidentally expose data if a view misses permissions.
- `MediaValidationError` and API views return safe, non-verbose error messages.
- No `DEBUG_PROPAGATE_EXCEPTIONS` or similar debug flags found.

---

## R. Logging / Privacy

- `apps/activity_logs/services.py` explicitly redacts sensitive keys before logging.
- Gunicorn logs are configured in `start.sh` to `stdout`/`stderr`.
- No custom middleware or signal logs raw request bodies.

**P2:** Ensure Railway log retention and PII handling policies align; avoid logging full request bodies in production.

---

## S. Production Data / Seeding

The `start.sh` deployment script runs:

1. `python manage.py migrate --noinput`
2. `python manage.py seed_inquiry_types`
3. `python manage.py collectstatic --noinput`

**Migrations are in the repository and will run automatically on deploy.** This is correct.

### Data still required for launch

| Data | Required? | Status |
|---|---|---|
| `SiteSetting` (logo, contact info, social links) | YES | Must be created in CMS or shell after first deploy. |
| `HomepageSection` ordering | YES | Must be configured in CMS. |
| `Navigation` (header/footer/mobile/legal) | YES | Must be configured in CMS. |
| `InquiryType` records | YES | Auto-seeded by `seed_inquiry_types` command. |
| `Training Program` content | NO for launch | Real content can be added post-launch; empty state is graceful. |
| CMS users | YES | Must be created with `createsuperuser` and assigned roles. |
| `MediaAsset` uploads | NO for launch | Not required for the first deployment. |

---

## T. Migration Safety

`python manage.py showmigrations` shows all migrations applied locally:

- `accounts 0001-0002`
- `activity_logs 0001-0002`
- `admin`, `auth`, `contenttypes`, `sessions`
- `careers`, `case_studies`, `contact`, `core`, `homepage`, `insights`, `media_library`, `navigation`, `partners`, `services`, `site_settings`
- `training 0001`

No unapplied migrations found. `start.sh` runs `migrate` on every deploy, which is the correct Railway pattern.

---

## U. Railway Configuration Review

### Backend

`backend/railway.toml`:

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

- Build root must be `backend/` in Railway, or `rootDirectory` must point to `backend/`.
- `start.sh` runs migrations, seeds, collects static, and starts Gunicorn.

**P1:** `backend/` needs a `Dockerfile` or `nixpacks` detection of `requirements.txt`. The `start.sh` is not executable on Windows-style clones; ensure `chmod +x` or use `bash start.sh`.

### Frontend

No `railway.toml` in the repository root. The `package.json` start script is:

```json
"start": "serve --single --listen ${PORT:-3000} dist"
```

Railway frontend service should be configured manually:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start`
- **Root directory:** repository root
- **Environment:** `VITE_API_BASE_URL=https://<backend-railway-domain>`

**P0:** `VITE_API_BASE_URL` must be set in Railway or the build will fail.

### PostgreSQL

- Provision a Railway PostgreSQL service.
- Copy the `DATABASE_URL` into the backend service environment.
- Verify the application DB user is not a superuser.
- Enable backups in Railway.

---

## V. Backup / Recovery

| Requirement | Current | Status |
|---|---|---|
| PostgreSQL backups | Must be enabled in Railway manually | MISSING |
| Media backup strategy | Not defined (needs object storage) | MISSING |
| Rollback via Git | `main` branch has checkpoints | OK (but `571cc61` and `29a2e87` contain junk) |
| Known-good commit | `06533c2` (before `git add .` mishap) | OK — use as rollback if needed |
| Deployment rollback | Railway history | OK |

---

## W. Production Launch Checklist

### P0 — MUST FIX BEFORE PRODUCTION

| ID | Area | Finding | Recommended Action | Code Change | Railway Change | DB Change |
|---|---|---|---|---|---|---|
| P0-01 | Settings | `DEBUG=True` in local env; production security block inactive | Set `DJANGO_DEBUG=False` in Railway | NO | YES | NO |
| P0-02 | Secrets | `SECRET_KEY` must be set in production | Generate a 60+ char random string and set `DJANGO_SECRET_KEY` | NO | YES | NO |
| P0-03 | Settings | `ALLOWED_HOSTS` defaults to `localhost` | Set `DJANGO_ALLOWED_HOSTS` to backend domain | NO | YES | NO |
| P0-04 | CORS | `CORS_ALLOWED_ORIGINS` defaults to `localhost:5174` | Set `DJANGO_CORS_ALLOWED_ORIGINS` to frontend domain(s) | NO | YES | NO |
| P0-05 | CSRF | `CSRF_TRUSTED_ORIGINS` defaults to `localhost:5174` | Set `DJANGO_CSRF_TRUSTED_ORIGINS` to frontend domain(s) | NO | YES | NO |
| P0-06 | Database | `DATABASE_URL` not set locally; production needs Railway Postgres | Set `DATABASE_URL` from Railway Postgres service | NO | YES | NO |
| P0-07 | Frontend | `VITE_API_BASE_URL` must be set for build | Set `VITE_API_BASE_URL=https://<backend-domain>` | NO | YES | NO |
| P0-08 | Repo hygiene | `db_check.sqlite3` and `db_test.sqlite3` committed | `git rm --cached` and add `db_*.sqlite3` to `.gitignore` | YES | NO | NO |
| P0-09 | Repo hygiene | `truction]` committed | Delete and `git rm --cached` | YES | NO | NO |
| P0-10 | Repo hygiene | `newstyle/` and `hero-progress-*.png` committed | Delete and `git rm --cached` | YES | NO | NO |
| P0-11 | Repo hygiene | 46 user-uploaded files under `backend/media/uploads/` committed | Move to object storage; `git rm --cached` | YES | NO | NO |
| P0-12 | Media | No production media storage; `MEDIA_URL` not served in `DEBUG=False` | Add `django-storages` + S3/R2 or Cloudflare R2; configure `DEFAULT_FILE_STORAGE` | YES | YES | NO |
| P0-13 | Dependencies | 6 high-severity `npm audit` issues (react-router, postcss) | Upgrade and re-pin `react-router-dom` and `postcss` / run `npm audit fix` | YES | NO | NO |

### P1 — SHOULD FIX BEFORE PRODUCTION

| ID | Area | Finding | Recommended Action | Code Change | Railway Change | DB Change |
|---|---|---|---|---|---|---|
| P1-01 | Settings | `SECURE_SSL_REDIRECT` default `True` will break Railway HTTP healthchecks | Set `DJANGO_SECURE_SSL_REDIRECT=False` in Railway; handle HTTPS at edge | NO | YES | NO |
| P1-02 | `.env.example` | `DJANGO_SECURE_SSL_REDIRECT=True` contradicts the Railway comment | Update `.env.example` and documentation to `False` for Railway | YES | NO | NO |
| P1-03 | Repo hygiene | `backend/staticfiles/` (154 files) committed | `git rm --cached`; `collectstatic` regenerates | YES | NO | NO |
| P1-04 | Repo hygiene | 16 evidence PNGs committed (4 from latest commit) | Decide if evidence should be in repo; otherwise delete | YES | NO | NO |
| P1-05 | Admin | Django admin at default `/admin/` path | Change `admin/` to an unguessable path or restrict by IP | YES | YES | NO |
| P1-06 | Permissions | `DEFAULT_PERMISSION_CLASSES = [AllowAny]` is risky | Set default to `IsAuthenticated` or `IsCMSUser`; explicitly open public views | YES | NO | NO |
| P1-07 | Settings | `DEFAULT_FROM_EMAIL` hardcoded to `sidrahsoft@gmail.com` | Move to `DEFAULT_FROM_EMAIL` env variable | YES | YES | NO |
| P1-08 | Settings | `LEADS_DASHBOARD_BASE_URL` defaults to `http://localhost:5174` | Set in Railway env | NO | YES | NO |
| P1-09 | Settings | `EMAIL_BACKEND` defaults to `console` | Set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` and SMTP envs in Railway | NO | YES | NO |
| P1-10 | Dependencies | `requirements.txt` and `package.json` use unpinned ranges | Pin versions / regenerate lock files | YES | NO | NO |
| P1-11 | Database | `ssl_require=False` in `dj_database_url.parse` | Confirm `DATABASE_URL` contains `sslmode=require` or set `ssl_require=True` | YES | NO | NO |
| P1-12 | Media | `backend/media/uploads/` still in `MEDIA_ROOT` after cleanup | Use a separate object-storage bucket; never store user uploads in Git | YES | YES | NO |

### P2 — HARDENING / FOLLOW-UP

| ID | Area | Finding | Recommended Action | Code Change | Railway Change | DB Change |
|---|---|---|---|---|---|---|
| P2-01 | Frontend | `index.js` chunk is 533 kB | Code-split with `React.lazy` and `manualChunks` | YES | NO | NO |
| P2-02 | Frontend | `console.error` in data hooks | Remove or route to Sentry/Logrocket | YES | NO | NO |
| P2-03 | Middleware | `CommonMiddleware` and `CorsMiddleware` appear twice | Remove duplicates | YES | NO | NO |
| P2-04 | Security | No CSP configured | Deploy `Content-Security-Policy-Report-Only` first, then enforce | YES | NO | NO |
| P2-05 | Security | No explicit `Referrer-Policy` | Add `django.middleware.security.SecurityMiddleware` settings or headers | YES | NO | NO |
| P2-06 | Rate limits | No `UserRateThrottle` for logged-in CMS users | Add scoped `UserRateThrottle` for CMS mutations | YES | NO | NO |
| P2-07 | Admin | No brute-force/lockout on Django admin login | Restrict admin access or enable 2FA/monitoring | YES | YES | NO |
| P2-08 | Repo hygiene | Large `src/assets/hero` clip frame sequences | Move to CDN or compress to video/WebP | YES | NO | NO |
| P2-09 | Secrets history | `DB_PASSWORD=[redacted]` in evidence reports | Redact or delete those report lines; consider `git filter-repo` if repo becomes public | YES | NO | NO |
| P2-10 | Monitoring | No centralized error/performance monitoring | Add Sentry, healthchecks, log drains | YES | YES | NO |

---

## X. File Cleanup Plan

| PATH | CURRENT STATUS | WHY IT EXISTS | PRODUCTION NEEDED? | RECOMMENDATION | SAFE TO DELETE FROM REPO? | TRACKED BY GIT? |
|---|---|---|---|---|---|---|
| `db_check.sqlite3` | tracked | local validation SQLite | NO | `git rm --cached` + `.gitignore` | YES | YES |
| `db_test.sqlite3` | tracked | local test SQLite | NO | `git rm --cached` + `.gitignore` | YES | YES |
| `truction]` | tracked | stray file | NO | `git rm --cached` and delete | YES | YES |
| `newstyle/index.html` | tracked | old experiment | NO | `git rm --cached` and delete | YES | YES |
| `newstyle/styles.css` | tracked | old experiment | NO | `git rm --cached` and delete | YES | YES |
| `hero-progress-*.png` (3) | tracked | temp validation screenshots | NO | `git rm --cached` and delete | YES | YES |
| `backend/media/uploads/` (46) | tracked | user uploads | NO | migrate to object storage; `git rm --cached` | YES (not from storage) | YES |
| `backend/staticfiles/` (154) | tracked | `collectstatic` output | NO | `git rm --cached` | YES (regenerated) | YES |
| `project-memory/evidence/*.png` (16) | tracked | validation screenshots | REVIEW | keep if required; otherwise delete | YES if not needed | YES |
| `src/assets/hero/clips/screenshots/...` | tracked | hero animation frames | NO (move externally) | move to CDN or video | NO (replace externally) | YES |
| `DNA/` | deleted from working tree, not in HEAD | old documentation | NO | already removed from `main` by `29a2e87` | — | NO |

---

## Y. Historical Secret Findings

- `DB_PASSWORD=[redacted]` appears in `project-memory/evidence/NAVIGATION-CMS-IMPLEMENTATION-001-REPORT.md` and `project-memory/evidence/POSTGRES-FINAL-BLOCKER-ANALYSIS-001.md`, introduced in commit `20986d8`.
- Test-only passwords (`testpass123`, `StrongPass123!`) are present in test files.
- No production API keys, live tokens, session cookies, or CSRF secrets were found in the working tree.

**Recommendation:** If the local PostgreSQL password in the evidence reports is the same as the current or any past production password, rotate immediately. Otherwise, the historical exposure is a low risk because the password is local-only, but it should still be redacted in future cleanup.

---

## Z. Final Production Verdict

**NOT READY FOR PRODUCTION**

The repository has strong architecture (RBAC, activity logging, media validation, cross-origin session handling, RTL) but contains P0 blockers that must be resolved before a production Railway deployment:

1. Set `DJANGO_DEBUG=False` and all production environment variables in Railway.
2. Remove the accidentally committed local files, SQLite databases, and user-uploaded media.
3. Configure object storage for user media and a production `MEDIA_URL`.
4. Patch `react-router-dom` / `postcss` high-severity vulnerabilities.
5. Review and restrict Django admin exposure.

After these are addressed, the project can be classified as **READY AFTER P0 FIXES**.

---

**No files were modified, deleted, committed, pushed, or migrated during this audit.**

**Recommended NEXT TASK ID:** `SIDRAHSOFT-PRODUCTION-HARDENING-IMPLEMENTATION-001`
