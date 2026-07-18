"""
Safe user serializers for the CMS dashboard.

Never expose: password hash, session IDs, CSRF secrets, raw permissions.
"""

from rest_framework import serializers

from .models import User
from .roles import get_user_capabilities, get_user_modules


class CMSUserSerializer(serializers.ModelSerializer):
    """
    Safe representation of the authenticated CMS user.
    Returned by /api/v1/auth/me/ and login response.
    """
    display_name = serializers.SerializerMethodField()
    capabilities = serializers.SerializerMethodField()
    permitted_modules = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'display_name',
            'role',
            'is_staff',
            'is_superuser',
            'is_active',
            'capabilities',
            'permitted_modules',
        ]
        read_only_fields = fields

    def get_display_name(self, obj):
        full = f'{obj.first_name} {obj.last_name}'.strip()
        return full or obj.username or obj.email

    def get_capabilities(self, obj):
        return get_user_capabilities(obj)

    def get_permitted_modules(self, obj):
        return get_user_modules(obj)
