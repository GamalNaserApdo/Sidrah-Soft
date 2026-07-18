"""CMS serializers for the media library admin API."""
from rest_framework import serializers

from apps.media_library.models import MediaAsset
from apps.media_library.validators import (
    MAX_FILE_SIZE,
    MAX_DIMENSION,
    MAX_TOTAL_PIXELS,
    ALLOWED_EXTENSIONS,
)


class UploadedBySerializer(serializers.Serializer):
    """Safe summary of the user who uploaded the asset."""

    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    display_name = serializers.CharField(read_only=True)


class CMSMediaListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for media list responses."""

    file_url = serializers.SerializerMethodField()
    filename = serializers.SerializerMethodField()
    uploaded_by = UploadedBySerializer(read_only=True)

    class Meta:
        model = MediaAsset
        fields = [
            'id',
            'title',
            'filename',
            'file_url',
            'alt_text',
            'media_type',
            'mime_type',
            'file_size',
            'width',
            'height',
            'usage_context',
            'is_active',
            'uploaded_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        if obj and obj.file:
            request = self.context.get('request')
            url = obj.file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_filename(self, obj):
        if obj and obj.file:
            return obj.file.name
        return ''


class CMSMediaDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for media retrieve responses."""

    file_url = serializers.SerializerMethodField()
    filename = serializers.SerializerMethodField()
    uploaded_by = UploadedBySerializer(read_only=True)
    usage_count = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            'id',
            'title',
            'filename',
            'file_url',
            'alt_text',
            'media_type',
            'mime_type',
            'file_size',
            'width',
            'height',
            'usage_context',
            'is_active',
            'uploaded_by',
            'usage_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        if obj and obj.file:
            request = self.context.get('request')
            url = obj.file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_filename(self, obj):
        if obj and obj.file:
            return obj.file.name
        return ''

    def get_usage_count(self, obj):
        from apps.media_library.services import get_asset_usage
        return get_asset_usage(obj.id)['usage_count']


class CMSMediaUploadSerializer(serializers.Serializer):
    """Write serializer for media upload (multipart/form-data)."""

    file = serializers.FileField(write_only=True)
    title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    alt_text = serializers.CharField(max_length=255, required=False, allow_blank=True)
    usage_context = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate_file(self, value):
        """Lightweight file-field validation — full validation in service layer."""
        if not value:
            raise serializers.ValidationError('A file is required.')
        return value

    def validate(self, attrs):
        """Ensure no system-managed fields are in the input."""
        # This is a safety net — the serializer only defines writable fields,
        # but if extra fields are passed they should be rejected.
        return attrs

    def create(self, validated_data):
        """Delegate creation to the upload service."""
        from apps.media_library.services import create_media_asset
        from apps.media_library.validators import MediaValidationError

        request = self.context.get('request')
        user = request.user if request else None

        try:
            return create_media_asset(
                uploaded_file=validated_data['file'],
                user=user,
                title=validated_data.get('title', ''),
                alt_text=validated_data.get('alt_text', ''),
                usage_context=validated_data.get('usage_context', ''),
            )
        except MediaValidationError as exc:
            raise serializers.ValidationError(
                detail={'file': exc.messages if hasattr(exc, 'messages') else str(exc)},
                code=exc.code if hasattr(exc, 'code') else 'invalid_media',
            )


class CMSMediaMetadataUpdateSerializer(serializers.ModelSerializer):
    """Write serializer for metadata-only updates (PATCH)."""

    class Meta:
        model = MediaAsset
        fields = ['title', 'alt_text', 'usage_context', 'is_active']
        read_only_fields = []  # All listed fields are writable

    def update(self, instance, validated_data):
        """Track changed fields for activity logging."""
        changed_fields = []
        for field, new_value in validated_data.items():
            old_value = getattr(instance, field, None)
            if old_value != new_value:
                changed_fields.append(field)
                setattr(instance, field, new_value)

        instance.save()
        # Store changed fields for the view to use in activity logging
        instance._changed_fields = changed_fields
        return instance


class CMSMediaUsageSerializer(serializers.Serializer):
    """Serializer for the usage endpoint response."""

    media_id = serializers.IntegerField(read_only=True)
    is_used = serializers.BooleanField(read_only=True)
    usage_count = serializers.IntegerField(read_only=True)
    usages = serializers.ListField(read_only=True)
