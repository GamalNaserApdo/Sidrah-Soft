# CUSTOM-CMS-ACTIVITY-LOGGING-FOUNDATION-001 — Investigation Report

- **Date:** 2026-07-11
- **Scope:** Investigate and design an activity logging foundation for the Custom CMS.
- **Status:** Investigation complete; architecture ready for implementation.
- **Report path:** `project-memory/evidence/CUSTOM-CMS-ACTIVITY-LOGGING-FOUNDATION-001-REPORT.md`

## Executive Summary

The CMS currently has role-based access control and a dashboard foundation, but no audit trail. An activity logging app (`apps.activity_logs`) should be created to record who did what, when, and from where. The foundation must be non-intrusive, read-optimized, and aligned with the existing `TimeStampedModel` pattern and `accounts` role system.

## Existing Patterns Reused

### `apps.core.models.TimeStampedModel`

```python
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

All existing CMS models (`Article`, `Partner`, `User`, etc.) inherit from this. The activity log model will also use it.

### `apps.accounts.roles`

- `MODULE_ACTIVITY_LOGS` already reserved in `ALL_MODULES`.
- `IsCMSUser` / `HasModulePermission` will enforce access.
- Superusers bypass restrictions; other roles need explicit `activity_logs.view`.

### Admin conventions

- `list_display`, `list_filter`, `search_fields`, `readonly_fields`, `date_hierarchy` used consistently.
- Actions such as `publish_articles`, `archive_articles`, etc.
- Fieldsets group fields logically.

## Recommended Models

### `ActivityLog`

Single, append-only audit table.

```python
class ActivityLog(TimeStampedModel):
    ACTION_LOGIN = 'login'
    ACTION_LOGOUT = 'logout'
    ACTION_CREATE = 'create'
    ACTION_UPDATE = 'update'
    ACTION_DELETE = 'delete'
    ACTION_PUBLISH = 'publish'
    ACTION_UNPUBLISH = 'unpublish'
    ACTION_ASSIGN = 'assign'
    ACTION_EXPORT = 'export'
    ACTION_PASSWORD_CHANGE = 'password_change'
    ACTION_FAILED_LOGIN = 'failed_login'

    ACTION_CHOICES = [...]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
    )
    username = models.CharField(max_length=150, blank=True)

    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    module = models.CharField(max_length=32, choices=MODULE_CHOICES, blank=True)

    object_type = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=40, blank=True)
    object_repr = models.CharField(max_length=255, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    origin = models.URLField(blank=True)

    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    is_success = models.BooleanField(default=True)
    failure_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'activity_logs_activitylog'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='actlog_user_date_idx'),
            models.Index(fields=['action', '-created_at'], name='actlog_action_date_idx'),
            models.Index(fields=['module', '-created_at'], name='actlog_module_date_idx'),
            models.Index(fields=['object_type', 'object_id'], name='actlog_object_idx'),
            models.Index(fields=['ip_address', '-created_at'], name='actlog_ip_date_idx'),
            models.Index(fields=['is_success', '-created_at'], name='actlog_success_date_idx'),
        ]
```

### `MODULE_CHOICES`

Mirror the constants already defined in `apps.accounts.roles` so the activity log can be filtered by module.

## Recommended Relationships

- **User:** `ForeignKey` to `accounts.User` with `SET_NULL`. This preserves logs even if a user is deleted, while keeping the relationship for live users.
- **Target object:** Generic relation is intentionally avoided to keep the model simple and performant. `object_type` + `object_id` as plain `CharField`s, with a composite index, are sufficient for audit queries.
- **No reverse relation on target models:** Logs should not be queried from the public side. The CMS dashboard will query `ActivityLog` directly.

## Recommended Admin UX

```python
@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        'created_at',
        'username',
        'action',
        'module',
        'object_repr',
        'ip_address',
        'is_success',
    )
    list_filter = (
        'action',
        'module',
        'is_success',
        'created_at',
    )
    search_fields = (
        'username',
        'object_repr',
        'description',
        'ip_address',
        'metadata',
    )
    date_hierarchy = 'created_at'
    readonly_fields = (
        'created_at',
        'updated_at',
        'user',
        'username',
        'action',
        'module',
        'object_type',
        'object_id',
        'object_repr',
        'ip_address',
        'user_agent',
        'origin',
        'description',
        'metadata',
        'is_success',
        'failure_reason',
    )
    list_select_related = ('user',)
    actions = ['export_selected_logs']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Allow only superusers to delete; consider disabling entirely.
        return request.user.is_superuser
