"""CMS serializers for the services app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field

from .models import Service


class CMSServiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for service list views."""

    icon_url = serializers.SerializerMethodField()
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'name_en', 'name_ar', 'slug',
            'is_active', 'is_featured', 'show_on_homepage',
            'display_order', 'icon_url', 'featured_image_url',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def _get_media_url(self, obj, field_name):
        media = getattr(obj, field_name)
        if media and media.file:
            request = self.context.get('request')
            url = media.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_icon_url(self, obj):
        return self._get_media_url(obj, 'icon')

    def get_featured_image_url(self, obj):
        return self._get_media_url(obj, 'featured_image')


class CMSServiceDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for service retrieve."""

    icon = MediaAssetReferenceSerializer(read_only=True)
    featured_image = MediaAssetReferenceSerializer(read_only=True)

    class Meta:
        model = Service
        fields = [
            'id',
            'name_en', 'name_ar', 'slug',
            'short_description_en', 'short_description_ar',
            'description_en', 'description_ar',
            'icon', 'featured_image',
            'display_order',
            'is_active', 'is_featured', 'show_on_homepage',
            'cta_label_en', 'cta_label_ar', 'cta_url',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CMSServiceWriteSerializer(serializers.ModelSerializer):
    """Write serializer for service create/update."""

    icon = media_asset_field()
    featured_image = media_asset_field()

    class Meta:
        model = Service
        fields = [
            'name_en', 'name_ar', 'slug',
            'short_description_en', 'short_description_ar',
            'description_en', 'description_ar',
            'icon', 'featured_image',
            'display_order',
            'is_active', 'is_featured', 'show_on_homepage',
            'cta_label_en', 'cta_label_ar', 'cta_url',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
        ]
