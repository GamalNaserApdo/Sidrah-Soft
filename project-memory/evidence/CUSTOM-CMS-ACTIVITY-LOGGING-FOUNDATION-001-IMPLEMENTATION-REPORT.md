# CUSTOM-CMS-ACTIVITY-LOGGING-FOUNDATION-001 — Implementation Report

- **Date:** 2026-07-11
- **Scope:** Implement the Activity Logging foundation for the Custom Sidrah CMS Dashboard.
- **Status:** COMPLETE
- **Report path:** `project-memory/evidence/CUSTOM-CMS-ACTIVITY-LOGGING-FOUNDATION-001-IMPLEMENTATION-REPORT.md`

## Executive Summary

This implementation adds a new `activity_logs` Django app and a React activity-log page/widget. The system records authentication events and provides a reusable logging service for future CMS CRUD APIs. Logs are append-only, sanitized, and protected by the existing session/CSRF/RBAC foundation. No authentication logic was rebuilt. No heavy test suites were run.

## Final Implementation Verdict

**PASS.**

- ActivityLog app created and migrated.
- Auth events (login, logout, failed login) are logged.
- Sensitive data is excluded from logs.
- Django Admin is read-only.
- Admin API is protected and read-only.
- RBAC enforced server-side via `HasModulePermission`.
- Activity page builds and is protected.
- Dashboard widget renders safely.
- Unauthorized roles (editor) are blocked.
- Migration applied.
- Django check passes.
- Frontend build passes.

## Files Created

### Backend

- `backend/apps/activity_logs/__init__.py`
- `backend/apps/activity_logs/apps.py`
- `backend/apps/activity_logs/models.py`
- `backend/apps/activity_logs/admin.py`
- `backend/apps/activity_logs/serializers.py`
- `backend/apps/activity_logs/views.py`
- `backend/apps/activity_logs/urls.py`
- `backend/apps/activity_logs/services.py`
- `backend/apps/activity_logs/signals.py`
- `backend/apps/activity_logs/migrations/__init__.py`
- `backend/apps/activity_logs/migrations/0001_initial.py`

### Frontend

- `src/services/activityLogsApi.js`
- `src/pages/cms/CMSActivityLogsPage.jsx`
- `src/components/cms/RecentActivityWidget.jsx`

## Files Modified

### Backend

- `backend/config/settings.py` — added `apps.activity_logs` to `LOCAL_APPS`; added `http://localhost:5174` and `http://127.0.0.1:5174` to `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.
- `backend/config/urls.py` — mounted activity logs admin routes at `api/v1/admin/activity-logs/`.
- `backend/apps/accounts/views.py` — added `log_activity` calls in `LoginView` and `LogoutView`.

### Frontend

- `src/App.jsx` — added protected `/cms/activity-logs` route.
- `src/pages/cms/CMSDashboardPage.jsx` — added Activity Logs nav link and `RecentActivityWidget`.
- `src/services/apiClient.js` — changed default API base from `8000` to `8001`.

## ActivityLog Schema

```python
class ActivityLog(TimeStampedModel):
    user = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True)
    username = CharField(max_length=150, blank=True)
    action = CharField(max_length=32, choices=ACTION_CHOICES, db_index=True)
    module = CharField(max_length=32, choices=MODULE_CHOICES, blank=True, db_index=True)
    object_type = CharField(max_length=100, blank=True, db_index=True)
    object_id = CharField(max_length=40, blank=True, db_index=True)
    object_repr = CharField(max_length=255, blank=True)
    description = TextField(blank=True)
    metadata = JSONField(default=dict, blank=True)
    ip_address = GenericIPAddressField(null=True, blank=True)
    user_agent = TextField(blank=True)
    origin = CharField(max_length=255, blank=True)
    request_method = CharField(max_length=10, blank=True)
    request_path = CharField(max_length=255, blank=True, db_index=True)
    is_success = BooleanField(default=True, db_index=True)
    failure_reason = CharField(max_length=255, blank=True)
