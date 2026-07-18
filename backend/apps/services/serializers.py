"""Public serializers for the services API."""
from rest_framework import serializers

from apps.media_library.models import MediaAsset

from .models import Service


class ServiceMediaAssetSerializer(serializers.ModelSerializer):
    """Public representation of a MediaAsset used for a service."""

    url = serializers.SerializerMethodField()
    alt_text = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ['id', 'url', 'alt_text']

    def get_url(self, obj):
        if obj and obj.file:
            request = self.context.get('request')
            url = obj.file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_alt_text(self, obj):
        value = obj.alt_text if obj else ''
        return {
            'en': value,
            'ar': value or '',
        }


class ServiceSerializer(serializers.ModelSerializer):
    """Public, frontend-friendly representation of a service."""

    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()
    cta = serializers.SerializerMethodField()
    seo = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id',
            'slug',
            'name',
            'short_description',
            'description',
            'icon',
            'featured_image',
            'cta',
            'seo',
            'display_order',
            'is_featured',
            'show_on_homepage',
        ]

    def get_name(self, obj):
        return {
            'en': obj.name_en,
            'ar': obj.name_ar or obj.name_en,
        }

    def get_short_description(self, obj):
        return {
            'en': obj.short_description_en,
            'ar': obj.short_description_ar or obj.short_description_en,
        }

    def get_description(self, obj):
        return {
            'en': obj.description_en,
            'ar': obj.description_ar or obj.description_en,
        }

    def get_icon(self, obj):
        if obj.icon:
            return ServiceMediaAssetSerializer(
                obj.icon,
                context=self.context,
            ).data
        return None

    def get_featured_image(self, obj):
        if obj.featured_image:
            return ServiceMediaAssetSerializer(
                obj.featured_image,
                context=self.context,
            ).data
        return None

    def get_cta(self, obj):
        return {
            'label': {
                'en': obj.cta_label_en,
                'ar': obj.cta_label_ar or obj.cta_label_en,
            },
            'url': obj.cta_url,
        }

    def get_seo(self, obj):
        return {
            'title': {
                'en': obj.seo_title_en,
                'ar': obj.seo_title_ar or obj.seo_title_en,
            },
            'description': {
                'en': obj.seo_description_en,
                'ar': obj.seo_description_ar or obj.seo_description_en,
            },
        }
