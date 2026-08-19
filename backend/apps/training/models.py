"""Models for the Training & Education module."""
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


class Program(TimeStampedModel):
    """
    A training or education program offered by SidrahSoft.

    Supports two branches:
    - professional: courses for working professionals
    - secondary: programs for secondary/baccalaureate students
    """

    # Branch choices
    BRANCH_PROFESSIONAL = 'professional'
    BRANCH_SECONDARY = 'secondary'

    BRANCH_CHOICES = [
        (BRANCH_PROFESSIONAL, _('Professional Training')),
        (BRANCH_SECONDARY, _('Secondary / Baccalaureate Education')),
    ]

    # Status choices
    STATUS_DRAFT = 'draft'
    STATUS_ACTIVE = 'active'
    STATUS_ARCHIVED = 'archived'

    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_ACTIVE, _('Active')),
        (STATUS_ARCHIVED, _('Archived')),
    ]

    # Audience level choices
    AUDIENCE_PROFESSIONAL = 'professional'
    AUDIENCE_FIRST_SECONDARY = 'first_secondary'
    AUDIENCE_SECOND_SECONDARY = 'second_secondary'
    AUDIENCE_BACCALAUREATE = 'baccalaureate'

    AUDIENCE_CHOICES = [
        (AUDIENCE_PROFESSIONAL, _('Professional')),
        (AUDIENCE_FIRST_SECONDARY, _('First Secondary')),
        (AUDIENCE_SECOND_SECONDARY, _('Second Secondary')),
        (AUDIENCE_BACCALAUREATE, _('Baccalaureate')),
    ]

    # Core identity
    slug = models.SlugField(_('Slug'), max_length=255, unique=True)
    title_en = models.CharField(_('Title (English)'), max_length=255)
    title_ar = models.CharField(_('Title (Arabic)'), max_length=255, blank=True)
    short_description_en = models.TextField(_('Short Description (English)'), blank=True)
    short_description_ar = models.TextField(_('Short Description (Arabic)'), blank=True)
    overview_en = models.TextField(_('Overview (English)'), blank=True)
    overview_ar = models.TextField(_('Overview (Arabic)'), blank=True)

    # Classification
    branch = models.CharField(
        _('Branch'), max_length=32,
        choices=BRANCH_CHOICES, default=BRANCH_SECONDARY, db_index=True,
    )
    status = models.CharField(
        _('Status'), max_length=16,
        choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True,
    )

    # Audience levels (supports multi-level programs)
    audience_levels = models.JSONField(
        _('Audience Levels'), default=list, blank=True,
        help_text=_('List of audience level identifiers, e.g. ["first_secondary", "second_secondary"]'),
    )

    # Media
    image = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='training_programs',
        verbose_name=_('Cover Image'),
    )

    # Program details (stored as JSON for flexibility)
    modules_en = models.JSONField(
        _('Modules/Curriculum (English)'), default=list, blank=True,
        help_text=_('List of module titles or objects'),
    )
    modules_ar = models.JSONField(
        _('Modules/Curriculum (Arabic)'), default=list, blank=True,
    )
    skills_en = models.JSONField(
        _('Skills (English)'), default=list, blank=True,
    )
    skills_ar = models.JSONField(
        _('Skills (Arabic)'), default=list, blank=True,
    )
    learning_outcomes_en = models.JSONField(
        _('Learning Outcomes (English)'), default=list, blank=True,
    )
    learning_outcomes_ar = models.JSONField(
        _('Learning Outcomes (Arabic)'), default=list, blank=True,
    )
    practical_project_en = models.TextField(
        _('Practical Project (English)'), blank=True,
    )
    practical_project_ar = models.TextField(
        _('Practical Project (Arabic)'), blank=True,
    )

    # Logistics
    duration_en = models.CharField(_('Duration (English)'), max_length=120, blank=True)
    duration_ar = models.CharField(_('Duration (Arabic)'), max_length=120, blank=True)
    format_en = models.CharField(_('Format (English)'), max_length=120, blank=True)
    format_ar = models.CharField(_('Format (Arabic)'), max_length=120, blank=True)
    schedule_en = models.TextField(_('Schedule (English)'), blank=True)
    schedule_ar = models.TextField(_('Schedule (Arabic)'), blank=True)

    # CTA
    cta_text_en = models.CharField(_('CTA Text (English)'), max_length=120, blank=True)
    cta_text_ar = models.CharField(_('CTA Text (Arabic)'), max_length=120, blank=True)

    # Ordering
    display_order = models.PositiveIntegerField(_('Display Order'), default=0)

    class Meta:
        db_table = 'training_program'
        ordering = ['display_order', 'title_en']
        verbose_name = _('Program')
        verbose_name_plural = _('Programs')
        indexes = [
            models.Index(fields=['branch', 'status'], name='training_branch_status_idx'),
            models.Index(fields=['display_order'], name='training_order_idx'),
        ]

    def __str__(self):
        return f'{self.title_en} ({self.get_branch_display()})'
