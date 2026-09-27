"""Public serializer for StaticPageSEO — frontend-friendly, safe data only."""
from rest_framework import serializers

from .models import StaticPageSEO, STATIC_PAGE_CANONICAL_PATHS


def _media_url(asset):
    if asset and asset.file:
        return asset.file.url
    return None


class StaticPageSEOSerializer(serializers.ModelSerializer):
    """Public representation of static page SEO metadata."""

    og_image_url = serializers.SerializerMethodField()
    canonical_path = serializers.SerializerMethodField()

    class Meta:
        model = StaticPageSEO
        fields = [
            'page_key',
            'seo_title_en',
            'seo_title_ar',
            'meta_description_en',
            'meta_description_ar',
            'og_title_en',
            'og_title_ar',
            'og_description_en',
            'og_description_ar',
            'og_image_url',
            'robots_index',
            'robots_follow',
            'canonical_path',
        ]
        read_only_fields = fields

    def get_og_image_url(self, obj):
        return _media_url(obj.og_image)

    def get_canonical_path(self, obj):
        return STATIC_PAGE_CANONICAL_PATHS.get(obj.page_key, '/')
