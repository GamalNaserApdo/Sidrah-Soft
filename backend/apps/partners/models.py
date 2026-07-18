from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


class Partner(TimeStampedModel):
    """A partner or client displayed on the public website."""

    PARTNER_TYPE_CLIENT = 'client'
    PARTNER_TYPE_STRATEGIC = 'strategic_partner'
    PARTNER_TYPE_ACADEMIC = 'academic_partner'
    PARTNER_TYPE_TECHNOLOGY = 'technology_partner'
    PARTNER_TYPE_TRAINING = 'training_partner'
    PARTNER_TYPE_OTHER = 'other'

    PARTNER_TYPE_CHOICES = [
        (PARTNER_TYPE_CLIENT, _('Client')),
        (PARTNER_TYPE_STRATEGIC, _('Strategic Partner')),
        (PARTNER_TYPE_ACADEMIC, _('Academic Partner')),
        (PARTNER_TYPE_TECHNOLOGY, _('Technology Partner')),
        (PARTNER_TYPE_TRAINING, _('Training Partner')),
        (PARTNER_TYPE_OTHER, _('Other')),
    ]

    name_en = models.CharField(
        _('Name (English)'),
        max_length=255,
    )
    name_ar = models.CharField(
        _('Name (Arabic)'),
        max_length=255,
        blank=True,
    )
    slug = models.SlugField(
        _('Slug'),
        max_length=255,
        unique=True,
        help_text=_('URL-safe identifier.'),
    )

    description_en = models.TextField(
        _('Description (English)'),
        blank=True,
    )
    description_ar = models.TextField(
        _('Description (Arabic)'),
        blank=True,
    )

    logo = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Logo'),
    )

    website_url = models.URLField(
        _('Website URL'),
        blank=True,
    )
    open_in_new_tab = models.BooleanField(
        _('Open in new tab'),
        default=True,
    )

    partner_type = models.CharField(
        _('Partner type'),
        max_length=32,
        choices=PARTNER_TYPE_CHOICES,
        default=PARTNER_TYPE_CLIENT,
    )

    display_order = models.PositiveIntegerField(
        _('Display order'),
        default=0,
        help_text=_('Lower values appear first.'),
    )
    is_featured = models.BooleanField(
        _('Featured'),
        default=False,
    )
    is_active = models.BooleanField(
        _('Active'),
        default=True,
        help_text=_('Inactive partners are hidden from public APIs.'),
    )

    class Meta:
        db_table = 'partners_partner'
        verbose_name = _('Partner')
        verbose_name_plural = _('Partners')
        ordering = ['display_order', 'name_en']
        indexes = [
            models.Index(
                fields=['partner_type', 'is_active', 'display_order', 'name_en'],
                name='partners_type_active_order_idx',
            ),
            models.Index(
                fields=['is_featured', 'is_active', 'display_order'],
                name='partners_featured_order_idx',
            ),
        ]

    def __str__(self):
        return self.name_en
