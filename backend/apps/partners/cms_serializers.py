"""CMS serializers for the partners app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field

from .models import Partner


class CMSPartnerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for partner list views."""

    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Partner
        fields = [
            'id', 'name_en', 'name_ar', 'slug',
            'partner_type', 'display_order',
            'is_featured', 'is_active',
            'logo_url', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_logo_url(self, obj):
        if obj.logo and obj.logo.file:
            request = self.context.get('request')
            url = obj.logo.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class CMSPartnerDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for partner retrieve/update."""

    logo = MediaAssetReferenceSerializer(read_only=True)

    class Meta:
        model = Partner
        fields = [
            'id',
            'name_en', 'name_ar', 'slug',
            'description_en', 'description_ar',
            'logo',
            'website_url', 'open_in_new_tab',
            'partner_type', 'display_order',
            'is_featured', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CMSPartnerWriteSerializer(serializers.ModelSerializer):
    """Write serializer for partner create/update."""

    logo = media_asset_field()

    class Meta:
        model = Partner
        fields = [
            'name_en', 'name_ar', 'slug',
            'description_en', 'description_ar',
            'logo',
            'website_url', 'open_in_new_tab',
            'partner_type', 'display_order',
            'is_featured', 'is_active',
        ]
