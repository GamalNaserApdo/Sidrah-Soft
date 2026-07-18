"""Models for the Contact Management CMS app."""
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel


class InquiryType(TimeStampedModel):
    """A CMS-managed category for contact form submissions."""

    name_en = models.CharField(
        _('Name (English)'),
        max_length=120,
    )
    name_ar = models.CharField(
        _('Name (Arabic)'),
        max_length=120,
        blank=True,
    )
    slug = models.SlugField(
        _('Slug'),
        max_length=120,
        unique=True,
        help_text=_('URL-safe identifier used by the public API and frontend.'),
    )
    description_en = models.TextField(
        _('Description (English)'),
        blank=True,
    )
    description_ar = models.TextField(
        _('Description (Arabic)'),
        blank=True,
    )
    recipient_email = models.EmailField(
        _('Recipient email override'),
        blank=True,
        help_text=_('Optional. If blank, the Site Setting recipient email is used.'),
    )
    order = models.PositiveIntegerField(
        _('Display order'),
        default=0,
        db_index=True,
        help_text=_('Lower values appear first.'),
    )
    is_active = models.BooleanField(
        _('Active'),
        default=True,
        help_text=_('Inactive inquiry types are hidden from the public API.'),
    )

    class Meta:
        db_table = 'contact_inquirytype'
        verbose_name = _('Inquiry Type')
        verbose_name_plural = _('Inquiry Types')
        ordering = ['order', 'name_en']
        indexes = [
            models.Index(
                fields=['is_active', 'order', 'name_en'],
                name='contact_type_active_order_idx',
            ),
        ]

    def __str__(self):
        return self.name_en


