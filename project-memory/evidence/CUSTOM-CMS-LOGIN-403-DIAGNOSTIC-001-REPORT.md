# CUSTOM-CMS-LOGIN-403-DIAGNOSTIC-001 — Report

- **Date:** 2026-07-11
- **Scope:** Determine the exact reason for `POST /api/v1/auth/login/` returning 403, fix it, and validate end-to-end CMS authentication.
- **Report path:** `project-memory/evidence/CUSTOM-CMS-LOGIN-403-DIAGNOSTIC-001-REPORT.md`

## Final Status

- **Root cause identified:** YES
- **Fix applied:** YES
- **End-to-end login validated:** YES
- **CMS dashboard access validated:** YES
- **Build status:** PASS (`npm run build` exit 0)
- **Django check status:** PASS (`python manage.py check` no issues)
- **Temporary validation user removed:** YES

## Root Cause of 403

**Answer: A + H — CSRF validation combined with missing trusted origin / CORS origin.**

The frontend was being served from an origin that was **not** present in either `CSRF_TRUSTED_ORIGINS` or `CORS_ALLOWED_ORIGINS`. When the browser sent the login POST request, Django's CSRF middleware rejected it before credentials were checked.

Exact server-side error after reproduction:

```text
Forbidden (403)
CSRF verification failed. Request aborted.
Reason given for failure:
    Origin checking failed - http://localhost:5174 does not match any trusted origins.
```

(Equivalent failures occurred for LAN IP origins such as `http://192.168.1.7:5173`.)

## What Was Not the Cause

- **B — Role restriction:** Ruled out. Role checks happen *after* successful authentication, not before. The 403 was returned before credentials were validated.
- **C — is_staff requirement:** Ruled out. `is_staff` is not required for login; it is checked inside `IsCMSUser` for protected endpoints, not `LoginView`.
- **D — is_active requirement:** Ruled out. Inactive users receive 401, not 403.
- **E — Incorrect credentials:** Ruled out. With correct CSRF origin, wrong credentials returned 401 (`{"detail":"Invalid credentials."}`).
- **F — Missing CSRF cookie fetch:** Ruled out. The frontend calls `/api/v1/auth/csrf/` before login and the cookie was being set.
- **G — Frontend credentials/cookie issue:** Ruled out. The frontend correctly reads `csrftoken` and sends it as `X-CSRFToken`.
- **I — Permission class issue:** Ruled out. `LoginView` uses `AllowAny`. The 403 came from `csrf_protect`, not a DRF permission class.

## Evidence from Code Review

### `backend/config/settings.py`

```python
CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS',
    default=['http://localhost:5173', 'http://127.0.0.1:5173'],
)

CSRF_TRUSTED_ORIGINS = env_list(
    'CSRF_TRUSTED_ORIGINS',
    default=['http://localhost:5173', 'http://127.0.0.1:5173'],
)
```

The environment variables were the only source for these lists; no wildcard or dynamic origin support exists in code.

### `backend/.env` (before fix)

```text
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`CSRF_TRUSTED_ORIGINS` was not defined, so it fell back to the 5173 defaults only.

### `backend/apps/accounts/views.py`

```python
@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
```

The view correctly enforces CSRF. The failure was therefore a configuration mismatch, not a code defect.

## Fix Applied

Updated `backend/.env`:

1. Added `CSRF_TRUSTED_ORIGINS`.
2. Expanded `CORS_ALLOWED_ORIGINS` to include:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - `http://localhost:5174`
   - `http://127.0.0.1:5174`
   - All detected active LAN IPv4 origins on ports 5173 and 5174.
3. Fixed a corrupted line: `MEDIA_URL=/media/ES=en,ar` was split into `MEDIA_URL=/media/` and `SUPPORTED_LANGUAGES=en,ar`.

Example of the active LAN origins detected:

- `http://192.168.115.1:5173/5174`
- `http://192.168.142.1:5173/5174`
- `http://172.29.48.1:5173/5174`
- `http://172.22.176.1:5173/5174`
- `http://192.168.1.7:5173/5174`

No wildcards were used.

After the `.env` change, the Django development server was restarted to reload settings.

## User Account Reviewed

Existing superuser account:

| Field | Value |
| --- | --- |
| id | 1 |
| username | admin |
| is_active | True |
| is_staff | True |
| is_superuser | True |
| role | content_manager |

This account is correctly permitted to access the CMS dashboard.

## End-to-End Validation

### 1. CSRF endpoint

```text
GET /api/v1/auth/csrf/
Origin: http://localhost:5174
Status: 200
Response: {"detail":"CSRF cookie set."}
Cookie: csrftoken=<32-char token>
```

### 2. Login (wrong credentials, correct origin)

```text
POST /api/v1/auth/login/
Origin: http://localhost:5174
X-CSRFToken: <token>
Body: {"username":"testuser","password":"wrongpassword"}
Status: 401
Response: {"detail":"Invalid credentials."}
```

This proves CSRF and CORS are now passing.

### 3. Login (correct temporary superuser)

```text
POST /api/v1/auth/login/
Origin: http://localhost:5174
X-CSRFToken: <token>
Body: {"username":"tempcmsvalidator","password":"TempPass123!"}
Status: 200
Response: CMSUserSerializer payload with is_superuser=true, capabilities and permitted_modules populated
```

### 4. Current user

```text
GET /api/v1/auth/me/
Status: 200
Response: CMS user data
```

### 5. Dashboard access

```text
GET /api/v1/admin/dashboard/access/
Status: 200
Response: {"access":"granted","user":<CMSUserSerializer payload>}
```

### 6. Logout

```text
POST /api/v1/auth/logout/
Status: 200
Response: {"detail":"Logged out successfully."}
```

> Note: In the real frontend the CSRF token is rotated after login. The frontend's `authFetch` reads the current `csrftoken` cookie at request time, so logout works correctly. The PowerShell reproduction had to use the rotated cookie.

## Validation Commands

```bash
python manage.py check
# System check identified no issues (0 silenced).

python manage.py showmigrations accounts
# accounts
#  [X] 0001_initial
#  [ ] 0002_alter_user_role

npm run build
# Exit code: 0
```

## Findings / Limitations

- **Unapplied migration:** `accounts.0002_alter_user_role` is not applied. It only updates the `role` field choices and does not block login, but it should be applied to keep the schema in sync.
- **Missing `contact_contactsubmission` table:** When attempting to delete the temporary validation user via `User.objects.filter(...).delete()`, Django tried to cascade to `contact_contactsubmission.assigned_to_id` but the table does not exist. This suggests the `contact` app migrations are also not fully applied. The temporary user was safely removed with a raw SQL `DELETE FROM accounts_user WHERE username='tempcmsvalidator'`.
- **Migrations recommendation:** Run `python manage.py migrate` to apply pending migrations before the next CMS feature phase.

## Files Modified

- `backend/.env`

No Django/Python source files were changed for this fix.

## Temporary Data Cleanup

- Created: `tempcmsvalidator` (superuser) for validation.
- Removed: `tempcmsvalidator` via raw SQL after validation.
