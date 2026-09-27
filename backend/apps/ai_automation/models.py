"""AI Automation page content models.

Dedicated architecture for the AI Automation public page.
The page has 6 unique sections (hero, problems, solutions, process, use cases,
why, FAQ, CTA) that do not fit the generic Service model.

Architecture:
- AIAutomationPage: singleton with hero, section headers, and CTA fields
- AIAutomationItem: repeatable cards for problems, solutions, use_cases, why
- AIAutomationProcessStep: ordered process steps
- AIAutomationFAQ: ordered FAQ items

All models support EN/AR bilingual content, display_order, and is_active visibility.
"""
from django.db import models

from apps.core.models import TimeStampedModel


# Section keys for AIAutomationItem — controlled allowlist
ITEM_SECTION_CHOICES = [
    ('problems', 'Problems'),
    ('solutions', 'Solutions'),
    ('use_cases', 'Use Cases'),
    ('why', 'Why Us'),
]

ITEM_SECTION_VALUES = {key for key, _ in ITEM_SECTION_CHOICES}


class AIAutomationPage(TimeStampedModel):
    """Singleton AI Automation page settings — hero, section headers, CTA."""

    # Hero
    hero_eyebrow_en = models.CharField(max_length=80, blank=True)
    hero_eyebrow_ar = models.CharField(max_length=80, blank=True)
    hero_title_en = models.CharField(max_length=200, blank=True)
    hero_title_ar = models.CharField(max_length=200, blank=True)
    hero_subtitle_en = models.TextField(blank=True)
    hero_subtitle_ar = models.TextField(blank=True)
    hero_cta_label_en = models.CharField(max_length=60, blank=True)
    hero_cta_label_ar = models.CharField(max_length=60, blank=True)
    hero_cta_destination = models.CharField(
        max_length=255, blank=True,
        help_text='Internal path (e.g. /#contact) or external URL.',
    )
    hero_secondary_cta_label_en = models.CharField(max_length=60, blank=True)
    hero_secondary_cta_label_ar = models.CharField(max_length=60, blank=True)
    hero_secondary_cta_destination = models.CharField(max_length=255, blank=True)

    # Problems section
    problems_section_title_en = models.CharField(max_length=200, blank=True)
    problems_section_title_ar = models.CharField(max_length=200, blank=True)
    problems_section_desc_en = models.TextField(blank=True)
    problems_section_desc_ar = models.TextField(blank=True)

    # Solutions section
    solutions_section_title_en = models.CharField(max_length=200, blank=True)
    solutions_section_title_ar = models.CharField(max_length=200, blank=True)
    solutions_section_desc_en = models.TextField(blank=True)
    solutions_section_desc_ar = models.TextField(blank=True)

    # Process section
    process_section_title_en = models.CharField(max_length=200, blank=True)
    process_section_title_ar = models.CharField(max_length=200, blank=True)
    process_section_desc_en = models.TextField(blank=True)
    process_section_desc_ar = models.TextField(blank=True)

    # Use Cases section
    use_cases_section_title_en = models.CharField(max_length=200, blank=True)
    use_cases_section_title_ar = models.CharField(max_length=200, blank=True)
    use_cases_section_desc_en = models.TextField(blank=True)
    use_cases_section_desc_ar = models.TextField(blank=True)

    # Why section
    why_section_title_en = models.CharField(max_length=200, blank=True)
    why_section_title_ar = models.CharField(max_length=200, blank=True)
    why_section_desc_en = models.TextField(blank=True)
    why_section_desc_ar = models.TextField(blank=True)

    # FAQ section
    faq_section_title_en = models.CharField(max_length=200, blank=True)
    faq_section_title_ar = models.CharField(max_length=200, blank=True)

    # Final CTA
    cta_title_en = models.CharField(max_length=200, blank=True)
    cta_title_ar = models.CharField(max_length=200, blank=True)
    cta_text_en = models.TextField(blank=True)
    cta_text_ar = models.TextField(blank=True)
    cta_button_label_en = models.CharField(max_length=60, blank=True)
    cta_button_label_ar = models.CharField(max_length=60, blank=True)
    cta_button_destination = models.CharField(max_length=255, blank=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ai_automation_aiautomationpage'
        verbose_name = 'AI Automation Page'
        verbose_name_plural = 'AI Automation Page'

    def __str__(self):
        return 'AI Automation Page'

    def save(self, *args, **kwargs):
        if self.is_active:
            AIAutomationPage.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_current(cls):
        setting = cls.objects.filter(is_active=True).first()
        if not setting:
            setting = cls.objects.first()
        return setting


class AIAutomationItem(TimeStampedModel):
    """Repeatable card for problems, solutions, use_cases, and why sections."""

    page = models.ForeignKey(
        AIAutomationPage,
        related_name='items',
        on_delete=models.CASCADE,
    )
    section = models.CharField(
        max_length=30,
        choices=ITEM_SECTION_CHOICES,
        help_text='Which section this card belongs to.',
    )
    title_en = models.CharField(max_length=200, blank=True)
    title_ar = models.CharField(max_length=200, blank=True)
    description_en = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ai_automation_aiautomationitem'
        verbose_name = 'AI Automation Item'
        verbose_name_plural = 'AI Automation Items'
        ordering = ['section', 'display_order', 'id']

    def __str__(self):
        return f'{self.section}: {self.title_en}'

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.section and self.section not in ITEM_SECTION_VALUES:
            raise ValidationError({'section': f'Unknown section: {self.section}'})


class AIAutomationProcessStep(TimeStampedModel):
    """Ordered process step for the Process section."""

    page = models.ForeignKey(
        AIAutomationPage,
        related_name='process_steps',
        on_delete=models.CASCADE,
    )
    step_number = models.PositiveIntegerField(default=0)
    title_en = models.CharField(max_length=200, blank=True)
    title_ar = models.CharField(max_length=200, blank=True)
    description_en = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ai_automation_aiautomationprocessstep'
        verbose_name = 'AI Automation Process Step'
        verbose_name_plural = 'AI Automation Process Steps'
        ordering = ['display_order', 'id']

    def __str__(self):
        return f'Step {self.step_number}: {self.title_en}'


class AIAutomationFAQ(TimeStampedModel):
    """Ordered FAQ item for the FAQ section."""

    page = models.ForeignKey(
        AIAutomationPage,
        related_name='faqs',
        on_delete=models.CASCADE,
    )
    question_en = models.CharField(max_length=500, blank=True)
    question_ar = models.CharField(max_length=500, blank=True)
    answer_en = models.TextField(blank=True)
    answer_ar = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ai_automation_aiautomationfaq'
        verbose_name = 'AI Automation FAQ'
        verbose_name_plural = 'AI Automation FAQs'
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.question_en or str(self.id)
