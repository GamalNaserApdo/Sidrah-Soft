"""Public API serializers for Training & Education programs."""
from rest_framework import serializers

from .models import Program


class ProgramListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for public program listings."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'audience_levels', 'status',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'image_url', 'display_order',
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


class ProgramDetailSerializer(serializers.ModelSerializer):
    """Full serializer for public program detail view."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'overview_en', 'overview_ar',
            'audience_levels', 'status',
            'modules_en', 'modules_ar',
            'skills_en', 'skills_ar',
            'learning_outcomes_en', 'learning_outcomes_ar',
            'practical_project_en', 'practical_project_ar',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'schedule_en', 'schedule_ar',
            'cta_text_en', 'cta_text_ar',
            'image_url', 'display_order',
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
