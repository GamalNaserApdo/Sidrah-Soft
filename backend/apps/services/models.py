"""Models for the Services CMS app."""
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


class Service(TimeStampedModel):
    """A service offering published on the SidrahSoft website."""

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

    short_description_en = models.TextField(
        _('Short description (English)'),
        blank=True,
    )
    short_description_ar = models.TextField(
        _('Short description (Arabic)'),
        blank=True,
    )
    description_en = models.TextField(
        _('Description (English)'),
        blank=True,
    )
    description_ar = models.TextField(
        _('Description (Arabic)'),
        blank=True,
    )

    icon = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Icon'),
    )
    featured_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Featured image'),
    )

    display_order = models.PositiveIntegerField(
        _('Display order'),
        default=0,
        db_index=True,
        help_text=_('Lower values appear first.'),
    )
    is_featured = models.BooleanField(
        _('Featured'),
        default=False,
    )
    is_active = models.BooleanField(
        _('Active'),
        default=True,
        help_text=_('Inactive services are hidden from public APIs.'),
    )
    show_on_homepage = models.BooleanField(
        _('Show on homepage'),
        default=False,
    )

    cta_label_en = models.CharField(
        _('CTA label (English)'),
        max_length=120,
        blank=True,
    )
    cta_label_ar = models.CharField(
        _('CTA label (Arabic)'),
        max_length=120,
        blank=True,
    )
    cta_url = models.CharField(
        _('CTA URL'),
        max_length=512,
        blank=True,
    )

    seo_title_en = models.CharField(
        _('SEO title (English)'),
        max_length=255,
        blank=True,
    )
    seo_title_ar = models.CharField(
        _('SEO title (Arabic)'),
        max_length=255,
        blank=True,
    )
    seo_description_en = models.TextField(
        _('SEO description (English)'),
        blank=True,
    )
    seo_description_ar = models.TextField(
        _('SEO description (Arabic)'),
        blank=True,
    )

    class Meta:
        db_table = 'services_service'
        verbose_name = _('Service')
        verbose_name_plural = _('Services')
        ordering = ['display_order', 'name_en']
        indexes = [
            models.Index(
                fields=['display_order', 'name_en'],
                name='services_order_name_idx',
            ),
            models.Index(
                fields=['is_active', 'is_featured', 'display_order'],
                name='services_active_featured_idx',
            ),
            models.Index(
                fields=['is_active', 'show_on_homepage', 'display_order'],
                name='services_active_homepage_idx',
            ),
        ]

    def __str__(self):
        return self.name_en
