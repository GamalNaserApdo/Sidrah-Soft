"""CMS serializers for the case_studies app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field
from apps.core.seo_validation import (
    validate_seo_title,
    validate_seo_description,
    validate_og_title,
    validate_og_description,
    validate_canonical_url,
)
from apps.services.models import Service

from .models import CaseStudy


class CMSCaseStudyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for case study list views."""

    featured_image_url = serializers.SerializerMethodField()
    partner_name = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudy
        fields = [
            'id', 'title_en', 'title_ar', 'slug',
            'is_active', 'is_featured', 'show_on_homepage',
            'display_order', 'featured_image_url', 'partner_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_featured_image_url(self, obj):
        if obj.featured_image and obj.featured_image.file:
            request = self.context.get('request')
            url = obj.featured_image.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_partner_name(self, obj):
        if obj.partner:
            return obj.partner.name_en
        return None


class CMSCaseStudyDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for case study retrieve."""

    featured_image = MediaAssetReferenceSerializer(read_only=True)
    logo = MediaAssetReferenceSerializer(read_only=True)
    og_image = MediaAssetReferenceSerializer(read_only=True)
    services = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudy
        fields = [
            'id',
            'title_en', 'title_ar', 'slug',
            'short_description_en', 'short_description_ar',
            'problem_en', 'problem_ar',
            'solution_en', 'solution_ar',
            'technology_en', 'technology_ar',
            'outcome_en', 'outcome_ar',
            'featured_image', 'logo',
            'partner', 'services',
            'client_name_en', 'client_name_ar',
            'industry_en', 'industry_ar',
            'project_url', 'open_in_new_tab', 'project_year',
            'display_order',
            'is_active', 'is_featured', 'show_on_homepage',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
            'canonical_url',
            'og_title_en', 'og_title_ar',
            'og_description_en', 'og_description_ar',
            'og_image',
            'robots_index', 'robots_follow',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_services(self, obj):
        return [{'id': s.id, 'name_en': s.name_en} for s in obj.services.all()]


class CMSCaseStudyWriteSerializer(serializers.ModelSerializer):
    """Write serializer for case study create/update."""

    featured_image = media_asset_field()
    logo = media_asset_field()
    og_image = media_asset_field()
    services = serializers.PrimaryKeyRelatedField(
        many=True, read_only=False, queryset=Service.objects.all(), required=False
    )

    class Meta:
        model = CaseStudy
        fields = [
            'title_en', 'title_ar', 'slug',
            'short_description_en', 'short_description_ar',
            'problem_en', 'problem_ar',
            'solution_en', 'solution_ar',
            'technology_en', 'technology_ar',
            'outcome_en', 'outcome_ar',
            'featured_image', 'logo',
            'partner', 'services',
            'client_name_en', 'client_name_ar',
            'industry_en', 'industry_ar',
            'project_url', 'open_in_new_tab', 'project_year',
            'display_order',
            'is_active', 'is_featured', 'show_on_homepage',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
            'canonical_url',
            'og_title_en', 'og_title_ar',
            'og_description_en', 'og_description_ar',
            'og_image',
            'robots_index', 'robots_follow',
        ]

    def validate_seo_title_en(self, value):
        return validate_seo_title(value)

    def validate_seo_title_ar(self, value):
        return validate_seo_title(value)

    def validate_seo_description_en(self, value):
        return validate_seo_description(value)

    def validate_seo_description_ar(self, value):
        return validate_seo_description(value)

    def validate_og_title_en(self, value):
        return validate_og_title(value)

    def validate_og_title_ar(self, value):
        return validate_og_title(value)

    def validate_og_description_en(self, value):
        return validate_og_description(value)

    def validate_og_description_ar(self, value):
        return validate_og_description(value)

    def validate_canonical_url(self, value):
        return validate_canonical_url(value)
