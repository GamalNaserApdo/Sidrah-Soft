"""CMS serializers for the AI Automation page — full read/write."""
from rest_framework import serializers

from apps.core.seo_validation import clean_seo_text

from .models import (
    AIAutomationPage,
    AIAutomationItem,
    AIAutomationProcessStep,
    AIAutomationFAQ,
    ITEM_SECTION_CHOICES,
)


def _clean_text(value):
    if value:
        return clean_seo_text(value)
    return value


# Unsafe URI schemes that must never appear in CTA destinations.
_UNSAFE_SCHEMES = ('javascript:', 'data:', 'vbscript:', 'file:', 'about:')


def _validate_cta_destination(value):
    """Validate CTA destination — only safe internal paths/anchors or https/http URLs.

    Allowed:
      - Empty string (falls back to default)
      - Internal paths: /path, /#anchor
      - External URLs: http://... or https://...

    Rejected:
      - javascript:, data:, vbscript:, file:, about: and any other unsafe scheme
      - Malformed values that don't match allowed patterns
    """
    if not value:
        return value
    stripped = value.strip()
    lower = stripped.lower()
    # Reject unsafe schemes
    for scheme in _UNSAFE_SCHEMES:
        if lower.startswith(scheme):
            raise serializers.ValidationError(f'{scheme} URLs are not allowed in CTA destinations.')
    # Allow internal paths (starts with /)
    if stripped.startswith('/'):
        return stripped
    # Allow http/https URLs
    if lower.startswith('http://') or lower.startswith('https://'):
        return stripped
    # Reject everything else (relative paths without leading /, mailto:, tel:, etc.)
    raise serializers.ValidationError(
        'CTA destination must be an internal path (e.g. /#contact) or a valid http(s) URL.'
    )


class CMSAIAutomationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAutomationItem
        fields = [
            'id', 'section', 'title_en', 'title_ar',
            'description_en', 'description_ar',
            'display_order', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title_en(self, value):
        return _clean_text(value)

    def validate_title_ar(self, value):
        return _clean_text(value)

    def validate_description_en(self, value):
        return _clean_text(value)

    def validate_description_ar(self, value):
        return _clean_text(value)


class CMSAIAutomationProcessStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAutomationProcessStep
        fields = [
            'id', 'step_number', 'title_en', 'title_ar',
            'description_en', 'description_ar',
            'display_order', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title_en(self, value):
        return _clean_text(value)

    def validate_title_ar(self, value):
        return _clean_text(value)


class CMSAIAutomationFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAutomationFAQ
        fields = [
            'id', 'question_en', 'question_ar',
            'answer_en', 'answer_ar',
            'display_order', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_question_en(self, value):
        return _clean_text(value)

    def validate_question_ar(self, value):
        return _clean_text(value)

    def validate_answer_en(self, value):
        return _clean_text(value)

    def validate_answer_ar(self, value):
        return _clean_text(value)


class CMSAIAutomationPageSerializer(serializers.ModelSerializer):
    """Full CMS serializer for the AI Automation page singleton."""

    items = CMSAIAutomationItemSerializer(many=True, read_only=True)
    process_steps = CMSAIAutomationProcessStepSerializer(many=True, read_only=True)
    faqs = CMSAIAutomationFAQSerializer(many=True, read_only=True)

    class Meta:
        model = AIAutomationPage
        fields = [
            'id',
            # Hero
            'hero_eyebrow_en', 'hero_eyebrow_ar',
            'hero_title_en', 'hero_title_ar',
            'hero_subtitle_en', 'hero_subtitle_ar',
            'hero_cta_label_en', 'hero_cta_label_ar',
            'hero_cta_destination',
            'hero_secondary_cta_label_en', 'hero_secondary_cta_label_ar',
            'hero_secondary_cta_destination',
            # Problems
            'problems_section_title_en', 'problems_section_title_ar',
            'problems_section_desc_en', 'problems_section_desc_ar',
            # Solutions
            'solutions_section_title_en', 'solutions_section_title_ar',
            'solutions_section_desc_en', 'solutions_section_desc_ar',
            # Process
            'process_section_title_en', 'process_section_title_ar',
            'process_section_desc_en', 'process_section_desc_ar',
            # Use Cases
            'use_cases_section_title_en', 'use_cases_section_title_ar',
            'use_cases_section_desc_en', 'use_cases_section_desc_ar',
            # Why
            'why_section_title_en', 'why_section_title_ar',
            'why_section_desc_en', 'why_section_desc_ar',
            # FAQ
            'faq_section_title_en', 'faq_section_title_ar',
            # CTA
            'cta_title_en', 'cta_title_ar',
            'cta_text_en', 'cta_text_ar',
            'cta_button_label_en', 'cta_button_label_ar',
            'cta_button_destination',
            # Nested
            'items', 'process_steps', 'faqs',
            # Meta
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_hero_title_en(self, value):
        return _clean_text(value)

    def validate_hero_title_ar(self, value):
        return _clean_text(value)

    def validate_hero_cta_destination(self, value):
        return _validate_cta_destination(value)

    def validate_hero_secondary_cta_destination(self, value):
        return _validate_cta_destination(value)

    def validate_cta_button_destination(self, value):
        return _validate_cta_destination(value)