class ContactSubmission(TimeStampedModel):
    """A single contact form submission with workflow and email audit fields."""

    # Contact details
    public_id = models.UUIDField(
        _('Public identifier'),
        default=uuid.uuid4,
        unique=True,
        db_index=True,
        editable=False,
    )
    full_name = models.CharField(_('Full name'), max_length=255)
    email = models.EmailField(_('Email'))
    phone = models.CharField(_('Phone'), max_length=40, blank=True)
    company = models.CharField(_('Company / Organization'), max_length=255, blank=True)
    job_title = models.CharField(_('Job title'), max_length=120, blank=True)

    # Classification
    inquiry_type = models.ForeignKey(
        InquiryType,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Inquiry type'),
        related_name='submissions',
    )
    related_service = models.ForeignKey(
        'services.Service',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Related service'),
        related_name='contact_submissions',
    )
    subject = models.CharField(_('Subject'), max_length=255, blank=True)
    message = models.TextField(_('Message'))

    PREFERRED_EMAIL = 'email'
    PREFERRED_PHONE = 'phone'
    PREFERRED_WHATSAPP = 'whatsapp'
    PREFERRED_ANY = 'any'
    PREFERRED_CONTACT_CHOICES = [
        (PREFERRED_EMAIL, _('Email')),
        (PREFERRED_PHONE, _('Phone')),
        (PREFERRED_WHATSAPP, _('WhatsApp')),
        (PREFERRED_ANY, _('Any')),
    ]
    preferred_contact_method = models.CharField(
        _('Preferred contact method'),
        max_length=16,
        choices=PREFERRED_CONTACT_CHOICES,
        blank=True,
    )
    privacy_consent = models.BooleanField(
        _('Privacy consent'),
        default=False,
        help_text=_('Required to submit the contact form.'),
    )

    # Source and context
    source_page = models.CharField(
        _('Source page'),
        max_length=512,
        blank=True,
        help_text=_('URL path where the form was submitted.'),
    )
    language = models.CharField(_('Language'), max_length=10, blank=True, default='en')

    # Workflow
    STATUS_NEW = 'new'
    STATUS_CONTACTED = 'contacted'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_CLOSED = 'closed'
    STATUS_SPAM = 'spam'
    STATUS_ARCHIVED = 'archived'
    STATUS_CHOICES = [
        (STATUS_NEW, _('New')),
        (STATUS_CONTACTED, _('Contacted')),
        (STATUS_IN_PROGRESS, _('In progress')),
        (STATUS_CLOSED, _('Closed')),
        (STATUS_SPAM, _('Spam')),
        (STATUS_ARCHIVED, _('Archived')),
    ]
    status = models.CharField(
        _('Status'),
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
        db_index=True,
    )

    PRIORITY_LOW = 'low'
    PRIORITY_NORMAL = 'normal'
    PRIORITY_HIGH = 'high'
    PRIORITY_URGENT = 'urgent'
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, _('Low')),
        (PRIORITY_NORMAL, _('Normal')),
        (PRIORITY_HIGH, _('High')),
        (PRIORITY_URGENT, _('Urgent')),
    ]
    priority = models.CharField(
        _('Priority'),
        max_length=16,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_NORMAL,
        db_index=True,
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Assigned to'),
        related_name='contact_submissions',
    )
    internal_notes = models.TextField(_('Internal notes'), blank=True)

    # Delivery audit
    DELIVERY_PENDING = 'pending'
    DELIVERY_SENT = 'sent'
    DELIVERY_FAILED = 'failed'
    DELIVERY_NOT_CONFIGURED = 'not_configured'
    DELIVERY_CHOICES = [
        (DELIVERY_PENDING, _('Pending')),
        (DELIVERY_SENT, _('Sent')),
        (DELIVERY_FAILED, _('Failed')),
        (DELIVERY_NOT_CONFIGURED, _('Not configured')),
    ]
    email_delivery_status = models.CharField(
        _('Email delivery status'),
        max_length=16,
        choices=DELIVERY_CHOICES,
        default=DELIVERY_PENDING,
        db_index=True,
    )
    email_attempted_at = models.DateTimeField(
        _('Email attempted at'),
        blank=True,
        null=True,
    )
    email_sent_at = models.DateTimeField(
        _('Email sent at'),
        blank=True,
        null=True,
    )
    email_error_summary = models.TextField(
        _('Email error summary'),
        blank=True,
        help_text=_('Bounded, sanitized summary for admin review. Never a full traceback.'),
    )
    recipient_email_used = models.EmailField(
        _('Recipient email used'),
        blank=True,
    )

    # Source metadata
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        blank=True,
        null=True,
    )
    user_agent = models.TextField(_('User agent'), blank=True)

    # Workflow timestamps
    contacted_at = models.DateTimeField(
        _('Contacted at'),
        blank=True,
        null=True,
    )
    closed_at = models.DateTimeField(
        _('Closed at'),
        blank=True,
        null=True,
    )

    class Meta:
        db_table = 'contact_contactsubmission'
        verbose_name = _('Contact Submission')
        verbose_name_plural = _('Contact Submissions')
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['status', 'created_at'],
                name='contact_status_created_idx',
            ),
            models.Index(
                fields=['inquiry_type', 'status'],
                name='contact_type_status_idx',
            ),
            models.Index(
                fields=['email', 'created_at'],
                name='contact_email_created_idx',
            ),
            models.Index(
                fields=['email_delivery_status', 'created_at'],
                name='contact_delivery_created_idx',
            ),
        ]

    def __str__(self):
        return f'Lead {self.public_id} — {self.full_name}'

    def save(self, *args, **kwargs):
        self._update_workflow_timestamps()
        super().save(*args, **kwargs)

    def _update_workflow_timestamps(self):
        """Set workflow timestamps when status transitions occur."""
        now = timezone.now()

        if self.pk:
            try:
                old_status = ContactSubmission.objects.values_list(
                    'status', flat=True
                ).get(pk=self.pk)
            except ContactSubmission.DoesNotExist:
                old_status = self.STATUS_NEW
        else:
            old_status = None

        # First time the submission moves out of new to a contact state.
        if old_status == self.STATUS_NEW and self.status in (
            self.STATUS_CONTACTED, self.STATUS_IN_PROGRESS,
        ):
            if not self.contacted_at:
                self.contacted_at = now

        # Any transition to closed.
        if old_status != self.STATUS_CLOSED and self.status == self.STATUS_CLOSED:
            if not self.closed_at:
                self.closed_at = now

        # Reopening from closed clears the closed timestamp.
        if old_status == self.STATUS_CLOSED and self.status != self.STATUS_CLOSED:
            self.closed_at = None
