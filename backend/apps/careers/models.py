"""Models for the Careers CMS app."""
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel


class Job(TimeStampedModel):
    """A public job posting managed through the Careers CMS."""

    # Employment type
    EMPLOYMENT_TYPE_FULL_TIME = 'full_time'
    EMPLOYMENT_TYPE_PART_TIME = 'part_time'
    EMPLOYMENT_TYPE_CONTRACT = 'contract'
    EMPLOYMENT_TYPE_INTERNSHIP = 'internship'
    EMPLOYMENT_TYPE_FREELANCE = 'freelance'
    EMPLOYMENT_TYPE_TEMPORARY = 'temporary'
    EMPLOYMENT_TYPE_OTHER = 'other'

    EMPLOYMENT_TYPE_CHOICES = [
        (EMPLOYMENT_TYPE_FULL_TIME, _('Full-time')),
        (EMPLOYMENT_TYPE_PART_TIME, _('Part-time')),
        (EMPLOYMENT_TYPE_CONTRACT, _('Contract')),
        (EMPLOYMENT_TYPE_INTERNSHIP, _('Internship')),
        (EMPLOYMENT_TYPE_FREELANCE, _('Freelance')),
        (EMPLOYMENT_TYPE_TEMPORARY, _('Temporary')),
        (EMPLOYMENT_TYPE_OTHER, _('Other')),
    ]

    # Workplace type
    WORKPLACE_TYPE_ONSITE = 'onsite'
    WORKPLACE_TYPE_REMOTE = 'remote'
    WORKPLACE_TYPE_HYBRID = 'hybrid'

    WORKPLACE_TYPE_CHOICES = [
        (WORKPLACE_TYPE_ONSITE, _('On-site')),
        (WORKPLACE_TYPE_REMOTE, _('Remote')),
        (WORKPLACE_TYPE_HYBRID, _('Hybrid')),
    ]

    # Experience level
    EXPERIENCE_LEVEL_ENTRY = 'entry'
    EXPERIENCE_LEVEL_JUNIOR = 'junior'
    EXPERIENCE_LEVEL_MID = 'mid'
    EXPERIENCE_LEVEL_SENIOR = 'senior'
    EXPERIENCE_LEVEL_LEAD = 'lead'
    EXPERIENCE_LEVEL_MANAGER = 'manager'
    EXPERIENCE_LEVEL_UNSPECIFIED = 'unspecified'

    EXPERIENCE_LEVEL_CHOICES = [
        (EXPERIENCE_LEVEL_ENTRY, _('Entry-level')),
        (EXPERIENCE_LEVEL_JUNIOR, _('Junior')),
        (EXPERIENCE_LEVEL_MID, _('Mid-level')),
        (EXPERIENCE_LEVEL_SENIOR, _('Senior')),
        (EXPERIENCE_LEVEL_LEAD, _('Lead')),
        (EXPERIENCE_LEVEL_MANAGER, _('Manager')),
        (EXPERIENCE_LEVEL_UNSPECIFIED, _('Unspecified')),
    ]

    # Application method
    APPLICATION_METHOD_EXTERNAL_URL = 'external_url'
    APPLICATION_METHOD_EMAIL = 'email'
    APPLICATION_METHOD_CONTACT_PAGE = 'contact_page'

    APPLICATION_METHOD_CHOICES = [
        (APPLICATION_METHOD_EXTERNAL_URL, _('External URL')),
        (APPLICATION_METHOD_EMAIL, _('Email')),
        (APPLICATION_METHOD_CONTACT_PAGE, _('Contact page')),
    ]

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

    # Organization
    department_en = models.CharField(
        _('Department (English)'),
        max_length=120,
        blank=True,
    )
    department_ar = models.CharField(
        _('Department (Arabic)'),
        max_length=120,
        blank=True,
    )
    location_en = models.CharField(
        _('Location (English)'),
        max_length=120,
        blank=True,
    )
    location_ar = models.CharField(
        _('Location (Arabic)'),
        max_length=120,
        blank=True,
    )

    # Classification
    employment_type = models.CharField(
        _('Employment type'),
        max_length=32,
        choices=EMPLOYMENT_TYPE_CHOICES,
        default=EMPLOYMENT_TYPE_FULL_TIME,
    )
    workplace_type = models.CharField(
        _('Workplace type'),
        max_length=32,
        choices=WORKPLACE_TYPE_CHOICES,
        default=WORKPLACE_TYPE_HYBRID,
    )
    experience_level = models.CharField(
        _('Experience level'),
        max_length=32,
        choices=EXPERIENCE_LEVEL_CHOICES,
        default=EXPERIENCE_LEVEL_UNSPECIFIED,
    )

    # Summary and description
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

    # Responsibilities and requirements
    responsibilities_en = models.TextField(
        _('Responsibilities (English)'),
        blank=True,
    )
    responsibilities_ar = models.TextField(
        _('Responsibilities (Arabic)'),
        blank=True,
    )
    requirements_en = models.TextField(
        _('Requirements (English)'),
        blank=True,
    )
    requirements_ar = models.TextField(
        _('Requirements (Arabic)'),
        blank=True,
    )

    # Preferred qualifications and benefits
    preferred_qualifications_en = models.TextField(
        _('Preferred qualifications (English)'),
        blank=True,
    )
    preferred_qualifications_ar = models.TextField(
        _('Preferred qualifications (Arabic)'),
        blank=True,
    )
    benefits_en = models.TextField(
        _('Benefits (English)'),
        blank=True,
    )
    benefits_ar = models.TextField(
        _('Benefits (Arabic)'),
        blank=True,
    )

    # Application settings
    application_method = models.CharField(
        _('Application method'),
        max_length=32,
        choices=APPLICATION_METHOD_CHOICES,
        default=APPLICATION_METHOD_CONTACT_PAGE,
    )
    external_apply_url = models.URLField(
        _('External apply URL'),
        blank=True,
    )
    application_email = models.EmailField(
        _('Application email'),
        blank=True,
    )

    # Dates and display
    posted_date = models.DateField(
        _('Posted date'),
        default=timezone.now,
    )
    closing_date = models.DateField(
        _('Closing date'),
        blank=True,
        null=True,
        help_text=_('Leave blank for evergreen postings. Expired jobs are hidden from public APIs.'),
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
        help_text=_('Inactive jobs are hidden from public APIs.'),
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

    class Meta:
        db_table = 'careers_job'
        verbose_name = _('Job')
        verbose_name_plural = _('Jobs')
        ordering = ['-is_featured', 'display_order', '-posted_date', 'title_en']
        indexes = [
            models.Index(
                fields=['is_active', 'show_on_homepage', 'display_order'],
                name='careers_active_homepage_idx',
            ),
            models.Index(
                fields=['is_active', 'closing_date', 'posted_date'],
                name='careers_active_dates_idx',
            ),
        ]

    def __str__(self):
        return self.title_en

    def clean(self):
        super().clean()
        if self.application_method == self.APPLICATION_METHOD_EXTERNAL_URL and not self.external_apply_url:
            raise ValidationError({
                'external_apply_url': _('External apply URL is required when the application method is "External URL".'),
            })
        if self.application_method == self.APPLICATION_METHOD_EMAIL and not self.application_email:
            raise ValidationError({
                'application_email': _('Application email is required when the application method is "Email".'),
            })

    @classmethod
    def public_qs(cls):
        """Return active jobs that have not expired."""
        today = timezone.now().date()
        return cls.objects.filter(
            is_active=True,
        ).filter(
            models.Q(closing_date__isnull=True) | models.Q(closing_date__gte=today),
        )
