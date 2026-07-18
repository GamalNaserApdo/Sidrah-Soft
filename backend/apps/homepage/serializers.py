"""Public serializers for the homepage app — safe, presentation-only data."""
from rest_framework import serializers

from apps.media_library.models import MediaAsset

from .models import HomepageSettings, MarqueeItem, Industry, HomepageSectionConfig


def _media_url(asset):
    if asset and asset.file:
        return asset.file.url
    return None


class PublicMarqueeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarqueeItem
        fields = ['id', 'title_en', 'title_ar', 'description_en', 'description_ar', 'display_order']
        read_only_fields = fields


class PublicIndustrySerializer(serializers.ModelSerializer):
    icon_url = serializers.SerializerMethodField()

    class Meta:
        model = Industry
        fields = ['id', 'title_en', 'title_ar', 'description_en', 'description_ar',
                  'focus_areas_en', 'focus_areas_ar', 'icon_url', 'display_order']
        read_only_fields = fields

    def get_icon_url(self, obj):
        return _media_url(obj.icon)


class PublicSectionConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageSectionConfig
        fields = ['section_key', 'display_order', 'is_visible']
        read_only_fields = fields


class PublicHomepageSerializer(serializers.Serializer):
    """Combined public homepage configuration — single API response."""

    hero = serializers.SerializerMethodField()
    foundation = serializers.SerializerMethodField()
    marquee = serializers.SerializerMethodField()
    industries = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()

    # Section heading overrides
    headings = serializers.SerializerMethodField()

    def get_hero(self, obj):
        settings = obj
        if not settings:
            return None
        return {
            'enabled': settings.hero_enabled,
            'show_location_card': settings.hero_show_location_card,
        }

    def get_foundation(self, obj):
        settings = obj
        if not settings:
            return None
        return {
            'enabled': settings.foundation_enabled,
            'eyebrow_en': settings.foundation_eyebrow_en,
            'eyebrow_ar': settings.foundation_eyebrow_ar,
            'heading_en': settings.foundation_heading_en,
            'heading_ar': settings.foundation_heading_ar,
            'description_en': settings.foundation_description_en,
            'description_ar': settings.foundation_description_ar,
            'proof_points_en': settings.foundation_proof_points_en or [],
            'proof_points_ar': settings.foundation_proof_points_ar or [],
            'cta_label_en': settings.foundation_cta_label_en,
            'cta_label_ar': settings.foundation_cta_label_ar,
            'cta_target': settings.foundation_cta_target,
        }

    def get_marquee(self, obj):
        items = MarqueeItem.objects.filter(is_visible=True).order_by('display_order', 'id')
        settings = obj
        return {
            'heading_en': settings.marquee_heading_en if settings else '',
            'heading_ar': settings.marquee_heading_ar if settings else '',
            'items': PublicMarqueeItemSerializer(items, many=True).data,
        }

    def get_industries(self, obj):
        items = Industry.objects.filter(is_visible=True).order_by('display_order', 'id')
        settings = obj
        return {
            'heading_en': settings.industries_heading_en if settings else '',
            'heading_ar': settings.industries_heading_ar if settings else '',
            'description_en': settings.industries_description_en if settings else '',
            'description_ar': settings.industries_description_ar if settings else '',
            'items': PublicIndustrySerializer(items, many=True).data,
        }

    def get_sections(self, obj):
        configs = HomepageSectionConfig.objects.all().order_by('display_order', 'id')
        return PublicSectionConfigSerializer(configs, many=True).data

    def get_headings(self, obj):
        settings = obj
        if not settings:
            return {}
        return {
            'partners': {
                'heading_en': settings.partners_heading_en,
                'heading_ar': settings.partners_heading_ar,
                'description_en': settings.partners_description_en,
                'description_ar': settings.partners_description_ar,
            },
            'case_studies': {
                'heading_en': settings.case_studies_heading_en,
                'heading_ar': settings.case_studies_heading_ar,
                'description_en': settings.case_studies_description_en,
                'description_ar': settings.case_studies_description_ar,
            },
            'insights': {
                'heading_en': settings.insights_heading_en,
                'heading_ar': settings.insights_heading_ar,
                'description_en': settings.insights_description_en,
                'description_ar': settings.insights_description_ar,
            },
            'careers': {
                'heading_en': settings.careers_heading_en,
                'heading_ar': settings.careers_heading_ar,
                'description_en': settings.careers_description_en,
                'description_ar': settings.careers_description_ar,
            },
        }
