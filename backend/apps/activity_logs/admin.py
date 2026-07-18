"""Django Admin configuration for ActivityLog."""
import json

from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """
    Read-only admin for activity logs.

    Activity logs are append-only. Add, change, and delete permissions are
    disabled for normal users; superusers are allowed to delete only because
    Django Admin requires some user to be able to clean up test data.
    """

    list_display = (
        'created_at',
        'username',
        'user',
        'action',
        'module',
        'object_type',
        'object_repr',
        'is_success',
        'request_method',
        'request_path',
    )
    list_filter = (
        'action',
        'module',
        'is_success',
        'created_at',
        'user',
    )
    search_fields = (
        'user__email',
        'object_type',
        'object_id',
        'object_repr',
        'description',
        'request_path',
    )
    date_hierarchy = 'created_at'
    list_select_related = ('user',)
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
        'description',
        'metadata',
        'ip_address',
        'user_agent',
        'origin',
        'request_method',
        'request_path',
        'is_success',
        'failure_reason',
    )
    fieldsets = (
        (None, {
            'fields': (
                'created_at',
                'action',
                'module',
                'is_success',
                'failure_reason',
            ),
        }),
        ('Actor', {
            'fields': ('user', 'username'),
        }),
        ('Target', {
            'fields': ('object_type', 'object_id', 'object_repr'),
        }),
        ('Request Context', {
            'fields': ('request_method', 'request_path', 'ip_address', 'user_agent', 'origin'),
        }),
        ('Details', {
            'fields': ('description', 'metadata'),
        }),
        ('System', {
            'fields': ('updated_at',),
            'classes': ('collapse',),
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Allow superusers only; consider disabling entirely in high-security deployments.
        return request.user.is_superuser if request.user.is_authenticated else False

    def metadata_display(self, obj):
        """Render metadata as pretty-printed JSON without exposing secrets."""
        return json.dumps(obj.metadata, indent=2, ensure_ascii=False)
    metadata_display.short_description = 'Metadata'

    def get_queryset(self, request):
        """Always order newest first."""
        qs = super().get_queryset(request)
        return qs.order_by('-created_at')
