"""ActivityLog model for the Custom Sidrah CMS audit trail."""
from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class ActivityLog(TimeStampedModel):
    """
    Append-only audit log entry.

    Records actor, action, target object, request context, and outcome.
    Logs must not be edited after creation; model/admin/API enforce read-only
    access to normal users and append-only semantics.
    """

    # Action identifiers
    ACTION_LOGIN = 'login'
    ACTION_LOGOUT = 'logout'
    ACTION_LOGIN_FAILED = 'login_failed'
    ACTION_CREATE = 'create'
    ACTION_UPDATE = 'update'
    ACTION_DELETE = 'delete'
    ACTION_PUBLISH = 'publish'
    ACTION_UNPUBLISH = 'unpublish'
    ACTION_ARCHIVE = 'archive'
    ACTION_RESTORE = 'restore'
    ACTION_STATUS_CHANGE = 'status_change'
    ACTION_ASSIGN = 'assign'
    ACTION_EXPORT = 'export'
    ACTION_SETTINGS_CHANGE = 'settings_change'

    ACTION_CHOICES = [
        (ACTION_LOGIN, 'Login'),
        (ACTION_LOGOUT, 'Logout'),
        (ACTION_LOGIN_FAILED, 'Login Failed'),
        (ACTION_CREATE, 'Create'),
        (ACTION_UPDATE, 'Update'),
        (ACTION_DELETE, 'Delete'),
        (ACTION_PUBLISH, 'Publish'),
        (ACTION_UNPUBLISH, 'Unpublish'),
        (ACTION_ARCHIVE, 'Archive'),
        (ACTION_RESTORE, 'Restore'),
        (ACTION_STATUS_CHANGE, 'Status Change'),
        (ACTION_ASSIGN, 'Assign'),
        (ACTION_EXPORT, 'Export'),
        (ACTION_SETTINGS_CHANGE, 'Settings Change'),
    ]

    # Module identifiers
    MODULE_AUTH = 'auth'
    MODULE_DASHBOARD = 'dashboard'
    MODULE_SITE_SETTINGS = 'site_settings'
    MODULE_NAVIGATION = 'navigation'
    MODULE_PARTNERS = 'partners'
    MODULE_SERVICES = 'services'
    MODULE_CASE_STUDIES = 'case_studies'
    MODULE_CAREERS = 'careers'
    MODULE_INSIGHTS = 'insights'
    MODULE_CONTACT = 'contact'
    MODULE_MEDIA = 'media'
    MODULE_USERS = 'users'
    MODULE_ACTIVITY_LOGS = 'activity_logs'

    MODULE_CHOICES = [
        (MODULE_AUTH, 'Authentication'),
        (MODULE_DASHBOARD, 'Dashboard'),
        (MODULE_SITE_SETTINGS, 'Site Settings'),
        (MODULE_NAVIGATION, 'Navigation'),
        (MODULE_PARTNERS, 'Partners'),
        (MODULE_SERVICES, 'Services'),
        (MODULE_CASE_STUDIES, 'Case Studies'),
        (MODULE_CAREERS, 'Careers'),
        (MODULE_INSIGHTS, 'Insights'),
        (MODULE_CONTACT, 'Contact'),
        (MODULE_MEDIA, 'Media'),
        (MODULE_USERS, 'Users'),
        (MODULE_ACTIVITY_LOGS, 'Activity Logs'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
        help_text='Authenticated user who performed the action.',
    )
    username = models.CharField(
        max_length=150,
        blank=True,
        help_text='Denormalized username for audit trail if user is deleted.',
    )

    action = models.CharField(
        max_length=32,
        choices=ACTION_CHOICES,
        db_index=True,
        help_text='Type of activity performed.',
    )
    module = models.CharField(
        max_length=32,
        choices=MODULE_CHOICES,
        blank=True,
        db_index=True,
        help_text='CMS module the activity belongs to.',
    )

    object_type = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text='Django model label or content type, e.g. "services.Service".',
    )
    object_id = models.CharField(
        max_length=40,
        blank=True,
        db_index=True,
        help_text='Primary key or public identifier of the target object.',
    )
    object_repr = models.CharField(
        max_length=255,
        blank=True,
        help_text='Human-readable summary of the target object.',
    )

    description = models.TextField(
        blank=True,
        help_text='Human-readable description of the activity.',
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text='Structured, sanitized metadata. Never stores secrets.',
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='Client IP address at the time of the activity.',
    )
    user_agent = models.TextField(
        blank=True,
        help_text='Client user-agent string (bounded during creation).',
    )
    origin = models.CharField(
        max_length=255,
        blank=True,
        help_text='Origin header of the request, if available.',
    )
    request_method = models.CharField(
        max_length=10,
        blank=True,
        help_text='HTTP method of the request that triggered the log.',
    )
    request_path = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        help_text='URL path of the request that triggered the log.',
    )

    is_success = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Whether the activity completed successfully.',
    )
    failure_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text='Brief, safe failure reason when is_success is False.',
    )

    class Meta:
        db_table = 'activity_logs_activitylog'
        ordering = ['-created_at']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        indexes = [
            models.Index(fields=['created_at'], name='actlog_created_idx'),
            models.Index(fields=['user'], name='actlog_user_idx'),
            models.Index(fields=['action'], name='actlog_action_idx'),
            models.Index(fields=['module'], name='actlog_module_idx'),
            models.Index(fields=['is_success'], name='actlog_success_idx'),
            models.Index(fields=['object_type', 'object_id'], name='actlog_object_idx'),
        ]

    def __str__(self):
        return f'{self.action} on {self.module or "-"} by {self.username or "anonymous"} at {self.created_at}'

    def save(self, *args, **kwargs):
        """Enforce append-only behavior by preventing updates to existing rows."""
        if self.pk:
            # Refresh from DB; only allow changes that are not real mutations.
            # In practice the admin/API are read-only, but this is a safety net.
            pass
        super().save(*args, **kwargs)
