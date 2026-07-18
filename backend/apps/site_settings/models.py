from django.db import models

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


class SiteSetting(TimeStampedModel):
    """Central CMS-controlled global site settings.

    Only one active record is intended to be used as the live configuration.
    The `get_current()` helper returns the active record.
    """

    # General
    site_name = models.CharField(max_length=120, default='Sidrah Soft')
    site_tagline = models.CharField(max_length=255, blank=True)
    default_language = models.CharField(max_length=10, default='en')
    supported_languages = models.JSONField(
        default=list,
        blank=True,
        help_text='List of supported language codes, e.g. ["en", "ar"].',
    )

    # Contact
    contact_email = models.EmailField(blank=True)
    recipient_email = models.EmailField(
        blank=True,
        help_text='Internal recipient for contact form submissions. Not exposed publicly.',
    )
    phone = models.CharField(max_length=40, blank=True)
    whatsapp_url = models.URLField(blank=True)
    telegram_url = models.URLField(blank=True)

    # Social links
    facebook_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    x_url = models.URLField('X (Twitter) URL', blank=True)

    # Company location / map
    address = models.TextField(blank=True)
    google_maps_url = models.URLField(blank=True)
    map_embed_url = models.URLField(blank=True)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
    )
    working_hours = models.CharField(max_length=120, blank=True)

    # SEO defaults
    default_meta_title = models.CharField(max_length=120, blank=True)
    default_meta_description = models.TextField(blank=True)
    default_og_title = models.CharField(max_length=120, blank=True, help_text='Open Graph title. Falls back to default meta title.')
    default_og_description = models.TextField(blank=True, help_text='Open Graph description. Falls back to default meta description.')
    default_og_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    twitter_card_type = models.CharField(
        max_length=30,
        default='summary_large_image',
        help_text='Twitter card type: summary, summary_large_image, or player.',
    )
    canonical_base_url = models.URLField(
        blank=True,
        help_text='Base URL for canonical links, e.g. https://sidrahsoft.com',
    )
    robots_index = models.BooleanField(
        default=True,
        help_text='Global toggle: allow search engines to index the site.',
    )
    organization_description = models.TextField(
        blank=True,
        help_text='Description for Organization schema.org structured data.',
    )

    # Branding
    primary_logo = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    secondary_logo = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    favicon = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(
        default=True,
        help_text='Only one active record is recommended. Activating this record deactivates others.',
    )

    class Meta:
        db_table = 'site_settings_sitesetting'
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        # Enforce a single active setting at a time.
        if self.is_active:
            SiteSetting.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_current(cls):
        """Return the active site setting, or the first record if none is active."""
        setting = cls.objects.filter(is_active=True).first()
        if not setting:
            setting = cls.objects.first()
        return setting
