"""CMS serializers for StaticPageSEO — full read/write with media references."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field
from apps.core.seo_validation import clean_seo_text

from .models import StaticPageSEO, STATIC_PAGE_CANONICAL_PATHS


class CMSStaticPageSEOSerializer(serializers.ModelSerializer):
    """CMS serializer for static page SEO — read + write."""

    og_image = MediaAssetReferenceSerializer(read_only=True)
    og_image_id = media_asset_field('og_image')
    canonical_path = serializers.SerializerMethodField()

    class Meta:
        model = StaticPageSEO
        fields = [
            'id',
            'page_key',
            'seo_title_en',
            'seo_title_ar',
            'meta_description_en',
            'meta_description_ar',
            'og_title_en',
            'og_title_ar',
            'og_description_en',
            'og_description_ar',
            'og_image',
            'og_image_id',
            'robots_index',
            'robots_follow',
            'canonical_path',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'page_key', 'canonical_path', 'created_at', 'updated_at']

    def get_canonical_path(self, obj):
        return STATIC_PAGE_CANONICAL_PATHS.get(obj.page_key, '/')

    def validate_seo_title_en(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_seo_title_ar(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_meta_description_en(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_meta_description_ar(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_og_title_en(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_og_title_ar(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_og_description_en(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_og_description_ar(self, value):
        if value:
            return clean_seo_text(value)
        return value
