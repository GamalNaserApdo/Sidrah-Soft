# SidrahSoft Production Auth / CSRF / Site-Settings Investigation Report

**Task ID:** SIDRAHSOFT-PRODUCTION-AUTH-CSRF-INVESTIGATION-006  
**Date:** 2026-07-22  
**Frontend URL:** https://frontend-production-5863.up.railway.app  
**Backend URL:** https://backend-production-23ed.up.railway.app

---

## 1. Root Cause of `/api/v1/auth/login/` 403

`POST /api/v1/auth/login/` is protected by Django's `csrf_protect`. The frontend `authApi.js` was calling `/api/v1/auth/csrf/` to set the CSRF cookie, then reading the token from `document.cookie`:

```js
const match = document.cookie.match(/csrftoken=([^;]+)/);
```

Because the frontend (`frontend-production-5863.up.railway.app`) and backend (`backend-production-23ed.up.railway.app`) are on different origins, the browser does **not** expose the backend's `csrftoken` cookie to `document.cookie` on the frontend. The login POST therefore was sent without a valid `X-CSRFToken` header, causing `csrf_protect` to reject it with `403 Forbidden`.

**Primary code path:**
- `src/services/authApi.js:getCsrfToken()` → `document.cookie` returns no `csrftoken`
- `src/services/authApi.js:authFetch()` → sends `POST` without `X-CSRFToken`
- `backend/apps/accounts/views.py:LoginView` with `@method_decorator(csrf_protect)` → `403 Forbidden`

---

## 2. Root Cause of `/api/v1/auth/me/` 403

`CurrentUserView` uses `IsCMSUser`. When the browser does not send the session cookie across origins, `request.user` is anonymous and `IsCMSUser.has_permission()` returns `False`. DRF then returns `403 Forbidden`.

The session cookie was not being sent because:
- `CSRF_COOKIE_SAMESITE` and `SESSION_COOKIE_SAMESITE` were hard-coded to `Lax` and not configurable.
- For cross-origin requests on Railway, `SameSite=None` (plus `Secure=True`) is required so the browser attaches the cookies.

Note: `403` is the correct DRF permission-denial status, and `AuthContext.jsx` already handles `401`/`403`/`0` gracefully. The frontend was not broken by the 403 itself; it simply never received an authenticated user.

---

## 3. Root Cause of `/api/v1/site-settings/` 404

The route is correct (`config/urls.py` includes `apps.site_settings.urls`). `SiteSettingsView.get()` calls `SiteSetting.get_current()`, which returns `None` when no `SiteSetting` record exists. The view returned `404 NOT_FOUND`.

This is a missing-data issue, not a routing issue. The frontend's `useSiteSettings` already falls back gracefully, but the 404 was still reported as a production symptom.

---

## 4. Files Inspected

### Backend

- `backend/config/settings.py`
- `backend/config/urls.py`
- `backend/apps/accounts/urls.py`
- `backend/apps/accounts/views.py`
- `backend/apps/accounts/serializers.py`
- `backend/apps/accounts/permissions.py`
- `backend/apps/accounts/models.py`
- `backend/apps/accounts/roles.py`
- `backend/apps/site_settings/urls.py`
- `backend/apps/site_settings/views.py`
- `backend/apps/site_settings/models.py`
- `backend/apps/site_settings/serializers.py`
- `backend/.env.example`

### Frontend

- `src/services/authApi.js`
- `src/services/apiClient.js`
- `src/services/cms/cmsFetch.js`
- `src/services/siteSettingsApi.js`
- `src/contexts/AuthContext.jsx`
- `src/components/leads/LeadsLoginPage.jsx`
- `src/hooks/useSiteSettings.js`
- `src/hooks/useHomepageConfig.js`

---

## 5. Files Changed

### Backend

1. `backend/config/settings.py`
   - `SESSION_COOKIE_SAMESITE` and `CSRF_COOKIE_SAMESITE` are now configurable via `DJANGO_SESSION_COOKIE_SAMESITE` / `DJANGO_CSRF_COOKIE_SAMESITE`.
   - Defaults remain `Lax` for local development and `None` for CSRF cookie to match production cross-origin needs.
   - `CSRF_COOKIE_HTTPONLY = False` retained so the token can still be read from the cookie if the cookie is ever shared.

2. `backend/apps/accounts/views.py`
   - `CSRFTokenView` now returns `{"csrfToken": "..."}` in JSON so the frontend does not need to read `document.cookie`.

3. `backend/apps/site_settings/views.py`
   - `SiteSettingsView` returns safe default serialized data (200) instead of `404` when no `SiteSetting` record exists.

4. `backend/.env.example`
   - Added `DJANGO_SESSION_COOKIE_SAMESITE` and `DJANGO_CSRF_COOKIE_SAMESITE` placeholders.

### Frontend

