from django.db import models

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


class HomepageSettings(TimeStampedModel):
    """Singleton homepage presentation settings — hero, foundation, section headings."""

    # Hero
    hero_enabled = models.BooleanField(default=True, help_text='Show or hide the hero section.')
    hero_headline_en = models.CharField(max_length=200, blank=True)
    hero_headline_ar = models.CharField(max_length=200, blank=True)
    hero_subheadline_en = models.CharField(max_length=300, blank=True)
    hero_subheadline_ar = models.CharField(max_length=300, blank=True)
    hero_primary_cta_label_en = models.CharField(max_length=60, blank=True)
    hero_primary_cta_label_ar = models.CharField(max_length=60, blank=True)
    hero_primary_cta_target = models.CharField(
        max_length=255, blank=True,
        help_text='Internal path (e.g. /services) or anchor (e.g. #services).',
    )
    hero_secondary_cta_label_en = models.CharField(max_length=60, blank=True)
    hero_secondary_cta_label_ar = models.CharField(max_length=60, blank=True)
    hero_secondary_cta_target = models.CharField(
        max_length=255, blank=True,
        help_text='Internal path (e.g. /case-studies) or anchor (e.g. #case-studies).',
    )
    hero_media = models.ForeignKey(
        MediaAsset, related_name='hero_media', on_delete=models.SET_NULL,
        blank=True, null=True,
    )
    hero_show_location_card = models.BooleanField(default=True, help_text='Show or hide the location card in the hero.')

    # Foundation
    foundation_enabled = models.BooleanField(default=True)
    foundation_eyebrow_en = models.CharField(max_length=80, blank=True)
    foundation_eyebrow_ar = models.CharField(max_length=80, blank=True)
    foundation_heading_en = models.CharField(max_length=200, blank=True)
    foundation_heading_ar = models.CharField(max_length=200, blank=True)
    foundation_description_en = models.TextField(blank=True)
    foundation_description_ar = models.TextField(blank=True)
    foundation_proof_points_en = models.JSONField(
        default=list, blank=True,
        help_text='List of proof point strings (English).',
    )
    foundation_proof_points_ar = models.JSONField(
        default=list, blank=True,
        help_text='List of proof point strings (Arabic).',
    )
    foundation_cta_label_en = models.CharField(max_length=60, blank=True)
    foundation_cta_label_ar = models.CharField(max_length=60, blank=True)
    foundation_cta_target = models.CharField(max_length=255, blank=True)

    # Marquee heading
    marquee_heading_en = models.CharField(max_length=120, blank=True)
    marquee_heading_ar = models.CharField(max_length=120, blank=True)

    # Industries heading
    industries_heading_en = models.CharField(max_length=200, blank=True)
    industries_heading_ar = models.CharField(max_length=200, blank=True)
    industries_description_en = models.TextField(blank=True)
    industries_description_ar = models.TextField(blank=True)

    # Partners heading
    partners_heading_en = models.CharField(max_length=200, blank=True)
    partners_heading_ar = models.CharField(max_length=200, blank=True)
    partners_description_en = models.TextField(blank=True)
    partners_description_ar = models.TextField(blank=True)

    # Case studies heading
    case_studies_heading_en = models.CharField(max_length=200, blank=True)
    case_studies_heading_ar = models.CharField(max_length=200, blank=True)
    case_studies_description_en = models.TextField(blank=True)
    case_studies_description_ar = models.TextField(blank=True)

    # Insights heading
    insights_heading_en = models.CharField(max_length=200, blank=True)
    insights_heading_ar = models.CharField(max_length=200, blank=True)
    insights_description_en = models.TextField(blank=True)
    insights_description_ar = models.TextField(blank=True)

    # Careers heading
    careers_heading_en = models.CharField(max_length=200, blank=True)
    careers_heading_ar = models.CharField(max_length=200, blank=True)
    careers_description_en = models.TextField(blank=True)
    careers_description_ar = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'homepage_homepagesettings'
        verbose_name = 'Homepage Settings'
        verbose_name_plural = 'Homepage Settings'

    def __str__(self):
        return 'Homepage Settings'

    def save(self, *args, **kwargs):
        if self.is_active:
            HomepageSettings.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_current(cls):
        setting = cls.objects.filter(is_active=True).first()
        if not setting:
            setting = cls.objects.first()
        return setting


class MarqueeItem(TimeStampedModel):
    """What We Build marquee item — bilingual, ordered, visible toggle."""

    title_en = models.CharField(max_length=120)
    title_ar = models.CharField(max_length=120, blank=True)
    description_en = models.CharField(max_length=255, blank=True)
    description_ar = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'homepage_marqueeitem'
        verbose_name = 'Marquee Item'
        verbose_name_plural = 'Marquee Items'
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.title_en


class Industry(TimeStampedModel):
    """Industry / Solution card — bilingual, ordered, MediaAsset icon, visible toggle."""

    title_en = models.CharField(max_length=120)
    title_ar = models.CharField(max_length=120, blank=True)
    description_en = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)
    focus_areas_en = models.JSONField(default=list, blank=True, help_text='List of focus area strings (English).')
    focus_areas_ar = models.JSONField(default=list, blank=True, help_text='List of focus area strings (Arabic).')
    icon = models.ForeignKey(
        MediaAsset, related_name='industry_icons', on_delete=models.SET_NULL,
        blank=True, null=True,
    )
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'homepage_industry'
        verbose_name = 'Industry'
        verbose_name_plural = 'Industries'
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.title_en


# Fixed allowlist of known homepage section keys
HOMEPAGE_SECTION_KEYS = [
    ('hero', 'Hero'),
    ('foundation', 'Foundation'),
    ('marquee', 'What We Build'),
    ('services', 'Services'),
    ('industries', 'Industries / Solutions'),
    ('partners', 'Partners'),
    ('case_studies', 'Case Studies'),
    ('insights', 'Insights'),
    ('careers', 'Careers'),
    ('contact', 'Contact'),
]

SECTION_KEY_VALUES = {key for key, _ in HOMEPAGE_SECTION_KEYS}


class HomepageSectionConfig(TimeStampedModel):
    """Homepage section visibility and ordering — fixed allowlist of section keys."""

    section_key = models.CharField(max_length=40, unique=True, choices=HOMEPAGE_SECTION_KEYS)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'homepage_hompagesectionconfig'
        verbose_name = 'Homepage Section Config'
        verbose_name_plural = 'Homepage Section Configs'
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.section_key

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.section_key not in SECTION_KEY_VALUES:
            raise ValidationError({'section_key': f'Unknown section key: {self.section_key}'})
