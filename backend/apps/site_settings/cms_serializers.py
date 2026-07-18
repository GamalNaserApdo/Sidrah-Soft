"""CMS serializers for the site_settings app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field
from apps.core.seo_validation import (
    validate_twitter_card_type,
    validate_canonical_url,
    clean_seo_text,
)
from apps.media_library.models import MediaAsset

from .models import SiteSetting


class CMSSiteSettingSerializer(serializers.ModelSerializer):
    """Full CMS serializer for site settings (read + write)."""

    # Read-only nested media references
    default_og_image = MediaAssetReferenceSerializer(read_only=True)
    primary_logo = MediaAssetReferenceSerializer(read_only=True)
    secondary_logo = MediaAssetReferenceSerializer(read_only=True)
    favicon = MediaAssetReferenceSerializer(read_only=True)

    # Write-only media ID fields
    default_og_image_id = media_asset_field('default_og_image')
    primary_logo_id = media_asset_field('primary_logo')
    secondary_logo_id = media_asset_field('secondary_logo')
    favicon_id = media_asset_field('favicon')

    class Meta:
        model = SiteSetting
        fields = [
            'id',
            'site_name', 'site_tagline', 'default_language', 'supported_languages',
            'contact_email', 'recipient_email', 'phone',
            'whatsapp_url', 'telegram_url',
            'facebook_url', 'linkedin_url', 'instagram_url', 'youtube_url', 'x_url',
            'address', 'google_maps_url', 'map_embed_url',
            'latitude', 'longitude', 'working_hours',
            'default_meta_title', 'default_meta_description',
            'default_og_title', 'default_og_description',
            'default_og_image', 'default_og_image_id',
            'twitter_card_type', 'canonical_base_url',
            'robots_index', 'organization_description',
            'primary_logo', 'primary_logo_id',
            'secondary_logo', 'secondary_logo_id',
            'favicon', 'favicon_id',
            'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_twitter_card_type(self, value):
        return validate_twitter_card_type(value)

    def validate_canonical_base_url(self, value):
        return validate_canonical_url(value)

    def validate_default_og_title(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_default_og_description(self, value):
        if value:
            return clean_seo_text(value)
        return value

    def validate_organization_description(self, value):
        if value:
            return clean_seo_text(value)
        return value