```

### Indexes

- `actlog_created_idx` on `created_at`
- `actlog_user_idx` on `user`
- `actlog_action_idx` on `action`
- `actlog_module_idx` on `module`
- `actlog_success_idx` on `is_success`
- `actlog_object_idx` on `(object_type, object_id)`

Default ordering: `-created_at`.

### Append-Only Behavior

- Admin: `has_add_permission` → `False`, `has_change_permission` → `False`.
- API: `POST`, `PATCH`, `PUT`, `DELETE` return `405 Method Not Allowed`.
- `has_delete_permission` allows only superusers (safety net).

## Actions and Modules

### Actions

- `login`
- `logout`
- `login_failed`
- `create`
- `update`
- `delete`
- `publish`
- `unpublish`
- `archive`
- `restore`
- `status_change`
- `assign`
- `export`
- `settings_change`

### Modules

- `auth`
- `dashboard`
- `site_settings`
- `navigation`
- `partners`
- `services`
- `case_studies`
- `careers`
- `insights`
- `contact`
- `media`
- `users`
- `activity_logs`

## Logging Service

`backend/apps/activity_logs/services.py` provides:

- `log_activity(...)` — central append-only logging function.
- `log_content_action(...)` — reusable helper for future content CRUD.

### Responsibilities

- Extracts IP from `REMOTE_ADDR` (uses `X-Forwarded-For` only if `ACTIVITY_LOG_TRUST_PROXY=True`).
- Bounds `user_agent` to 512 chars, `origin` to 255 chars, `object_repr` to 255 chars, `description` to 1000 chars.
- Sanitizes metadata recursively:
  - Removes sensitive keys (`password`, `token`, `secret`, `authorization`, `cookie`, `csrf`, `session`, etc.).
  - Truncates long strings.
  - Limits recursion depth.
- Never raises — logging failures are captured in the Python logger only.

## Authentication Event Logging

Modified `backend/apps/accounts/views.py`:

### Successful Login

```python
log_activity(
    user=user,
    action='login',
    module='auth',
    request=request,
    description='User logged in successfully.',
    is_success=True,
)
```

### Failed Login

```python
log_activity(
    user=None,
    action='login_failed',
    module='auth',
    request=request,
    description='Failed login attempt.',
    is_success=False,
    failure_reason=self.INVALID_CREDENTIALS_MSG,
    metadata={'username_provided': bool(username)},
)
```

- No password is recorded.
- No account-existence signal.
- Generic response remains `Invalid credentials.`

### Logout

```python
log_activity(
    user=user,
    action='logout',
    module='auth',
    request=request,
    description='User logged out successfully.',
    is_success=True,
)
```

## CRUD Logging Foundation

- Reusable `log_content_action(...)` helper is available for future admin APIs.
- `signals.py` converts existing Django admin `LogEntry` records into `ActivityLog` entries. This is coarse (only admin actions) and avoids per-model save noise.
- No broad `post_save`/`post_delete` signals on content models.

## Django Admin Configuration

Registered `ActivityLog` at `admin/activity_logs/activitylog/`:

- Read-only list and detail.
- `list_display`: `created_at`, `username`, `user`, `action`, `module`, `object_type`, `object_repr`, `is_success`, `request_method`, `request_path`.
- `list_filter`: `action`, `module`, `is_success`, `created_at`, `user`.
- `search_fields`: `user__email`, `object_type`, `object_id`, `object_repr`, `description`, `request_path`.
- `date_hierarchy`: `created_at`.
- `readonly_fields`: all fields.
- No add/change permissions; delete only for superusers.

## Admin API Endpoints

- `GET /api/v1/admin/activity-logs/` — paginated list.
- `GET /api/v1/admin/activity-logs/<id>/` — detail.

### Permissions

```python
permission_classes = [IsCMSUser, HasModulePermission]
cms_module = 'activity_logs'
cms_action = 'view'
```

Superusers bypass.

### Filters and Pagination

Supported query params:

- `action`
- `module`
- `success` (`true`/`false`)
- `user` (user ID)
- `object_type`
- `object_id`
- `from` / `to` (ISO datetimes)
- `search` (searches username, object_repr, description, object_type, request_path)
- `page`
- `page_size` (max 100)

### Public/Private Field Separation

Public serializer excludes:

- `ip_address`
- `user_agent`

User summary includes only `id`, `email`, `username`, `role`, `display_name`.

## RBAC Capability Changes

No role file changes were needed. The existing `apps.accounts.roles` already grants `activity_logs.view` to:

- `super_admin`
- `admin`

It is omitted for `content_manager`, `editor`, `marketing_manager`, `recruiter`, `support_agent`, `lms_admin`, and `finance_sales`, matching the requirement that editors and support/recruiter roles should not see activity logs.

## Frontend API Service

`src/services/activityLogsApi.js`:

- `fetchActivityLogs(filters)` — GET with query params.
- `fetchActivityLog(id)` — GET detail.
- Uses `apiFetch` with `credentials: 'include'`.
- No localStorage usage.
- No second HTTP architecture.

## Activity Logs Page

`src/pages/cms/CMSActivityLogsPage.jsx`:

- Route: `/cms/activity-logs`.
- Protected by `AuthProvider` + `ProtectedRoute`.
- Capability check (`activity_logs.view`); shows access-denied state if missing.
- Read-only table with filters: module, action, success status, search, date range.
- Pagination.
- Loading, empty, and error states.
- Responsive styling consistent with the CMS dashboard foundation.

## Dashboard Widget

`src/components/cms/RecentActivityWidget.jsx`:

- Shows latest 5 activity logs.
- Only renders when user has `activity_logs.view`.
- Links to `/cms/activity-logs`.
- Graceful empty and error states.

## Frontend Navigation

`src/pages/cms/CMSDashboardPage.jsx` now shows an `Activity Logs` link for users with `activity_logs` module access.

## Migration

Created and applied:

```powershell
python .\manage.py makemigrations activity_logs
python .\manage.py migrate
```

Verification:

```text
activity_logs
 [X] 0001_initial

