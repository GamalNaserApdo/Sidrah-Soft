"""Models for the Case Studies CMS app."""
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset
from apps.partners.models import Partner
from apps.services.models import Service


class CaseStudy(TimeStampedModel):
    """A public case study showcasing a client project."""

    # Identity
    title_en = models.CharField(
        _('Title (English)'),
        max_length=255,
    )
    title_ar = models.CharField(
        _('Title (Arabic)'),
        max_length=255,
        blank=True,
    )
    slug = models.SlugField(
        _('Slug'),
        max_length=255,
        unique=True,
        help_text=_('URL-safe identifier.'),
    )

    # Attribution
    partner = models.ForeignKey(
        Partner,
        related_name='case_studies',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Partner'),
    )
    client_name_en = models.CharField(
        _('Client name (English)'),
        max_length=255,
        blank=True,
    )
    client_name_ar = models.CharField(
        _('Client name (Arabic)'),
        max_length=255,
        blank=True,
    )

    # Summary
    short_description_en = models.TextField(
        _('Short description (English)'),
        blank=True,
    )
    short_description_ar = models.TextField(
        _('Short description (Arabic)'),
        blank=True,
    )

    # Core structure
    problem_en = models.TextField(
        _('Problem (English)'),
        blank=True,
    )
    problem_ar = models.TextField(
        _('Problem (Arabic)'),
        blank=True,
    )
    solution_en = models.TextField(
        _('Solution (English)'),
        blank=True,
    )
    solution_ar = models.TextField(
        _('Solution (Arabic)'),
        blank=True,
    )
    technology_en = models.TextField(
        _('Technology (English)'),
        blank=True,
    )
    technology_ar = models.TextField(
        _('Technology (Arabic)'),
        blank=True,
    )
    outcome_en = models.TextField(
        _('Outcome (English)'),
        blank=True,
    )
    outcome_ar = models.TextField(
        _('Outcome (Arabic)'),
        blank=True,
    )

    # Media
    featured_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Featured image'),
    )
    logo = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Logo'),
    )

    # Classification
    industry_en = models.CharField(
        _('Industry (English)'),
        max_length=120,
        blank=True,
    )
    industry_ar = models.CharField(
        _('Industry (Arabic)'),
        max_length=120,
        blank=True,
    )
    services = models.ManyToManyField(
        Service,
        related_name='case_studies',
        blank=True,
        verbose_name=_('Services'),
    )

    # Links and metadata
    project_url = models.URLField(
        _('Project URL'),
        blank=True,
    )
    open_in_new_tab = models.BooleanField(
        _('Open in new tab'),
        default=True,
    )
    project_year = models.PositiveIntegerField(
        _('Project year'),
        blank=True,
        null=True,
    )

    # Display
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
        help_text=_('Inactive case studies are hidden from public APIs.'),
    )
    show_on_homepage = models.BooleanField(
        _('Show on homepage'),
        default=False,
    )

    # SEO
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
    canonical_url = models.URLField(
        _('Canonical URL override'),
        blank=True,
        help_text=_('Override the canonical URL for this case study. Leave blank to use the default.'),
    )
    og_title_en = models.CharField(
        _('Open Graph title (English)'),
        max_length=255,
        blank=True,
    )
    og_title_ar = models.CharField(
        _('Open Graph title (Arabic)'),
        max_length=255,
        blank=True,
    )
    og_description_en = models.TextField(
        _('Open Graph description (English)'),
        blank=True,
    )
    og_description_ar = models.TextField(
        _('Open Graph description (Arabic)'),
        blank=True,
    )
    og_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Open Graph image'),
        help_text=_('OG image for social sharing. Falls back to featured image.'),
    )
    robots_index = models.BooleanField(
        _('Allow search engines to index'),
        default=True,
    )
    robots_follow = models.BooleanField(
        _('Allow search engines to follow links'),
        default=True,
    )

    class Meta:
        db_table = 'case_studies_casestudy'
        verbose_name = _('Case Study')
        verbose_name_plural = _('Case Studies')
        ordering = ['display_order', 'title_en']
        indexes = [
            models.Index(
                fields=['is_active', 'is_featured', 'display_order'],
                name='cs_active_featured_idx',
            ),
            models.Index(
                fields=['is_active', 'show_on_homepage', 'display_order'],
                name='cs_active_homepage_idx',
            ),
        ]

    def __str__(self):
        return self.title_en