```

### UX notes

- Activity logs are append-only; no editing is allowed.
- A detail view shows the full JSON metadata.
- Export action for compliance/auditing (CSV or JSON).
- Add a dashboard widget showing recent logins and failed logins.

## Recommended API Strategy

### Endpoints (under `/api/v1/admin/activity-logs/`)

1. **GET /api/v1/admin/activity-logs/**
   - Paginated list.
   - Query params: `action`, `module`, `user_id`, `object_type`, `object_id`, `is_success`, `from`, `to`.
   - Permission: `IsCMSUser` + `HasModulePermission` with `cms_module='activity_logs'` and `cms_action='view'`.

2. **GET /api/v1/admin/activity-logs/summary/**
   - Aggregation for dashboard: counts by action/module over time.
   - Permission: same as above.

3. **POST (internal only)**
   - No public write endpoint. Logs are written by backend code, not by the frontend.

### Serializer

```python
class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'created_at',
            'username',
            'action',
            'module',
            'object_type',
            'object_id',
            'object_repr',
            'ip_address',
            'origin',
            'description',
            'metadata',
            'is_success',
            'failure_reason',
        ]
        read_only_fields = fields
```

## Dashboard Integration Strategy

1. **Widget 1 — Recent activity:** Latest 10 `create`, `update`, `delete`, `publish` events across all modules.
2. **Widget 2 — Failed logins:** Recent `failed_login` events to detect brute force.
3. **Widget 3 — Active users:** Recent unique users who logged in.
4. **Page — Full audit log:** Paginated table with filters, accessible from a new "Activity Logs" sidebar item under CMS modules.

Frontend hook: `useActivityLogs(filters, pagination)`.

## Security Considerations

- **Never log passwords or tokens.** Only metadata such as usernames, object IDs, and success/failure.
- **Logs cannot be edited or deleted by non-superusers.** Even superusers should ideally only export, not delete.
- **IP address and user agent are sensitive PII.** Store them only if privacy policy allows; consider hashing the IP after a retention period.
- **Failed login attempts must be logged without exposing which username exists.** Log "failed_login" with the attempted username if provided.
- **Session fixation:** Rotate session on login and log the event.
- **Tamper resistance:** Append-only model; no `update` path except `failure_reason` on creation.

## Performance Considerations

- **Indexes:** Composite indexes on `(user, -created_at)`, `(action, -created_at)`, and `(module, -created_at)` cover the most common dashboard queries.
- **Partitioning/archiving:** For high-traffic CMS, partition by month or archive logs older than a configurable retention period (e.g., 12 months).
- **Async writes:** Use Django signals for logging; for very high volume, offload to a background queue (e.g., Celery) later.
- **Query limits:** API endpoints should enforce a max page size and a max date range for summary endpoints.
- **JSONField metadata:** Keep metadata small (< 4 KB) to avoid bloating the table and index size.

## Future LMS Compatibility

- Add `LMS_ADMIN` actions such as `enrollment`, `progress_update`, `certificate_issue`.
- Add an `lms_course_id` optional field or keep it in `metadata` to avoid schema churn.
- The `module` field already supports `activity_logs`; add `lms` when the LMS module is created.
- The permission class `HasModulePermission` will automatically enforce LMS-specific activity log access once `cms_module='lms'` is used.

## Suggested Implementation Order

1. Create `apps.activity_logs` app with model, migration, and admin.
2. Add `apps.activity_logs` to `INSTALLED_APPS`.
3. Create `activity_logs/serializers.py`, `activity_logs/views.py`, `activity_logs/urls.py`.
4. Wire activity-log URLs under `/api/v1/admin/activity-logs/` in `config/urls.py`.
5. Add logging calls in:
   - `LoginView` (success and failure)
   - `LogoutView`
   - Django admin `log_addition`, `log_change`, `log_deletion` signals or model `post_save`/`post_delete` signals.
6. Add dashboard widget and sidebar link in frontend.
7. Add a management command to purge old logs beyond retention.

## Files That Would Be Created/Modified

New files:

- `backend/apps/activity_logs/__init__.py`
- `backend/apps/activity_logs/apps.py`
- `backend/apps/activity_logs/models.py`
- `backend/apps/activity_logs/admin.py`
- `backend/apps/activity_logs/serializers.py`
- `backend/apps/activity_logs/views.py`
- `backend/apps/activity_logs/urls.py`
- `backend/apps/activity_logs/migrations/0001_initial.py`

Modified files:

- `backend/config/settings.py` — add app to `LOCAL_APPS`.
- `backend/config/urls.py` — include activity log admin URLs.
- `backend/apps/accounts/views.py` — emit login/logout/failure logs.
- `backend/apps/accounts/signals.py` (new or existing) — emit model change logs via signals.
- Frontend: new API service, hook, widget component, and sidebar link.
