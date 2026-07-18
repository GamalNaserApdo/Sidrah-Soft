"""CMS serializers for the insights app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field
from apps.core.seo_validation import (
    validate_seo_title,
    validate_seo_description,
    validate_og_title,
    validate_og_description,
    validate_canonical_url,
)

from .models import Article


class CMSArticleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for article list views."""

    class Meta:
        model = Article
        fields = [
            'id', 'title_en', 'title_ar', 'slug',
            'content_type', 'status', 'published_at',
            'is_featured', 'show_on_homepage', 'display_order',
            'category_en', 'category_ar',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class CMSArticleDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for article retrieve."""

    featured_image = MediaAssetReferenceSerializer(read_only=True)
    og_image = MediaAssetReferenceSerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            'id',
            'title_en', 'title_ar', 'slug',
            'content_type',
            'excerpt_en', 'excerpt_ar',
            'body_en', 'body_ar',
            'category_en', 'category_ar',
            'author_name_en', 'author_name_ar',
            'featured_image',
            'status', 'published_at',
            'is_featured', 'show_on_homepage', 'display_order',
            'read_time_minutes',
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


class CMSArticleWriteSerializer(serializers.ModelSerializer):
    """Write serializer for article create/update."""

    featured_image = media_asset_field()
    og_image = media_asset_field()

    class Meta:
        model = Article
        fields = [
            'title_en', 'title_ar', 'slug',
            'content_type',
            'excerpt_en', 'excerpt_ar',
            'body_en', 'body_ar',
            'category_en', 'category_ar',
            'author_name_en', 'author_name_ar',
            'featured_image',
            'status', 'published_at',
            'is_featured', 'show_on_homepage', 'display_order',
            'read_time_minutes',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
            'canonical_url',
            'og_title_en', 'og_title_ar',
            'og_description_en', 'og_description_ar',
            'og_image',
            'robots_index', 'robots_follow',
        ]
        read_only_fields = ['status', 'published_at']

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
