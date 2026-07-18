"""CMS serializers for the homepage app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field

from .models import HomepageSettings, MarqueeItem, Industry, HomepageSectionConfig, SECTION_KEY_VALUES


class CMSHomepageSettingsSerializer(serializers.ModelSerializer):
    """CMS read/write serializer for HomepageSettings singleton."""

    hero_media = MediaAssetReferenceSerializer(read_only=True)
    hero_media_id = media_asset_field('hero_media')

    class Meta:
        model = HomepageSettings
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_active')

    def validate_hero_primary_cta_target(self, value):
        return self._validate_cta_target(value)

    def validate_hero_secondary_cta_target(self, value):
        return self._validate_cta_target(value)

    def validate_foundation_cta_target(self, value):
        return self._validate_cta_target(value)

    def _validate_cta_target(self, value):
        if not value:
            return value
        import re
        lowered = value.lower().strip()
        rejected_schemes = ('javascript:', 'data:', 'vbscript:', 'file:')
        for scheme in rejected_schemes:
            if lowered.startswith(scheme):
                raise serializers.ValidationError(
                    f'CTA target must not use {scheme} scheme.'
                )
        if lowered.startswith('//'):
            raise serializers.ValidationError(
                'CTA target must not use protocol-relative URLs.'
            )
        if re.search(r'[\x00-\x1f\x7f]', value):
            raise serializers.ValidationError(
                'CTA target must not contain control characters.'
            )
        if lowered.startswith('#') or lowered.startswith('/') or lowered.startswith('mailto:') or lowered.startswith('tel:'):
            return value
        if lowered.startswith('https://') or lowered.startswith('http://'):
            return value
        raise serializers.ValidationError(
            'CTA target must be an internal anchor (#), internal path (/), '
            'mailto:, tel:, or https:// URL.'
        )

    def validate_foundation_proof_points_en(self, value):
        return self._validate_proof_points(value)

    def validate_foundation_proof_points_ar(self, value):
        return self._validate_proof_points(value)

    def _validate_proof_points(self, value):
        if not value:
            return value
        if not isinstance(value, list):
            raise serializers.ValidationError('Must be a list of strings.')
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError('Each proof point must be a string.')
            if len(item) > 200:
                raise serializers.ValidationError('Each proof point must be 200 characters or fewer.')
        return value


class CMSMarqueeItemSerializer(serializers.ModelSerializer):
    """CMS read/write serializer for MarqueeItem."""

    class Meta:
        model = MarqueeItem
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class CMSIndustrySerializer(serializers.ModelSerializer):
    """CMS read/write serializer for Industry."""

    icon = MediaAssetReferenceSerializer(read_only=True)
    icon_id = media_asset_field('icon')

    class Meta:
        model = Industry
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_focus_areas_en(self, value):
        return self._validate_focus_areas(value)

    def validate_focus_areas_ar(self, value):
        return self._validate_focus_areas(value)

    def _validate_focus_areas(self, value):
        if not value:
            return value
        if not isinstance(value, list):
            raise serializers.ValidationError('Must be a list of strings.')
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError('Each focus area must be a string.')
            if len(item) > 120:
                raise serializers.ValidationError('Each focus area must be 120 characters or fewer.')
        return value


class CMSHomepageSectionConfigSerializer(serializers.ModelSerializer):
    """CMS read/write serializer for HomepageSectionConfig."""

    class Meta:
        model = HomepageSectionConfig
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance is not None:
            self.fields['section_key'].read_only = True

    def validate_section_key(self, value):
        if value not in SECTION_KEY_VALUES:
            raise serializers.ValidationError(
                f'Unknown section key: {value}. Allowed: {", ".join(sorted(SECTION_KEY_VALUES))}.'
            )
        return value
