"""CMS serializers for the homepage app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field

from .models import HomepageSettings, MarqueeItem, Industry, HomepageSectionConfig, SECTION_KEY_VALUES

# Canonical homepage training path keys — product paths, not arbitrary CMS cards.
# The homepage Training section renders exactly these three paths; Secondary/
# Baccalaureate is a separate product line and is deliberately excluded.
CANONICAL_TRAINING_PATH_KEYS = ('professional', 'starter', 'summer')

# Canonical destinations per training path key — system defaults that must not
# drift into unrelated routes when the homepage section links to each path.
CANONICAL_TRAINING_PATH_URLS = {
    'professional': '/training#professional-courses',
    'starter': '/training/starter',
    'summer': '/training/summer-training',
}


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

    def validate_training_cta_target(self, value):
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

    def validate_training_paths(self, value):
        """Validate the fixed training path cards.

        Protects the homepage Training architecture server-side:
        - Keys must be exactly the canonical product paths, without duplicates.
        - URLs must be safe internal paths (no javascript:/data:/external schemes).
        - Labels/descriptions/CTA labels must be bounded strings.
        """
        if not value:
            return value
        if not isinstance(value, list):
            raise serializers.ValidationError('Training paths must be a list.')
        if len(value) > 6:
            raise serializers.ValidationError('Training paths must contain at most 6 entries.')

        seen_keys = set()
        for entry in value:
            if not isinstance(entry, dict):
                raise serializers.ValidationError('Each training path must be an object.')
            key = entry.get('key')
            if key not in CANONICAL_TRAINING_PATH_KEYS:
                raise serializers.ValidationError(
                    f'Training path key must be one of {CANONICAL_TRAINING_PATH_KEYS} (got {key!r}).'
                )
            if key in seen_keys:
                raise serializers.ValidationError(f'Duplicate training path key: {key}.')
            seen_keys.add(key)

            url = entry.get('url', '')
            if not isinstance(url, str) or not url.startswith('/'):
                raise serializers.ValidationError(
                    f'Training path "{key}" URL must be an internal path starting with /.'
                )
            lowered = url.lower().strip()
            for scheme in ('javascript:', 'data:', 'vbscript:', 'file:', 'about:', '//'):
                if lowered.startswith(scheme):
                    raise serializers.ValidationError(
                        f'Training path "{key}" URL must not use {scheme}.'
                    )

            for field in ('label_en', 'label_ar', 'cta_label_en', 'cta_label_ar'):
                text = entry.get(field, '')
                if text and (not isinstance(text, str) or len(text) > 120):
                    raise serializers.ValidationError(
                        f'Training path "{key}" {field} must be a string of 120 characters or fewer.'
                    )
            for field in ('description_en', 'description_ar'):
                text = entry.get(field, '')
                if text and (not isinstance(text, str) or len(text) > 400):
                    raise serializers.ValidationError(
                        f'Training path "{key}" {field} must be a string of 400 characters or fewer.'
                    )
        return value

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
