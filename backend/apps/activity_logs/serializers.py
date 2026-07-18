"""Serializers for ActivityLog admin API."""
from rest_framework import serializers

from apps.accounts.serializers import CMSUserSerializer
from .models import ActivityLog


class ActivityLogUserSerializer(serializers.ModelSerializer):
    """Minimal user summary safe for audit logs."""

    display_name = serializers.SerializerMethodField()

    class Meta:
        model = None  # set dynamically in __init__
        fields = ['id', 'email', 'username', 'role', 'display_name']
        read_only_fields = fields

    def __init__(self, *args, **kwargs):
        from apps.accounts.models import User
        self.Meta.model = User
        super().__init__(*args, **kwargs)

    def get_display_name(self, obj):
        full = f'{obj.first_name} {obj.last_name}'.strip()
        return full or obj.username or obj.email


class ActivityLogSerializer(serializers.ModelSerializer):
    """Safe read-only serializer for activity log entries."""

    user = ActivityLogUserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'username',
            'action',
            'module',
            'object_type',
            'object_id',
            'object_repr',
            'description',
            'metadata',
            'request_method',
            'request_path',
            'is_success',
            'failure_reason',
            'created_at',
        ]
        read_only_fields = fields
