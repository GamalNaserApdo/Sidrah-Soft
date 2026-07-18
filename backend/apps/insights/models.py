"""Models for the Insights CMS app."""
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


CONTENT_TYPE_INSIGHT = 'insight'
CONTENT_TYPE_ARTICLE = 'article'
CONTENT_TYPE_NEWS = 'news'
CONTENT_TYPE_ANNOUNCEMENT = 'announcement'

CONTENT_TYPE_CHOICES = [
    (CONTENT_TYPE_INSIGHT, _('Insight')),
    (CONTENT_TYPE_ARTICLE, _('Article')),
    (CONTENT_TYPE_NEWS, _('News')),
    (CONTENT_TYPE_ANNOUNCEMENT, _('Announcement')),
]


STATUS_DRAFT = 'draft'
STATUS_PUBLISHED = 'published'
STATUS_ARCHIVED = 'archived'

STATUS_CHOICES = [
    (STATUS_DRAFT, _('Draft')),
    (STATUS_PUBLISHED, _('Published')),
    (STATUS_ARCHIVED, _('Archived')),
]


class Article(TimeStampedModel):
    """An insight, article, news item, or announcement."""

    title_en = models.CharField(_('Title (English)'), max_length=255)
    title_ar = models.CharField(_('Title (Arabic)'), max_length=255, blank=True)
    slug = models.SlugField(
        _('Slug'),
        max_length=255,
        unique=True,
        help_text=_('URL-safe identifier.'),
    )
    content_type = models.CharField(
        _('Content type'),
        max_length=32,
        choices=CONTENT_TYPE_CHOICES,
        default=CONTENT_TYPE_INSIGHT,
    )

    excerpt_en = models.TextField(_('Excerpt (English)'), blank=True)
    excerpt_ar = models.TextField(_('Excerpt (Arabic)'), blank=True)

    body_en = models.TextField(_('Body (English)'), blank=True)
    body_ar = models.TextField(_('Body (Arabic)'), blank=True)

    category_en = models.CharField(_('Category (English)'), max_length=120, blank=True)
    category_ar = models.CharField(_('Category (Arabic)'), max_length=120, blank=True)

    author_name_en = models.CharField(
        _('Author name (English)'),
        max_length=120,
        blank=True,
    )
    author_name_ar = models.CharField(
        _('Author name (Arabic)'),
        max_length=120,
        blank=True,
    )

    featured_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Featured image'),
    )

    status = models.CharField(
        _('Status'),
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        help_text=_('Only published articles are visible to the public.'),
    )
    published_at = models.DateTimeField(_('Published at'), blank=True, null=True)
    is_featured = models.BooleanField(_('Featured'), default=False)
    show_on_homepage = models.BooleanField(_('Show on homepage'), default=False)
    display_order = models.PositiveIntegerField(
        _('Display order'),
        default=0,
        help_text=_('Lower values appear first.'),
    )

    read_time_minutes = models.PositiveIntegerField(
        _('Read time (minutes)'),
        blank=True,
        null=True,
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
    canonical_url = models.URLField(
        _('Canonical URL override'),
        blank=True,
        help_text=_('Override the canonical URL for this article. Leave blank to use the default.'),
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
        db_table = 'insights_article'
        verbose_name = _('Article')
        verbose_name_plural = _('Articles')
        ordering = ['display_order', '-published_at', 'title_en']
        indexes = [
            models.Index(
                fields=['status', 'is_featured', 'display_order'],
                name='insights_status_featured_idx',
            ),
            models.Index(
                fields=['status', 'show_on_homepage', 'display_order'],
                name='insights_status_homepage_idx',
            ),
            models.Index(
                fields=['content_type', 'status', 'published_at'],
                name='insights_type_status_date_idx',
            ),
        ]

    def __str__(self):
        return self.title_en

    @classmethod
    def public_qs(cls):
        """Return articles that should be visible on public endpoints."""
        now = timezone.now()
        return cls.objects.filter(
            status=STATUS_PUBLISHED,
            published_at__lte=now,
        )
