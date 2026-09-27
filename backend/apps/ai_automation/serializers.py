"""Public serializers for the AI Automation page — safe, presentation-only data."""
from rest_framework import serializers

from .models import (
    AIAutomationPage,
    AIAutomationItem,
    AIAutomationProcessStep,
    AIAutomationFAQ,
    ITEM_SECTION_CHOICES,
)


class PublicAIAutomationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAutomationItem
        fields = ['id', 'section', 'title_en', 'title_ar', 'description_en', 'description_ar', 'display_order']
        read_only_fields = fields


class PublicAIAutomationProcessStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAutomationProcessStep
        fields = ['id', 'step_number', 'title_en', 'title_ar', 'description_en', 'description_ar', 'display_order']
        read_only_fields = fields


class PublicAIAutomationFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAutomationFAQ
        fields = ['id', 'question_en', 'question_ar', 'answer_en', 'answer_ar', 'display_order']
        read_only_fields = fields


class PublicAIAutomationPageSerializer(serializers.Serializer):
    """Combined public AI Automation page content — single API response."""

    hero = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    process_steps = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    cta = serializers.SerializerMethodField()

    def get_hero(self, obj):
        if not obj:
            return None
        return {
            'eyebrow_en': obj.hero_eyebrow_en,
            'eyebrow_ar': obj.hero_eyebrow_ar,
            'title_en': obj.hero_title_en,
            'title_ar': obj.hero_title_ar,
            'subtitle_en': obj.hero_subtitle_en,
            'subtitle_ar': obj.hero_subtitle_ar,
            'cta_label_en': obj.hero_cta_label_en,
            'cta_label_ar': obj.hero_cta_label_ar,
            'cta_destination': obj.hero_cta_destination,
            'secondary_cta_label_en': obj.hero_secondary_cta_label_en,
            'secondary_cta_label_ar': obj.hero_secondary_cta_label_ar,
            'secondary_cta_destination': obj.hero_secondary_cta_destination,
        }

    def get_sections(self, obj):
        if not obj:
            return {}
        return {
            'problems': {
                'title_en': obj.problems_section_title_en,
                'title_ar': obj.problems_section_title_ar,
                'desc_en': obj.problems_section_desc_en,
                'desc_ar': obj.problems_section_desc_ar,
            },
            'solutions': {
                'title_en': obj.solutions_section_title_en,
                'title_ar': obj.solutions_section_title_ar,
                'desc_en': obj.solutions_section_desc_en,
                'desc_ar': obj.solutions_section_desc_ar,
            },
            'process': {
                'title_en': obj.process_section_title_en,
                'title_ar': obj.process_section_title_ar,
                'desc_en': obj.process_section_desc_en,
                'desc_ar': obj.process_section_desc_ar,
            },
            'use_cases': {
                'title_en': obj.use_cases_section_title_en,
                'title_ar': obj.use_cases_section_title_ar,
                'desc_en': obj.use_cases_section_desc_en,
                'desc_ar': obj.use_cases_section_desc_ar,
            },
            'why': {
                'title_en': obj.why_section_title_en,
                'title_ar': obj.why_section_title_ar,
                'desc_en': obj.why_section_desc_en,
                'desc_ar': obj.why_section_desc_ar,
            },
            'faq': {
                'title_en': obj.faq_section_title_en,
                'title_ar': obj.faq_section_title_ar,
            },
        }

    def get_items(self, obj):
        if not obj:
            return []
        items = AIAutomationItem.objects.filter(is_active=True).order_by('section', 'display_order', 'id')
        return PublicAIAutomationItemSerializer(items, many=True).data

    def get_process_steps(self, obj):
        if not obj:
            return []
        steps = AIAutomationProcessStep.objects.filter(is_active=True).order_by('display_order', 'id')
        return PublicAIAutomationProcessStepSerializer(steps, many=True).data

    def get_faqs(self, obj):
        if not obj:
            return []
        faqs = AIAutomationFAQ.objects.filter(is_active=True).order_by('display_order', 'id')
        return PublicAIAutomationFAQSerializer(faqs, many=True).data

    def get_cta(self, obj):
        if not obj:
            return None
        return {
            'title_en': obj.cta_title_en,
            'title_ar': obj.cta_title_ar,
            'text_en': obj.cta_text_en,
            'text_ar': obj.cta_text_ar,
            'button_label_en': obj.cta_button_label_en,
            'button_label_ar': obj.cta_button_label_ar,
            'button_destination': obj.cta_button_destination,
        }
