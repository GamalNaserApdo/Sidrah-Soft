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
    tiktok_url = models.URLField('TikTok URL', blank=True)

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

    # Analytics / Integrations
    meta_pixel_enabled = models.BooleanField(
        default=False,
        help_text='Enable Meta (Facebook) Pixel tracking on the public website.',
    )
    meta_pixel_id = models.CharField(
        max_length=30,
        blank=True,
        default='',
        help_text='Meta Pixel ID — numeric string only, e.g. 1541476880609183.',
    )
    google_tag_manager_enabled = models.BooleanField(
        default=False,
        help_text='Enable Google Tag Manager. Not loaded on the website until implementation is reviewed.',
    )
    google_tag_manager_container_id = models.CharField(
        max_length=30,
        blank=True,
        default='',
        help_text='GTM container ID, e.g. GTM-XXXXXXX.',
    )
    google_analytics_enabled = models.BooleanField(
        default=False,
        help_text='Enable Google Analytics 4. Stored for reference; not loaded directly unless explicitly chosen.',
    )
    google_analytics_measurement_id = models.CharField(
        max_length=30,
        blank=True,
        default='',
        help_text='GA4 Measurement ID, e.g. G-XXXXXXXXXX.',
    )
    google_search_console_verification_method = models.CharField(
        max_length=30,
        blank=True,
        default='dns',
        help_text='Preferred verification method: dns, html_meta, or html_file. DNS is preferred.',
    )
    google_search_console_verification_token = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Optional HTML meta verification token. Only used if HTML meta verification is intentionally supported.',
    )
    google_search_console_sitemap_url = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Sitemap URL, e.g. /sitemap.xml or https://sidrahsoft.com/sitemap.xml',
    )

    # Campaign pricing — single source of truth for whether Professional course
    # prices are publicly visible. When True, public API serializers suppress
    # current_price/original_price for professional-branch programs. The
    # frontend reads the same flag via the public site settings API so backend
    # serialization and frontend presentation stay aligned.
    campaign_pricing_mode = models.BooleanField(
        default=True,
        help_text='When enabled, Professional course prices are hidden from '
                  'public API responses and the frontend shows "pricing coming '
                  'soon". Starter course prices (499 EGP) are always public. '
                  'Set to False when campaign offers are finalized.',
    )

    # Training registration confirmation email — CMS-managed business configuration.
    # SMTP secrets (EMAIL_HOST, EMAIL_HOST_PASSWORD, etc.) remain environment-only.
    training_confirmation_email_enabled = models.BooleanField(
        default=True,
        help_text='Enable sending confirmation emails to applicants after successful training registration.',
    )
    training_confirmation_sender_name = models.CharField(
        max_length=120,
        blank=True,
        default='Sidrah Soft',
        help_text='Display name shown in the From header. The authenticated sender address is infrastructure-controlled.',
    )
    training_confirmation_reply_to = models.EmailField(
        blank=True,
        default='sidrahsoft@gmail.com',
        help_text='Reply-To address for confirmation emails. Must be a monitored mailbox.',
    )
    # English content
    training_confirmation_subject_en = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Subject line for English confirmation emails.',
    )
    training_confirmation_heading_en = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Heading shown at the top of the English email body.',
    )
    training_confirmation_message_en = models.TextField(
        blank=True, default='',
        help_text='Main confirmation message body (English). Safe placeholders: {{applicant_name}}, {{program_name}}.',
    )
    training_confirmation_cta_label_en = models.CharField(
        max_length=80, blank=True, default='',
        help_text='Call-to-action button label (English).',
    )
    training_confirmation_cta_url = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Call-to-action destination URL. Must be a safe internal path or https URL.',
    )
    training_confirmation_footer_en = models.TextField(
        blank=True, default='',
        help_text='Footer/support copy shown below the main message (English).',
    )
    # Arabic content
    training_confirmation_subject_ar = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Subject line for Arabic confirmation emails.',
    )
    training_confirmation_heading_ar = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Heading shown at the top of the Arabic email body.',
    )
    training_confirmation_message_ar = models.TextField(
        blank=True, default='',
        help_text='Main confirmation message body (Arabic). Safe placeholders: {{applicant_name}}, {{program_name}}.',
    )
    training_confirmation_cta_label_ar = models.CharField(
        max_length=80, blank=True, default='',
        help_text='Call-to-action button label (Arabic).',
    )
    training_confirmation_footer_ar = models.TextField(
        blank=True, default='',
        help_text='Footer/support copy shown below the main message (Arabic).',
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
        # Trim and sanitize CMS-controlled fields before saving.
        # Note: google_tag_manager_container_id is intentionally excluded so the
        # validator can reject leading/trailing whitespace explicitly instead of
        # hiding input errors by silent trimming.
        for field in (
            'meta_pixel_id',
            'google_analytics_measurement_id',
            'google_search_console_verification_token',
            'google_search_console_sitemap_url',
        ):
            value = getattr(self, field, None)
            if isinstance(value, str):
                setattr(self, field, value.strip())
        super().save(*args, **kwargs)

    @classmethod
    def get_current(cls):
        """Return the active site setting, or the first record if none is active."""
        setting = cls.objects.filter(is_active=True).first()
        if not setting:
            setting = cls.objects.first()
        return setting


# ---------------------------------------------------------------------------
# Static Page SEO — CMS-controlled SEO for individual static pages.
# ---------------------------------------------------------------------------

# Controlled allowlist of page keys that correspond to real public pages.
# The CMS cannot create new routes by typing a page key — only these are valid.
# Note: certificate_verify is intentionally excluded because CertificateVerifyPage
# has specialized dynamic SEO logic (landing vs. verified vs. revoked) that does
# not fit the StaticPageSEO pattern. Individual credential pages remain noindex.
STATIC_PAGE_KEYS = [
    ('home', 'Homepage'),
    ('ai_automation', 'AI Automation'),
    ('services', 'Services Listing'),
    ('training', 'Training Listing'),
    ('training_offers', 'Training Offers'),
    ('careers', 'Careers'),
    ('case_studies', 'Case Studies Listing'),
    ('insights', 'Insights Listing'),
]

# Code-controlled canonical path map — the CMS cannot change routing.
STATIC_PAGE_CANONICAL_PATHS = {
    'home': '/',
    'ai_automation': '/services/ai-automation',
    'services': '/services',
    'training': '/training',
    'training_offers': '/training/offers',
    'careers': '/careers',
    'case_studies': '/case-studies',
    'insights': '/insights',
}

STATIC_PAGE_KEY_VALUES = {key for key, _ in STATIC_PAGE_KEYS}


class StaticPageSEO(TimeStampedModel):
    """CMS-controlled SEO metadata for a specific static page.

    Only page keys from the controlled allowlist are valid.
    Canonical paths are code-controlled (derived from STATIC_PAGE_CANONICAL_PATHS).
    The CMS cannot create new routes or canonicalize to arbitrary URLs.
    """

    page_key = models.CharField(
        max_length=50,
        unique=True,
        choices=STATIC_PAGE_KEYS,
        help_text='Select a known public page. New routes cannot be created here.',
    )

    # SEO metadata (bilingual)
    seo_title_en = models.CharField(max_length=120, blank=True)
    seo_title_ar = models.CharField(max_length=120, blank=True)
    meta_description_en = models.TextField(blank=True)
    meta_description_ar = models.TextField(blank=True)

    # Open Graph (bilingual)
    og_title_en = models.CharField(max_length=120, blank=True)
    og_title_ar = models.CharField(max_length=120, blank=True)
    og_description_en = models.TextField(blank=True)
    og_description_ar = models.TextField(blank=True)
    og_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    # Robots
    robots_index = models.BooleanField(
        default=True,
        help_text='Allow search engines to index this page.',
    )
    robots_follow = models.BooleanField(
        default=True,
        help_text='Allow search engines to follow links on this page.',
    )

    class Meta:
        db_table = 'site_settings_staticpageseo'
        verbose_name = 'Static Page SEO'
        verbose_name_plural = 'Static Page SEO'

    def __str__(self):
        return self.get_page_key_display()

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.page_key and self.page_key not in STATIC_PAGE_KEY_VALUES:
            raise ValidationError({'page_key': f'Unknown page key: {self.page_key}'})

    @property
    def canonical_path(self):
        """Return the code-controlled canonical path for this page key."""
        return STATIC_PAGE_CANONICAL_PATHS.get(self.page_key, '/')
