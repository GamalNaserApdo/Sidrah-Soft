"""CMS serializers for the Training & Education module."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field

from .models import Program


class CMSProgramListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for CMS program list views."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch', 'status',
            'title_en', 'title_ar',
            'audience_levels', 'display_order',
            'image_url', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_image_url(self, obj):
        if obj.image and obj.image.file:
            request = self.context.get('request')
            url = obj.image.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class CMSProgramDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for CMS program retrieve."""

    image = MediaAssetReferenceSerializer(read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch', 'status',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'overview_en', 'overview_ar',
            'audience_levels',
            'image',
            'modules_en', 'modules_ar',
            'skills_en', 'skills_ar',
            'learning_outcomes_en', 'learning_outcomes_ar',
            'practical_project_en', 'practical_project_ar',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'schedule_en', 'schedule_ar',
            'cta_text_en', 'cta_text_ar',
            'display_order',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CMSProgramWriteSerializer(serializers.ModelSerializer):
    """Write serializer for CMS program create/update."""

    image = media_asset_field()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch', 'status',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'overview_en', 'overview_ar',
            'audience_levels',
            'image',
            'modules_en', 'modules_ar',
            'skills_en', 'skills_ar',
            'learning_outcomes_en', 'learning_outcomes_ar',
            'practical_project_en', 'practical_project_ar',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'schedule_en', 'schedule_ar',
            'cta_text_en', 'cta_text_ar',
            'display_order',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
