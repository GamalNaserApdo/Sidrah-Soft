from rest_framework import serializers

from apps.media_library.models import MediaAsset

from .models import Partner


class PartnerLogoSerializer(serializers.ModelSerializer):
    """Public representation of a partner logo MediaAsset."""

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


class PartnerSerializer(serializers.ModelSerializer):
    """Public, frontend-friendly representation of a partner."""

    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Partner
        fields = [
            'id',
            'slug',
            'name',
            'description',
            'partner_type',
            'logo',
            'website_url',
            'open_in_new_tab',
            'is_featured',
            'display_order',
        ]

    def get_name(self, obj):
        return {
            'en': obj.name_en,
            'ar': obj.name_ar or obj.name_en,
        }

    def get_description(self, obj):
        return {
            'en': obj.description_en,
            'ar': obj.description_ar or obj.description_en,
        }

    def get_logo(self, obj):
        if obj.logo:
            return PartnerLogoSerializer(
                obj.logo,
                context=self.context,
            ).data
        return None
