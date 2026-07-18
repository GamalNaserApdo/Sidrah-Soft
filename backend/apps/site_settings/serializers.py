from rest_framework import serializers

from .models import SiteSetting


def media_url(asset):
    """Return the absolute URL of a media asset, or None."""
    if asset and asset.file:
        return asset.file.url
    return None


class SiteSettingSerializer(serializers.ModelSerializer):
    """Public, frontend-friendly representation of site settings."""

    # General
    supported_languages = serializers.ListField(read_only=True)

    # SEO
    default_og_image_url = serializers.SerializerMethodField()

    # Branding
    primary_logo_url = serializers.SerializerMethodField()
    secondary_logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSetting
        fields = [
            'site_name',
            'site_tagline',
            'default_language',
            'supported_languages',
            'contact_email',
            'phone',
            'whatsapp_url',
            'telegram_url',
            'facebook_url',
            'linkedin_url',
            'instagram_url',
            'youtube_url',
            'x_url',
            'address',
            'google_maps_url',
            'map_embed_url',
            'latitude',
            'longitude',
            'working_hours',
            'default_meta_title',
            'default_meta_description',
            'default_og_title',
            'default_og_description',
            'default_og_image_url',
            'twitter_card_type',
            'canonical_base_url',
            'robots_index',
            'organization_description',
            'primary_logo_url',
            'secondary_logo_url',
            'favicon_url',
        ]

    def get_default_og_image_url(self, obj):
        return media_url(obj.default_og_image)

    def get_primary_logo_url(self, obj):
        return media_url(obj.primary_logo)

    def get_secondary_logo_url(self, obj):
        return media_url(obj.secondary_logo)

    def get_favicon_url(self, obj):
        return media_url(obj.favicon)

    def to_representation(self, instance):
        flat = super().to_representation(instance)
        return {
            'general': {
                'site_name': flat['site_name'],
                'site_tagline': flat['site_tagline'],
                'default_language': flat['default_language'],
                'supported_languages': flat['supported_languages'],
            },
            'contact': {
                'contact_email': flat['contact_email'],
                'phone': flat['phone'],
                'whatsapp_url': flat['whatsapp_url'],
                'telegram_url': flat['telegram_url'],
            },
            'social': {
                'facebook_url': flat['facebook_url'],
                'linkedin_url': flat['linkedin_url'],
                'instagram_url': flat['instagram_url'],
                'youtube_url': flat['youtube_url'],
                'x_url': flat['x_url'],
            },
            'location': {
                'address': flat['address'],
                'google_maps_url': flat['google_maps_url'],
                'map_embed_url': flat['map_embed_url'],
                'latitude': flat['latitude'],
                'longitude': flat['longitude'],
                'working_hours': flat['working_hours'],
            },
            'seo': {
                'default_meta_title': flat['default_meta_title'],
                'default_meta_description': flat['default_meta_description'],
                'default_og_title': flat['default_og_title'],
                'default_og_description': flat['default_og_description'],
                'default_og_image_url': flat['default_og_image_url'],
                'twitter_card_type': flat['twitter_card_type'],
                'canonical_base_url': flat['canonical_base_url'],
                'robots_index': flat['robots_index'],
                'organization_description': flat['organization_description'],
            },
            'branding': {
                'primary_logo_url': flat['primary_logo_url'],
                'secondary_logo_url': flat['secondary_logo_url'],
                'favicon_url': flat['favicon_url'],
            },
        }
