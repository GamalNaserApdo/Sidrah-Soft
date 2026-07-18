"""CMS serializers for the careers app."""
from rest_framework import serializers

from .models import Job


class CMSJobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job list views."""

    class Meta:
        model = Job
        fields = [
            'id', 'title_en', 'title_ar', 'slug',
            'department_en', 'department_ar',
            'location_en', 'location_ar',
            'employment_type', 'workplace_type', 'experience_level',
            'posted_date', 'closing_date',
            'is_active', 'is_featured', 'show_on_homepage',
            'display_order',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class CMSJobDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for job retrieve."""

    class Meta:
        model = Job
        fields = [
            'id',
            'title_en', 'title_ar', 'slug',
            'department_en', 'department_ar',
            'location_en', 'location_ar',
            'employment_type', 'workplace_type', 'experience_level',
            'short_description_en', 'short_description_ar',
            'description_en', 'description_ar',
            'responsibilities_en', 'responsibilities_ar',
            'requirements_en', 'requirements_ar',
            'preferred_qualifications_en', 'preferred_qualifications_ar',
            'benefits_en', 'benefits_ar',
            'application_method',
            'external_apply_url', 'application_email',
            'posted_date', 'closing_date',
            'display_order',
            'is_active', 'is_featured', 'show_on_homepage',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CMSJobWriteSerializer(serializers.ModelSerializer):
    """Write serializer for job create/update."""

    class Meta:
        model = Job
        fields = [
            'title_en', 'title_ar', 'slug',
            'department_en', 'department_ar',
            'location_en', 'location_ar',
            'employment_type', 'workplace_type', 'experience_level',
            'short_description_en', 'short_description_ar',
            'description_en', 'description_ar',
            'responsibilities_en', 'responsibilities_ar',
            'requirements_en', 'requirements_ar',
            'preferred_qualifications_en', 'preferred_qualifications_ar',
            'benefits_en', 'benefits_ar',
            'application_method',
            'external_apply_url', 'application_email',
            'posted_date', 'closing_date',
            'display_order',
            'is_active', 'is_featured', 'show_on_homepage',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
        ]

    def validate(self, attrs):
        """Validate application method consistency."""
        method = attrs.get('application_method', getattr(self.instance, 'application_method', None))
        ext_url = attrs.get('external_apply_url', getattr(self.instance, 'external_apply_url', None))
        app_email = attrs.get('application_email', getattr(self.instance, 'application_email', None))

        if method == 'external_url' and not ext_url:
            raise serializers.ValidationError({
                'external_apply_url': 'This field is required when application_method is "external_url".'
            })
        if method == 'email' and not app_email:
            raise serializers.ValidationError({
                'application_email': 'This field is required when application_method is "email".'
            })
        return attrs
