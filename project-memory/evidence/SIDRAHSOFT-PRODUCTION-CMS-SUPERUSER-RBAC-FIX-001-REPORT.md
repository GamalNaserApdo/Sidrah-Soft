# Production CMS Superuser / RBAC Investigation Report

**Task ID:** `SIDRAHSOFT-PRODUCTION-CMS-SUPERUSER-RBAC-FIX-001`  
**Status:** PASS  
**Scope:** Production CMS authorization after successful login

## Exact Root Cause

The permission message was produced by the first protected CMS request after login:

```text
GET /api/v1/cms/dashboard/
```

`CMSDashboardPage` fetches this endpoint as soon as `/cms` is rendered. Its error handler maps every HTTP 403 response to:

```text
You do not have permission to perform this action.
```

This was not an RBAC policy failure for a Django superuser. The audited backend RBAC implementation already grants a superuser complete access:

- `IsCMSUser` returns `True` for an active authenticated user with `is_superuser=True`.
- `HasModulePermission` returns `True` for an active authenticated user with `is_superuser=True`.
- `get_user_modules()` returns all 12 CMS modules for a superuser.
- `get_user_capabilities()` returns all 96 module/action capability combinations for a superuser.
- `CMSUserSerializer` includes `is_superuser`, `is_staff`, `role`, `permitted_modules`, and `capabilities`.
- The frontend `AuthContext`, `ProtectedRoute`, CMS sidebar, and page-level capability checks explicitly treat `user.is_superuser` as fully authorized.

The actual fault was the cross-origin production session-cookie default. The Railway frontend and backend run on different origins. The backend defaulted `SESSION_COOKIE_SAMESITE` to `Lax`; browsers do not send a Lax session cookie on the fetch request from the frontend origin to the backend origin. Therefore, the dashboard request was anonymous and returned 403 before RBAC could recognize the superuser.

The login response itself still succeeds because the login endpoint authenticates the supplied credentials and returns user data directly. That response lets the frontend enter `/cms`, but the next request requires the persisted session cookie.

## Exact Failing Endpoint

**Endpoint:** `GET /api/v1/cms/dashboard/`

**Call path:**

1. `CMSDashboardPage` mounts at `/cms`.
2. `fetchDashboard()` requests `/api/v1/cms/dashboard/`.
3. `cmsFetch()` receives a 403 and creates an API error.
4. `parseApiError()` renders `You do not have permission to perform this action.`

The browser needs a cross-origin session cookie for this request to be authenticated.

## Files Changed

- `backend/config/settings.py`
- `backend/.env.example`

## Backend Authorization Review

No RBAC code change was necessary: the existing superuser bypasses are correct and remain in place.

### Confirmed backend superuser access

- `/api/v1/auth/me/` uses `IsCMSUser`, which permits a superuser.
- `/api/v1/cms/dashboard/` uses `IsAuthenticated` and `IsCMSUser`; a superuser passes both.
- CMS module views use `HasModulePermission`; it returns `True` for a superuser before any custom-role check.
- `/api/v1/admin/activity-logs/` uses `HasModulePermission`; a superuser passes.
- User management uses `HasModulePermission` for `users.manage_users`; a superuser passes.

Normal users remain role/capability constrained. No `AllowAny`, CSRF, or authentication bypass was added.

## Production Cookie Fix

`backend/config/settings.py` now defaults both cookie settings by environment mode:

| Mode | Session Cookie | CSRF Cookie |
|---|---|---|
| Development (`DEBUG=True`) | `Lax` | `Lax` |
| Production (`DEBUG=False`) | `None` | `None` |

Explicit environment variables remain authoritative:

```text
DJANGO_SESSION_COOKIE_SAMESITE
DJANGO_CSRF_COOKIE_SAMESITE
```

`backend/.env.example` now shows the correct Railway cross-origin production values:

```text
DJANGO_SESSION_COOKIE_SAMESITE=None
DJANGO_CSRF_COOKIE_SAMESITE=None
```

Django already sets `SESSION_COOKIE_SECURE=True` and `CSRF_COOKIE_SECURE=True` when `DEBUG=False`, so `SameSite=None` is used only with secure HTTPS cookies.

## Frontend Guard Review

No frontend code change was needed.

The frontend is already correct for superusers:

- `AuthContext.hasCapability()` returns true for `user.is_superuser`.
- `AuthContext.hasModuleAccess()` returns true for `user.is_superuser`.
- `ProtectedRoute` bypasses module checks for a superuser.
- `CMSSidebar` displays all modules for a superuser.
- Page-specific checks for Dashboard, Site Settings, Media Library, and Activity Logs use the superuser-aware `AuthContext` helpers.

## Superuser `/auth/me/` Response Summary

The current-user serializer returns these authorization-relevant fields:

```text
is_superuser
is_staff
is_active
role
permitted_modules
capabilities
```

Focused serialization validation with an in-memory superuser returned:

```text
modules=12
capabilities=96
```

The response therefore contains all information required for the frontend to recognize full CMS access, without requiring any custom role assignment.

## Validation Results

### Django checks

```text
python manage.py check
System check identified no issues (0 silenced).
```

**PASS**

### Production cookie configuration

With `DJANGO_DEBUG=False` and no explicit cookie override:

```text
DEBUG=False
SESSION_COOKIE_SAMESITE=None
CSRF_COOKIE_SAMESITE=None
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

**PASS**

### Focused authorization probes

An in-memory active Django superuser was authenticated directly against the views without creating or changing database users:

```text
/api/v1/auth/me/                 200
/api/v1/cms/dashboard/           200
/api/v1/cms/site-settings/       404
/api/v1/cms/media/               200
/api/v1/admin/activity-logs/     200
```

The `site-settings` status is 404 only because the local database has no CMS site-settings record; it is not an authorization failure. The request cleared CMS authorization successfully.

A normal active `lms_admin` user without media access was tested against the Media endpoint:

```text
/api/v1/cms/media/               403
```

**PASS:** normal unauthorized users remain blocked.

### Frontend build

```text
npm run build
✓ built successfully
```

**PASS** with pre-existing non-blocking Vite warnings about duplicate translation keys and bundle size.

### Migration check

```text
python manage.py makemigrations --check --dry-run
No changes detected
```

**PASS:** no migrations are required.

## Security Review

- No production data was modified.
- No user, role, or superuser record was created or altered.
- Existing CSRF protection and session authentication remain enabled.
- No permission class was weakened.
- No `AllowAny` permission was introduced.
- No custom role is required for a Django superuser.
- `SameSite=None` is paired with `Secure=True` in production and is necessary for the deliberate cross-origin Railway architecture.
- CORS and CSRF trusted origins must stay restricted to the deployed frontend origin.

## Required Railway Deployment Configuration

Verify the backend service has either no conflicting cookie override (allowing the new production default) or the following explicit values:

```text
DJANGO_SESSION_COOKIE_SAMESITE=None
DJANGO_CSRF_COOKIE_SAMESITE=None
```

Also retain:

```text
DJANGO_CORS_ALLOWED_ORIGINS=https://<frontend-domain>
DJANGO_CSRF_TRUSTED_ORIGINS=https://<frontend-domain>
```

Values must not contain a trailing slash.

## Final Verdict

**PASS**

The production superuser RBAC flow is already correct. The displayed permission error came from the unauthenticated dashboard request after login because the cross-origin session cookie default was `Lax`. The production default is now `SameSite=None` with secure cookies, so the browser can attach the session on protected CMS requests. Normal-user RBAC remains unchanged and enforced.