5. `src/services/authApi.js`
   - Replaced `document.cookie` CSRF lookup with a cached token fetched from `/api/v1/auth/csrf/` JSON response.
   - `fetchCsrf()` caches `csrfToken`.
   - Exported `getCsrfToken()` for reuse.

6. `src/services/cms/cmsFetch.js`
   - Imports `getCsrfToken` from `authApi.js` for unsafe CMS requests.

---

## 6. Environment Variables Required on Railway

| Variable | Recommended Production Value | Notes |
|---|---|---|
| `DJANGO_ALLOWED_HOSTS` | `backend-production-23ed.up.railway.app` | Or `*` for Railway; not a security-critical public API. |
| `DJANGO_CORS_ALLOWED_ORIGINS` | `https://frontend-production-5863.up.railway.app` | No trailing slash. |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | `https://frontend-production-5863.up.railway.app` | No trailing slash. |
| `DJANGO_SESSION_COOKIE_SAMESITE` | `None` | Required for cross-origin session cookie. |
| `DJANGO_CSRF_COOKIE_SAMESITE` | `None` | Required for cross-origin CSRF cookie. |
| `DJANGO_SECURE_SSL_REDIRECT` | `False` | Railway terminates HTTPS; internal healthchecks use HTTP. |
| `LEADS_DASHBOARD_BASE_URL` | `https://frontend-production-5863.up.railway.app/leads` | For email/notification links. |

`SESSION_COOKIE_SECURE=True` and `CSRF_COOKIE_SECURE=True` are enabled automatically when `DEBUG=False`.

---

## 7. Security Considerations

- `SameSite=None` is used only with `Secure=True` (HTTPS). This is the required combination for authenticated cross-origin requests.
- CORS allowed origins are restricted to the production frontend domain only; no wildcards.
- CSRF protection is preserved; `csrf_exempt` was not used.
- The CSRF token endpoint returns the token in JSON, but CORS prevents arbitrary origins from reading it because the frontend origin is in `CORS_ALLOWED_ORIGINS` and `Access-Control-Allow-Credentials` is `True`.
- The CSRF cookie remains `HttpOnly=False` so legacy cookie-reading behavior still works if the cookie is ever same-site.
- `SiteSettingsView` returning defaults does not expose secrets; all fields are safe or empty.

---

## 8. Focused Validation Results

### `python manage.py check`

```text
System check identified no issues (0 silenced).
```

**Result: PASS**

### `npm run build`

```text
✓ 161 modules transformed.
✓ built in 4.52s
```

**Result: PASS** (pre-existing non-blocking warnings only)

### Shell-based auth/site-settings checks

```text
--- 1. /api/v1/auth/csrf/ ---
status: 200
has csrfToken: True

--- 2. /api/v1/auth/login/ without CSRF token ---
status: 403

--- 3. /api/v1/auth/login/ with CSRF token ---
status: 200
has id: True

--- 4. /api/v1/auth/me/ after login ---
status: 200

--- 5. /api/v1/auth/me/ unauthenticated ---
status: 403

--- 6. /api/v1/site-settings/ (no record) ---
status: 200
has general: True
site_name: Sidrah Soft
```

**Result: PASS**

---

## 9. Deployment Steps

1. Commit the changed files:
   - `backend/config/settings.py`
   - `backend/apps/accounts/views.py`
   - `backend/apps/site_settings/views.py`
   - `backend/.env.example`
   - `backend/apps/accounts/tests_focused_auth.py`
   - `src/services/authApi.js`
   - `src/services/cms/cmsFetch.js`
2. Set the Railway backend environment variables listed in section 7.
3. Rebuild and redeploy the backend.
4. Rebuild the frontend with `VITE_API_BASE_URL=https://backend-production-23ed.up.railway.app` and redeploy.
5. Run `python manage.py migrate` and `python manage.py collectstatic` as usual.

---

## 10. Remaining Manual Browser Checks

After deployment, verify in the browser:

1. Open `https://frontend-production-5863.up.railway.app/leads/login`.
2. In DevTools Network, confirm the login flow:
   - `GET /api/v1/auth/csrf/` → 200 with `csrfToken` in JSON.
   - `POST /api/v1/auth/login/` → 200 and response contains user `id`.
   - `GET /api/v1/auth/me/` → 200 for the logged-in user.
   - `GET /api/v1/site-settings/` → 200 (default values if not configured).
3. Confirm cookies are set with `Secure` and `SameSite=None`.
4. Confirm no `403` on valid login.
5. Confirm logout works and `/auth/me/` returns `403` afterwards.

---

## 11. Status

**Status: PASS**

The login 403, `auth/me` 403, and site-settings 404 issues have been root-caused and fixed. CSRF and session cross-origin cookie handling are now configurable and the frontend uses a JSON CSRF token flow. The site-settings endpoint returns safe defaults when no record exists. No full test suite was run; only focused lightweight checks were executed.