Planned operations:
  No planned migration operations.

No changes detected

System check identified no issues (0 silenced).
```

## Backend Validation Results

Validation performed with temporary users `auditsuper` and `auditeditor`. All passed:

| Test | Result |
|------|--------|
| Anonymous access denied | PASS (403) |
| Failed login returns 401 | PASS |
| Successful login returns 200 | PASS |
| Activity logs list returns 200 | PASS |
| Filter `action=login` works | PASS |
| Filter `module=auth` works | PASS |
| Activity log detail returns 200 | PASS |
| Detail omits `ip_address` | PASS |
| Detail omits `user_agent` | PASS |
| `POST` rejected | PASS (405) |
| `PATCH` rejected | PASS (405) |
| `DELETE` rejected | PASS (405) |
| Logout returns 200 | PASS |
| Editor login returns 200 | PASS |
| Editor denied activity logs | PASS (403) |
| Public contact inquiry-types still works | PASS |
| No secret keys in metadata | PASS |
| Login log exists | PASS |
| Failed-login log exists | PASS |
| Logout log exists | PASS |

All temporary users and test logs were deleted after validation.

## Frontend Build Result

```bash
npm run build
```

Result: **PASS** (`exit code 0`).

Output:

```text
✓ built in 15.33s
```

(Chunk size warnings are pre-existing and unrelated to this change.)

## Temporary Data Cleanup

Deleted after validation:

- Temporary users: `auditsuper`, `auditeditor`.
- All `ActivityLog` test records generated during validation.
- Temporary validation scripts.

## Security Notes

- CSRF protection unchanged.
- Session auth unchanged.
- RBAC unchanged.
- No passwords, tokens, CSRF values, or session IDs stored in logs.
- Logging failures do not break primary operations.

## Known Limitations

- `ip_address` and `user_agent` are stored but not exposed in the public serializer.
- `ACTIVITY_LOG_TRUST_PROXY` must be enabled manually in production if the app runs behind a trusted proxy.
- No dashboard sidebar system exists yet; navigation is rendered inline on the temporary dashboard page.
- No advanced analytics or export functionality.

## Deferred Features

- Full admin CRUD API integration (will call `log_content_action` explicitly).
- Log export.
- Dashboard analytics / charts.
- Log retention / purge command.
- Masking or hashing stored IP addresses.

## Readiness for Admin API Foundation

The activity logging foundation is ready. Future admin API views can import:

```python
from apps.activity_logs.services import log_content_action
```

and call it after successful mutations. The audit table, admin UI, and read-only API are already in place.

## Commands Used

```powershell
Set-Location "f:\What_i_Made\New\sidrah_web\backend"
python .\manage.py makemigrations activity_logs
python .\manage.py migrate
python .\manage.py showmigrations activity_logs
python .\manage.py migrate --plan
python .\manage.py makemigrations --check
python .\manage.py check
```

```bash
cd f:\What_i_Made\New\sidrah_web
npm run build
```
