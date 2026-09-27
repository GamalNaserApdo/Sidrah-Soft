"""Models for the Training & Education module."""
import os
import re
import secrets

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


class Program(TimeStampedModel):
    """
    A training or education program offered by SidrahSoft.

    Supports four branches:
    - professional: courses for working professionals
    - secondary: programs for secondary/baccalaureate students
    - starter: Sidrah Starter Courses (beginner, from-zero entry programs)
    - summer: Summer Training intake programs
    """

    # Branch choices
    BRANCH_PROFESSIONAL = 'professional'
    BRANCH_SECONDARY = 'secondary'
    BRANCH_STARTER = 'starter'
    BRANCH_SUMMER = 'summer'

    BRANCH_CHOICES = [
        (BRANCH_PROFESSIONAL, _('Professional Training')),
        (BRANCH_SECONDARY, _('Secondary / Baccalaureate Education')),
        (BRANCH_STARTER, _('Sidrah Starter Courses')),
        (BRANCH_SUMMER, _('Summer Training')),
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

    # Registration
    registration_url = models.URLField(_('Registration URL'), blank=True)
    registration_open = models.BooleanField(_('Registration Open'), default=False)
    registration_deadline = models.DateTimeField(_('Registration Deadline'), blank=True, null=True)
    maximum_capacity = models.PositiveIntegerField(_('Maximum Capacity'), blank=True, null=True)
    external_form_key = models.CharField(
        _('External Form Key'),
        max_length=64,
        blank=True,
        null=True,
        unique=True,
        db_index=True,
        help_text=_('Stable identifier mapping an external form to this program; it is not a secret.'),
    )

    # Registration CTAs
    registration_cta_text_en = models.CharField(_('Registration CTA Text (English)'), max_length=120, blank=True)
    registration_cta_text_ar = models.CharField(_('Registration CTA Text (Arabic)'), max_length=120, blank=True)
    registration_closed_cta_text_en = models.CharField(_('Registration Closed CTA Text (English)'), max_length=120, blank=True)
    registration_closed_cta_text_ar = models.CharField(_('Registration Closed CTA Text (Arabic)'), max_length=120, blank=True)
    registration_success_cta_text_en = models.CharField(_('Registration Success CTA Text (English)'), max_length=255, blank=True)
    registration_success_cta_text_ar = models.CharField(_('Registration Success CTA Text (Arabic)'), max_length=255, blank=True)

    # Canonical track name for operational reporting (groups Starter/Professional variants).
    track = models.CharField(
        _('Track'), max_length=255, blank=True, default='',
        help_text=_('Canonical track name used to group related programs in operational reports, e.g. "Data Analysis".'),
    )

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


class TrainingRegistration(TimeStampedModel):
    """A durable training registration, potentially originating from an external form."""

    SOURCE_GOOGLE_FORM = 'google_form'
    SOURCE_CMS_MANUAL = 'cms_manual'
    SOURCE_WEBSITE = 'website'
    SOURCE_CHOICES = [
        (SOURCE_GOOGLE_FORM, _('Google Form')),
        (SOURCE_CMS_MANUAL, _('CMS Manual')),
        (SOURCE_WEBSITE, _('Website Form')),
    ]

    STATUS_NEW = 'new'
    STATUS_REVIEWED = 'reviewed'
    STATUS_ACCEPTED = 'accepted'
    STATUS_REJECTED = 'rejected'
    STATUS_ENROLLED = 'enrolled'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_NEW, _('New')),
        (STATUS_REVIEWED, _('Reviewed')),
        (STATUS_ACCEPTED, _('Accepted')),
        (STATUS_REJECTED, _('Rejected')),
        (STATUS_ENROLLED, _('Enrolled')),
        (STATUS_COMPLETED, _('Completed')),
        (STATUS_CANCELLED, _('Cancelled')),
    ]
    ALLOWED_TRANSITIONS = {
        STATUS_NEW: {STATUS_REVIEWED, STATUS_CANCELLED},
        STATUS_REVIEWED: {STATUS_ACCEPTED, STATUS_REJECTED, STATUS_CANCELLED},
        STATUS_ACCEPTED: {STATUS_ENROLLED, STATUS_CANCELLED},
        STATUS_ENROLLED: {STATUS_COMPLETED, STATUS_CANCELLED},
        STATUS_REJECTED: set(),
        STATUS_COMPLETED: set(),
        STATUS_CANCELLED: set(),
    }

    # Idempotency key scoped to the source channel.
    source = models.CharField(_('Source'), max_length=32, choices=SOURCE_CHOICES, default=SOURCE_CMS_MANUAL, db_index=True)
    external_submission_id = models.CharField(
        _('External Submission ID'),
        max_length=255,
        blank=True,
        db_index=True,
        help_text=_('Idempotency key from the external source (e.g. Google Forms response ID).'),
    )

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='registrations',
        verbose_name=_('Program'),
    )

    # PII (kept within this table; not exposed by public APIs).
    full_name = models.CharField(_('Full Name'), max_length=255)
    email = models.EmailField(_('Email'))
    phone = models.CharField(_('Phone'), max_length=40, blank=True)
    national_id = models.CharField(_('National ID / Iqama'), max_length=40, blank=True)
    college_or_school = models.CharField(_('College or School'), max_length=255, blank=True)
    academic_year = models.CharField(_('Academic Year'), max_length=120, blank=True)
    # Structured education fields (new — additive, backward-compatible with legacy free text)
    university = models.CharField(_('University'), max_length=100, blank=True, default='')
    university_other = models.CharField(_('University (Other — custom text)'), max_length=255, blank=True, default='')
    education_status = models.CharField(_('Education Status'), max_length=20, blank=True, default='')
    education_status_other = models.CharField(_('Education Status (Other — custom text)'), max_length=255, blank=True, default='')

    # Campaign landing page fields (Starter campaign registration).
    # These are additive, backward-compatible, and optional (blank=True, default='').
    # They capture campaign-specific data not covered by the legacy education fields.
    LEVEL_BEGINNER = 'beginner'
    LEVEL_BASIC_KNOWLEDGE = 'basic_knowledge'
    LEVEL_STUDIED_BASICS = 'studied_basics'
    CURRENT_LEVEL_CHOICES = [
        (LEVEL_BEGINNER, _('Complete beginner — starting from zero')),
        (LEVEL_BASIC_KNOWLEDGE, _('Some basic knowledge of the field')),
        (LEVEL_STUDIED_BASICS, _('Studied the basics before')),
    ]
    current_level = models.CharField(
        _('Current Level'), max_length=20, blank=True, default='',
        help_text=_('Applicant self-assessed level for Starter campaign registration.'),
    )

    STATUS_STUDENT = 'student'
    STATUS_GRADUATE = 'graduate'
    STATUS_EMPLOYEE = 'employee'
    STATUS_FREELANCER = 'freelancer'
    STATUS_OTHER = 'other'
    CURRENT_STATUS_CHOICES = [
        (STATUS_STUDENT, _('Student')),
        (STATUS_GRADUATE, _('Graduate')),
        (STATUS_EMPLOYEE, _('Employee')),
        (STATUS_FREELANCER, _('Freelancer')),
        (STATUS_OTHER, _('Other')),
    ]
    current_status = models.CharField(
        _('Current Status'), max_length=20, blank=True, default='',
        help_text=_('Applicant current occupational status for Starter campaign registration.'),
    )
    current_status_other = models.CharField(
        _('Current Status (Other — custom text)'), max_length=255, blank=True, default='',
    )

    ACQ_FACEBOOK = 'facebook'
    ACQ_INSTAGRAM = 'instagram'
    ACQ_LINKEDIN = 'linkedin'
    ACQ_TIKTOK = 'tiktok'
    ACQ_FRIEND = 'friend'
    ACQ_WEBSITE = 'website'
    ACQ_OTHER = 'other'
    ACQUISITION_SOURCE_CHOICES = [
        (ACQ_FACEBOOK, _('Facebook')),
        (ACQ_INSTAGRAM, _('Instagram')),
        (ACQ_LINKEDIN, _('LinkedIn')),
        (ACQ_TIKTOK, _('TikTok')),
        (ACQ_FRIEND, _('Friend / Recommendation')),
        (ACQ_WEBSITE, _('Sidrah Website')),
        (ACQ_OTHER, _('Other')),
    ]
    acquisition_source = models.CharField(
        _('Acquisition Source'), max_length=20, blank=True, default='',
        help_text=_('How the applicant heard about Sidrah (Starter campaign registration).'),
    )
    acquisition_source_other = models.CharField(
        _('Acquisition Source (Other — custom text)'), max_length=255, blank=True, default='',
    )

    preferred_language = models.CharField(_('Preferred Language'), max_length=10, blank=True, default='en')
    notes = models.TextField(_('Applicant Notes'), blank=True)
    internal_notes = models.TextField(_('Internal Notes'), blank=True)

    # Normalized lookup values (populated automatically).
    email_normalized = models.EmailField(_('Normalized Email'), max_length=255, blank=True, db_index=True)
    phone_normalized = models.CharField(_('Normalized Phone'), max_length=40, blank=True, db_index=True)

    status = models.CharField(
        _('Status'),
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
        db_index=True,
    )

    # Review metadata.
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='reviewed_registrations',
        verbose_name=_('Reviewed By'),
    )
    reviewed_at = models.DateTimeField(_('Reviewed At'), blank=True, null=True)
    review_notes = models.TextField(_('Review Notes'), blank=True)

    source_page = models.CharField(_('Source Page'), max_length=512, blank=True)

    # UTM attribution (no PII — safe to log and export)
    utm_source = models.CharField(_('UTM Source'), max_length=255, blank=True, db_index=True)
    utm_medium = models.CharField(_('UTM Medium'), max_length=255, blank=True, db_index=True)
    utm_campaign = models.CharField(_('UTM Campaign'), max_length=255, blank=True, db_index=True)
    utm_content = models.CharField(_('UTM Content'), max_length=255, blank=True)
    utm_term = models.CharField(_('UTM Term'), max_length=255, blank=True)
    referrer = models.CharField(_('HTTP Referrer'), max_length=512, blank=True)
    landing_page_url = models.CharField(_('Landing Page URL'), max_length=512, blank=True)

    submitted_at = models.DateTimeField(_('Submitted At'), auto_now_add=True)

    # Confirmation email delivery state (registration confirmation only).
    # Email failure never affects registration success — these fields are audit-only.
    CONFIRMATION_NOT_ATTEMPTED = 'not_attempted'
    CONFIRMATION_SENT = 'sent'
    CONFIRMATION_FAILED = 'failed'
    CONFIRMATION_EMAIL_STATUS_CHOICES = [
        (CONFIRMATION_NOT_ATTEMPTED, _('Not attempted')),
        (CONFIRMATION_SENT, _('Sent')),
        (CONFIRMATION_FAILED, _('Failed')),
    ]
    confirmation_email_status = models.CharField(
        _('Confirmation Email Status'),
        max_length=20,
        choices=CONFIRMATION_EMAIL_STATUS_CHOICES,
        default=CONFIRMATION_NOT_ATTEMPTED,
        db_index=True,
    )
    confirmation_email_attempted_at = models.DateTimeField(
        _('Confirmation Email Attempted At'), blank=True, null=True,
    )
    confirmation_email_sent_at = models.DateTimeField(
        _('Confirmation Email Sent At'), blank=True, null=True,
    )
    confirmation_email_error_summary = models.TextField(
        _('Confirmation Email Error Summary'), blank=True, default='',
    )

    # -----------------------------------------------------------------
    # Operational enrollment / payment / follow-up fields (Phase 1)
    # -----------------------------------------------------------------

    # Operational enrollment stage (independent from training lifecycle status).
    ENROLLMENT_STAGE_UNKNOWN = 'unknown'
    ENROLLMENT_STAGE_NEEDS_CONTACT = 'needs_contact'
    ENROLLMENT_STAGE_CONTACTED = 'contacted'
    ENROLLMENT_STAGE_FOLLOW_UP = 'follow_up'
    ENROLLMENT_STAGE_PENDING_PAYMENT = 'pending_payment'
    ENROLLMENT_STAGE_CONFIRMED = 'confirmed'
    ENROLLMENT_STAGE_CANCELLED = 'cancelled'
    ENROLLMENT_STAGE_CHOICES = [
        (ENROLLMENT_STAGE_UNKNOWN, _('Unknown')),
        (ENROLLMENT_STAGE_NEEDS_CONTACT, _('Needs Contact')),
        (ENROLLMENT_STAGE_CONTACTED, _('Contacted')),
        (ENROLLMENT_STAGE_FOLLOW_UP, _('Follow-up Required')),
        (ENROLLMENT_STAGE_PENDING_PAYMENT, _('Pending Payment')),
        (ENROLLMENT_STAGE_CONFIRMED, _('Confirmed / Enrolled')),
        (ENROLLMENT_STAGE_CANCELLED, _('Cancelled')),
    ]
    enrollment_stage = models.CharField(
        _('Enrollment Stage'),
        max_length=20,
        choices=ENROLLMENT_STAGE_CHOICES,
        default=ENROLLMENT_STAGE_UNKNOWN,
        db_index=True,
        help_text=_('Operational follow-up stage. Independent from the training lifecycle status.'),
    )

    # Payment tracking.
    PAYMENT_STATUS_UNKNOWN = 'unknown'
    PAYMENT_STATUS_UNPAID = 'unpaid'
    PAYMENT_STATUS_PENDING = 'pending'
    PAYMENT_STATUS_PAID = 'paid'
    PAYMENT_STATUS_NOT_APPLICABLE = 'not_applicable'
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_UNKNOWN, _('Unknown')),
        (PAYMENT_STATUS_UNPAID, _('Unpaid')),
        (PAYMENT_STATUS_PENDING, _('Pending')),
        (PAYMENT_STATUS_PAID, _('Paid')),
        (PAYMENT_STATUS_NOT_APPLICABLE, _('Not Applicable')),
    ]
    payment_status = models.CharField(
        _('Payment Status'),
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_STATUS_UNKNOWN,
        db_index=True,
        help_text=_('Payment tracking. Historical records default to Unknown.'),
    )
    paid_amount = models.DecimalField(
        _('Paid Amount'), max_digits=10, decimal_places=2,
        blank=True, null=True,
    )
    PAYMENT_METHOD_CASH = 'cash'
    PAYMENT_METHOD_BANK_TRANSFER = 'bank_transfer'
    PAYMENT_METHOD_VODAFONE_CASH = 'vodafone_cash'
    PAYMENT_METHOD_INSTAPAY = 'instapay'
    PAYMENT_METHOD_OTHER = 'other'
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_METHOD_CASH, _('Cash')),
        (PAYMENT_METHOD_BANK_TRANSFER, _('Bank Transfer')),
        (PAYMENT_METHOD_VODAFONE_CASH, _('Vodafone Cash')),
        (PAYMENT_METHOD_INSTAPAY, _('InstaPay')),
        (PAYMENT_METHOD_OTHER, _('Other')),
    ]
    payment_method = models.CharField(
        _('Payment Method'), max_length=20,
        choices=PAYMENT_METHOD_CHOICES, blank=True, default='',
    )
    payment_date = models.DateField(_('Payment Date'), blank=True, null=True)
    payment_reference = models.CharField(_('Payment Reference'), max_length=255, blank=True, default='')
    payment_notes = models.TextField(_('Payment Notes'), blank=True, default='')

    # WhatsApp group enrollment tracking.
    whatsapp_group_added = models.BooleanField(
        _('WhatsApp Group Added'), default=False, db_index=True,
    )
    whatsapp_group_added_at = models.DateTimeField(
        _('WhatsApp Group Added At'), blank=True, null=True,
    )
    whatsapp_group_added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True, null=True,
        related_name='whatsapp_group_additions',
        verbose_name=_('WhatsApp Group Added By'),
    )

    # Follow-up management.
    last_contacted_at = models.DateTimeField(
        _('Last Contacted At'), blank=True, null=True,
    )
    next_follow_up_at = models.DateField(
        _('Next Follow-up At'), blank=True, null=True, db_index=True,
    )
    follow_up_notes = models.TextField(_('Follow-up Notes'), blank=True, default='')

    # -----------------------------------------------------------------
    # Course price snapshot (immutable).
    #
    # Captured server-side at creation from ProgramLanding.current_price/
    # currency so a later price change never rewrites what the customer
    # registered at. NULL for legacy registrations where the
    # registration-time price cannot be proven. Distinct from
    # ``paid_amount`` (the amount actually received). Never writable via
    # serializers — populated by ``save()`` on create only.
    # -----------------------------------------------------------------
    course_price = models.DecimalField(
        _('Course Price'), max_digits=10, decimal_places=2,
        blank=True, null=True,
        validators=[MinValueValidator(0)],
        help_text=_('Advertised course price at the time of registration.'),
    )
    course_price_currency = models.CharField(
        _('Course Price Currency'), max_length=8, blank=True, default='',
        help_text=_('Currency of the registration-time course price snapshot.'),
    )

    # -----------------------------------------------------------------
    # Primary operational status (four-state staff workflow).
    #
    # This is the PRIMARY pipeline shown in the CMS registrations UI:
    #   lead -> contacted -> subscribed, plus cancelled.
    # It is intentionally independent from the legacy training lifecycle
    # ``status`` (which still governs certificates/completion), the legacy
    # ``enrollment_stage`` (retained for historical data only), and the
    # ``payment_status``/WhatsApp metadata (secondary, never implied by
    # this field).
    # -----------------------------------------------------------------
    OPS_LEAD = 'lead'
    OPS_CONTACTED = 'contacted'
    OPS_SUBSCRIBED = 'subscribed'
    OPS_CANCELLED = 'cancelled'
    OPERATIONAL_STATUS_CHOICES = [
        (OPS_LEAD, _('Lead')),
        (OPS_CONTACTED, _('Contacted')),
        (OPS_SUBSCRIBED, _('Subscribed')),
        (OPS_CANCELLED, _('Cancelled')),
    ]
    OPERATIONAL_TRANSITIONS = {
        OPS_LEAD: {OPS_CONTACTED, OPS_CANCELLED},
        OPS_CONTACTED: {OPS_SUBSCRIBED, OPS_CANCELLED},
        OPS_SUBSCRIBED: {OPS_CONTACTED, OPS_CANCELLED},
        OPS_CANCELLED: {OPS_CONTACTED},
    }
    operational_status = models.CharField(
        _('Operational Status'),
        max_length=16,
        choices=OPERATIONAL_STATUS_CHOICES,
        default=OPS_LEAD,
        db_index=True,
        help_text=_('Primary staff workflow status (lead/contacted/subscribed/cancelled).'),
    )

    def allowed_operational_transitions(self):
        return self.OPERATIONAL_TRANSITIONS.get(self.operational_status, set())

    def apply_operational_transition(self, new_status, save=True):
        """Validate and apply an operational status transition.

        Raises ValidationError on an invalid transition. When transitioning
        into ``contacted``, ``last_contacted_at`` is stamped in the same
        write so the two never diverge.
        """
        if new_status not in dict(self.OPERATIONAL_STATUS_CHOICES):
            raise ValidationError({'operational_status': 'Invalid operational status.'})
        old = self.operational_status
        if new_status == old:
            raise ValidationError({'operational_status': 'Already in this status.'})
        if new_status not in self.OPERATIONAL_TRANSITIONS.get(old, set()):
            raise ValidationError({'operational_status': f'Invalid transition: {old} -> {new_status}.'})
        self.operational_status = new_status
        update_fields = ['operational_status']
        if new_status == self.OPS_CONTACTED:
            self.last_contacted_at = timezone.now()
            update_fields.append('last_contacted_at')
        if save:
            self.save(update_fields=update_fields + ['updated_at'])
        return old

    class Meta:
        db_table = 'training_trainingregistration'
        ordering = ['-submitted_at']
        verbose_name = _('Training Registration')
        verbose_name_plural = _('Training Registrations')
        indexes = [
            models.Index(fields=['status', 'submitted_at'], name='tr_reg_status_submitted_idx'),
            models.Index(fields=['program', 'status'], name='tr_reg_program_status_idx'),
            models.Index(fields=['enrollment_stage', 'submitted_at'], name='tr_reg_stage_submitted_idx'),
            models.Index(fields=['payment_status', 'submitted_at'], name='tr_reg_payment_submitted_idx'),
            models.Index(fields=['whatsapp_group_added', 'payment_status'], name='tr_reg_whatsapp_payment_idx'),
            models.Index(fields=['next_follow_up_at'], name='tr_reg_followup_idx'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['source', 'external_submission_id'],
                name='training_reg_unique_external_submission',
                condition=models.Q(external_submission_id__gt=''),
            ),
        ]

    def __str__(self):
        identifier = self.pk if self.pk is not None else 'unsaved'
        return f'Training registration {identifier} — {self.program.title_en}'

    def clean(self):
        self._normalize_fields()
        self._validate_status_transition()
        super().clean()

    def save(self, *args, **kwargs):
        self._normalize_fields()
        self._validate_status_transition()
        self._update_status_timestamps()
        self._snapshot_course_price()
        super().save(*args, **kwargs)

    def _snapshot_course_price(self):
        """Copy the program's current advertised price on first save only.

        Only runs for new rows with no snapshot, so a later ProgramLanding
        price change — or a program reassignment on an existing
        registration — never overwrites the registration-time price.
        """
        if self.pk is not None or self.course_price is not None or not self.program_id:
            return
        try:
            landing = self.program.landing
        except ProgramLanding.DoesNotExist:
            return
        self.course_price = landing.current_price
        self.course_price_currency = landing.currency or ''

    def _normalize_fields(self):
        if self.email:
            self.email = self.email.strip().lower()
            self.email_normalized = self.email
        if self.phone:
            digits = re.sub(r'\D', '', self.phone)
            self.phone_normalized = digits
        if self.full_name:
            self.full_name = ' '.join(self.full_name.split())
        if self.national_id:
            self.national_id = self.national_id.strip()

    def _validate_status_transition(self):
        if not self.pk:
            if self.status != self.STATUS_NEW:
                raise ValidationError({'status': 'New registrations must start with status "new".'})
            return
        previous = TrainingRegistration.objects.filter(pk=self.pk).values_list('status', flat=True).first()
        if previous and previous != self.status and self.status not in self.ALLOWED_TRANSITIONS[previous]:
            raise ValidationError({'status': f'Invalid registration status transition: {previous} -> {self.status}.'})

    def _update_status_timestamps(self):
        if self.status != self.STATUS_NEW and not self.reviewed_at:
            self.reviewed_at = timezone.now()

    @property
    def certificate_eligible(self):
        return self.status == self.STATUS_COMPLETED


class Certificate(TimeStampedModel):
    """A certificate issued for training completion or recognition.

    Two types:
    - completion: Linked to a TrainingRegistration that is 'completed'.
    - recognition: Standalone appreciation/recognition certificate (no registration required).
    - instructor: Instructor certificate (no registration required, direct recipient_name).
    """

    STATUS_DRAFT = 'draft'
    STATUS_ISSUED = 'issued'
    STATUS_REVOKED = 'revoked'
    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_ISSUED, _('Issued')),
        (STATUS_REVOKED, _('Revoked')),
    ]

    TYPE_COMPLETION = 'completion'
    TYPE_RECOGNITION = 'recognition'
    TYPE_INSTRUCTOR = 'instructor'
    TYPE_CHOICES = [
        (TYPE_COMPLETION, _('Completion')),
        (TYPE_RECOGNITION, _('Recognition')),
        (TYPE_INSTRUCTOR, _('Instructor')),
    ]

    certificate_type = models.CharField(
        _('Certificate Type'), max_length=16,
        choices=TYPE_CHOICES, default=TYPE_COMPLETION,
        db_index=True,
    )

    # For completion certificates, linked to the registration
    training_registration = models.OneToOneField(
        TrainingRegistration,
        on_delete=models.CASCADE,
        related_name='certificate',
        verbose_name=_('Training Registration'),
        blank=True,
        null=True,
    )

    # For recognition certificates (or as explicit override for completion)
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='certificates',
        verbose_name=_('Program'),
        blank=True,
        null=True,
    )

    # Recipient name — for recognition certificates without a registration
    # For completion, derived from training_registration.full_name
    recipient_name = models.CharField(_('Recipient Name'), max_length=255, blank=True)

    # Certificate title (e.g., "Professional Frontend Development")
    certificate_title = models.CharField(_('Certificate Title'), max_length=255, blank=True)

    # For recognition certificates
    recognition_reason = models.TextField(_('Recognition Reason'), blank=True)

    status = models.CharField(
        _('Status'),
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        db_index=True,
    )

    # Stable, non-sequential public reference: SDR-TRN-{year}-{random6}.
    reference = models.CharField(
        _('Certificate Reference'),
        max_length=64,
        unique=True,
        db_index=True,
        editable=False,
    )

    certificate_number = models.CharField(_('Certificate Number'), max_length=120, blank=True, null=True, unique=True)
    training_start_date = models.DateField(_('Training Start Date'), blank=True, null=True)
    training_end_date = models.DateField(_('Training End Date'), blank=True, null=True)
    grade = models.CharField(_('Grade'), max_length=120, blank=True)
    result = models.CharField(_('Result'), max_length=255, blank=True)
    issued_at = models.DateTimeField(_('Issued At'), blank=True, null=True)
    revoked_at = models.DateTimeField(_('Revoked At'), blank=True, null=True)
    revoked_reason = models.TextField(_('Revoked Reason (Internal)'), blank=True)

    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='issued_certificates',
        verbose_name=_('Issued By'),
    )
    revoked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='revoked_certificates',
        verbose_name=_('Revoked By'),
    )

    media_asset = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='certificates',
        verbose_name=_('Certificate Media Asset'),
    )

    # Manually-designed final certificate PDF (authoritative artwork).
    # The file is created outside the website and uploaded as-is.
    # The application MUST NOT modify, regenerate, or overlay content on this file.
    # Stored under media/certificates/ — the database stores the media-relative path.
    certificate_file = models.FileField(
        _('Certificate File'),
        upload_to='certificates/',
        blank=True,
        null=True,
        help_text=_('Manually-designed final certificate PDF. File must not be modified by the application.'),
    )

    class Meta:
        db_table = 'training_certificate'
        verbose_name = _('Certificate')
        verbose_name_plural = _('Certificates')
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['reference'], name='training_cert_unique_reference'),
            models.CheckConstraint(
                condition=models.Q(status__in=['draft', 'revoked']) | models.Q(issued_at__isnull=False),
                name='training_cert_issued_requires_timestamp',
            ),
            # Completion certificates must have a registration;
            # recognition and instructor must have recipient_name
            models.CheckConstraint(
                condition=(
                    models.Q(certificate_type='completion', training_registration__isnull=False) |
                    models.Q(certificate_type='recognition', recipient_name__gt='') |
                    models.Q(certificate_type='instructor', recipient_name__gt='')
                ),
                name='training_cert_type_consistency',
            ),
        ]

    def __str__(self):
        return self.reference

    @property
    def effective_recipient_name(self):
        """Return recipient name from registration or direct field."""
        if self.recipient_name:
            return self.recipient_name
        if self.training_registration:
            return self.training_registration.full_name
        return ''

    @property
    def effective_program(self):
        """Return program from registration or direct FK."""
        if self.training_registration:
            return self.training_registration.program
        return self.program

    @property
    def effective_certificate_title(self):
        """Return certificate title or derive from program."""
        if self.certificate_title:
            return self.certificate_title
        program = self.effective_program
        if program:
            return program.title_en
        return ''

    def clean(self):
        if self.certificate_type == self.TYPE_COMPLETION and not self.training_registration:
            raise ValidationError({'training_registration': 'Completion certificates require a training registration.'})
        if self.certificate_type in (self.TYPE_RECOGNITION, self.TYPE_INSTRUCTOR) and not self.recipient_name:
            raise ValidationError({'recipient_name': 'Recognition and Instructor certificates require a recipient name.'})
        if self.certificate_type == self.TYPE_COMPLETION:
            reg = self.training_registration
            if reg and reg.status != TrainingRegistration.STATUS_COMPLETED:
                raise ValidationError({
                    'training_registration': 'Cannot issue completion certificate for a registration that is not completed.'
                })
        # Validate that the certificate_file filename matches the reference
        if self.certificate_file:
            filename = os.path.basename(self.certificate_file.name)
            name_without_ext = os.path.splitext(filename)[0]
            if name_without_ext != self.reference:
                raise ValidationError({
                    'certificate_file': f'Certificate file filename ({filename}) must match the reference ({self.reference}).'
                })
        super().clean()

    def save(self, *args, **kwargs):
        if self.pk:
            original_reference = Certificate.objects.filter(pk=self.pk).values_list('reference', flat=True).first()
            if original_reference and self.reference != original_reference:
                raise ValidationError({'reference': 'Certificate references cannot be changed.'})
        elif not self.reference:
            self.reference = self._generate_reference()
        self._update_lifecycle_timestamps()
        super().save(*args, **kwargs)

    def _generate_reference(self):
        """Generate SDR-TRN-{year}-{random6} using cryptographically secure randomness."""
        year = timezone.now().year
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

        for _ in range(10):
            random_part = ''.join(secrets.choice(alphabet) for _ in range(6))
            reference = f'SDR-TRN-{year}-{random_part}'
            if not Certificate.objects.filter(reference=reference).exists():
                return reference

        raise RuntimeError('Unable to generate a unique certificate reference')

    def _update_lifecycle_timestamps(self):
        now = timezone.now()
        if self.status == self.STATUS_ISSUED and not self.issued_at:
            self.issued_at = now
        if self.status == self.STATUS_REVOKED and not self.revoked_at:
            self.revoked_at = now
        if self.status != self.STATUS_REVOKED:
            self.revoked_at = None


# ---------------------------------------------------------------------------
# Landing Page models
# ---------------------------------------------------------------------------

class ProgramLanding(TimeStampedModel):
    """
    Landing-page-specific data for a Program.

    OneToOne to Program so Secondary programs are unaffected.
    All fields are optional — empty values signal "hide this section".
    """

    VIDEO_NONE = 'none'
    VIDEO_UPLOADED = 'uploaded'
    VIDEO_YOUTUBE = 'youtube'
    VIDEO_TYPE_CHOICES = [
        (VIDEO_NONE, _('No video')),
        (VIDEO_UPLOADED, _('Uploaded file')),
        (VIDEO_YOUTUBE, _('YouTube')),
    ]

    program = models.OneToOneField(
        Program,
        on_delete=models.CASCADE,
        related_name='landing',
        verbose_name=_('Program'),
    )

    # Hero
    headline_en = models.CharField(_('Headline (English)'), max_length=500, blank=True)
    headline_ar = models.CharField(_('Headline (Arabic)'), max_length=500, blank=True)

    # Intro video
    intro_video_type = models.CharField(
        _('Intro Video Type'), max_length=16,
        choices=VIDEO_TYPE_CHOICES, default=VIDEO_NONE,
    )
    intro_video_url = models.URLField(_('YouTube URL'), blank=True)
    intro_video_file = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='program_intro_videos',
        verbose_name=_('Uploaded Video'),
    )
    video_poster = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='program_video_posters',
        verbose_name=_('Video Poster'),
    )
    video_title_en = models.CharField(_('Video Title (English)'), max_length=255, blank=True)
    video_title_ar = models.CharField(_('Video Title (Arabic)'), max_length=255, blank=True)

    # Quick Facts (stored as JSON for flexibility — all optional)
    quick_facts = models.JSONField(
        _('Quick Facts'), default=dict, blank=True,
        help_text=_('Structured quick facts: level, training_mode, language, '
                    'duration, hours, sessions, start_date, end_date, '
                    'has_recordings, has_certificate, has_support, practical_nature. '
                    'Each value is {ar, en} or scalar.'),
    )

    # Pricing
    current_price = models.DecimalField(
        _('Current Price'), max_digits=10, decimal_places=2,
        blank=True, null=True,
    )
    original_price = models.DecimalField(
        _('Original Price'), max_digits=10, decimal_places=2,
        blank=True, null=True,
    )
    currency = models.CharField(_('Currency'), max_length=8, default='EGP')
    included_items = models.JSONField(
        _('Included Items'), default=dict, blank=True,
        help_text=_('{"ar": [...], "en": [...]}'),
    )
    show_pricing = models.BooleanField(_('Show Pricing Section'), default=True)

    # Content sections (JSON lists of strings for simple lists)
    target_audience = models.JSONField(
        _('Target Audience'), default=dict, blank=True,
        help_text=_('{"ar": [...], "en": [...]}'),
    )
    prerequisites = models.JSONField(
        _('Prerequisites'), default=dict, blank=True,
        help_text=_('{"ar": [...], "en": [...]}'),
    )
    tools = models.JSONField(
        _('Tools & Technologies'), default=dict, blank=True,
        help_text=_('{"ar": [...], "en": [...]}'),
    )

    # Practical training & final project
    practical_training_en = models.TextField(_('Practical Training (English)'), blank=True)
    practical_training_ar = models.TextField(_('Practical Training (Arabic)'), blank=True)
    final_project_en = models.TextField(_('Final Project (English)'), blank=True)
    final_project_ar = models.TextField(_('Final Project (Arabic)'), blank=True)

    # Training experience & mentor (CMS-managed shared training experience text)
    training_experience_en = models.TextField(
        _('Training Experience (English)'), blank=True, default='',
        help_text=_('Shared training experience: live training, recorded sessions, hands-on learning, etc.'),
    )
    training_experience_ar = models.TextField(
        _('Training Experience (Arabic)'), blank=True, default='',
        help_text=_('Shared training experience: live training, recorded sessions, hands-on learning, etc.'),
    )
    mentor_info_en = models.TextField(
        _('Mentor & Follow-up Info (English)'), blank=True, default='',
        help_text=_('Mentor support, follow-up, and student guidance information.'),
    )
    mentor_info_ar = models.TextField(
        _('Mentor & Follow-up Info (Arabic)'), blank=True, default='',
        help_text=_('Mentor support, follow-up, and student guidance information.'),
    )

    # Installments (CMS-managed payment plan information)
    installments_available = models.BooleanField(
        _('Installments Available'), default=False,
        help_text=_('Whether installment-based payment is available for this program.'),
    )
    installments_info_en = models.TextField(
        _('Installments Info (English)'), blank=True, default='',
        help_text=_('Installment plan details, payment methods, and instructions.'),
    )
    installments_info_ar = models.TextField(
        _('Installments Info (Arabic)'), blank=True, default='',
        help_text=_('Installment plan details, payment methods, and instructions.'),
    )

    # SEO
    seo_title_en = models.CharField(_('SEO Title (English)'), max_length=255, blank=True)
    seo_title_ar = models.CharField(_('SEO Title (Arabic)'), max_length=255, blank=True)
    seo_meta_description_en = models.TextField(_('SEO Meta Description (English)'), blank=True)
    seo_meta_description_ar = models.TextField(_('SEO Meta Description (Arabic)'), blank=True)
    og_image = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='program_og_images',
        verbose_name=_('Open Graph Image'),
    )
    canonical_slug = models.CharField(_('Canonical Slug'), max_length=255, blank=True)
    seo_noindex = models.BooleanField(_('No Index'), default=False)

    # Registration form settings (CMS-managed)
    show_registration_form = models.BooleanField(_('Show Registration Form'), default=True)
    registration_form_title_en = models.CharField(
        _('Form Title (English)'), max_length=255, blank=True,
        default='Register for this Course',
    )
    registration_form_title_ar = models.CharField(
        _('Form Title (Arabic)'), max_length=255, blank=True,
        default='سجل في هذه الدورة',
    )
    registration_form_description_en = models.TextField(_('Form Description (English)'), blank=True)
    registration_form_description_ar = models.TextField(_('Form Description (Arabic)'), blank=True)
    registration_form_button_en = models.CharField(
        _('Submit Button (English)'), max_length=120, blank=True, default='Submit Registration',
    )
    registration_form_button_ar = models.CharField(
        _('Submit Button (Arabic)'), max_length=120, blank=True, default='إرسال التسجيل',
    )
    registration_success_message_en = models.TextField(
        _('Success Message (English)'), blank=True,
        default='Your registration has been received. We will contact you soon.',
    )
    registration_success_message_ar = models.TextField(
        _('Success Message (Arabic)'), blank=True,
        default='تم استلام تسجيلك. سنتواصل معك قريبًا.',
    )
    registration_closed_message_en = models.TextField(
        _('Closed Message (English)'), blank=True,
        default='Registration for this course is currently closed.',
    )
    registration_closed_message_ar = models.TextField(
        _('Closed Message (Arabic)'), blank=True,
        default='التسجيل في هذه الدورة مغلق حاليًا.',
    )
    fallback_google_form_url = models.URLField(
        _('Fallback Google Form URL'), blank=True,
        help_text=_('Shown when the backend form is unavailable. Leave empty to hide.'),
    )

    class Meta:
        db_table = 'training_programlanding'
        verbose_name = _('Program Landing Page')
        verbose_name_plural = _('Program Landing Pages')

    def __str__(self):
        return f'Landing for {self.program.title_en}'

    def clean(self):
        super().clean()
        if self.current_price is not None and self.current_price < 0:
            raise ValidationError({'current_price': 'Price cannot be negative.'})
        if self.original_price is not None and self.original_price < 0:
            raise ValidationError({'original_price': 'Original price cannot be negative.'})
        if (
            self.current_price is not None
            and self.original_price is not None
            and self.original_price <= self.current_price
        ):
            raise ValidationError({
                'original_price': 'Original price must be greater than the current price.'
            })
        if self.intro_video_type == self.VIDEO_YOUTUBE and not self.intro_video_url:
            raise ValidationError({
                'intro_video_url': 'YouTube URL is required when video type is YouTube.'
            })
        if self.intro_video_type == self.VIDEO_UPLOADED and not self.intro_video_file:
            raise ValidationError({
                'intro_video_file': 'An uploaded video file is required when video type is uploaded.'
            })

    @property
    def discount_percentage(self):
        """Calculate discount percentage; returns None if no original price."""
        if (
            self.current_price is not None
            and self.original_price is not None
            and self.original_price > 0
        ):
            return round(
                (1 - float(self.current_price) / float(self.original_price)) * 100
            )
        return None


class ProgramModule(TimeStampedModel):
    """A curriculum module (unit) within a Program."""

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE,
        related_name='curriculum_modules',
        verbose_name=_('Program'),
    )
    title_en = models.CharField(_('Title (English)'), max_length=255)
    title_ar = models.CharField(_('Title (Arabic)'), max_length=255, blank=True)
    description_en = models.TextField(_('Description (English)'), blank=True)
    description_ar = models.TextField(_('Description (Arabic)'), blank=True)
    display_order = models.PositiveIntegerField(_('Display Order'), default=0)
    is_published = models.BooleanField(_('Published'), default=True)

    class Meta:
        db_table = 'training_programmodule'
        ordering = ['display_order', 'id']
        verbose_name = _('Program Module')
        verbose_name_plural = _('Program Modules')
        indexes = [
            models.Index(fields=['program', 'display_order'], name='tr_module_order_idx'),
        ]

    def __str__(self):
        return f'{self.program.title_en} — {self.title_en}'


class ModuleTopic(TimeStampedModel):
    """A topic within a curriculum module."""

    module = models.ForeignKey(
        ProgramModule, on_delete=models.CASCADE,
        related_name='topics',
        verbose_name=_('Module'),
    )
    title_en = models.CharField(_('Title (English)'), max_length=255)
    title_ar = models.CharField(_('Title (Arabic)'), max_length=255, blank=True)
    display_order = models.PositiveIntegerField(_('Display Order'), default=0)

    class Meta:
        db_table = 'training_moduletopic'
        ordering = ['display_order', 'id']
        verbose_name = _('Module Topic')
        verbose_name_plural = _('Module Topics')
        indexes = [
            models.Index(fields=['module', 'display_order'], name='tr_topic_order_idx'),
        ]

    def __str__(self):
        return f'{self.module.title_en} — {self.title_en}'


class Instructor(TimeStampedModel):
    """A reusable instructor who can be associated with multiple programs."""

    name_en = models.CharField(_('Name (English)'), max_length=255)
    name_ar = models.CharField(_('Name (Arabic)'), max_length=255, blank=True)
    title_en = models.CharField(_('Job Title (English)'), max_length=255, blank=True)
    title_ar = models.CharField(_('Job Title (Arabic)'), max_length=255, blank=True)
    bio_en = models.TextField(_('Bio (English)'), blank=True)
    bio_ar = models.TextField(_('Bio (Arabic)'), blank=True)
    image = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='instructor_images',
        verbose_name=_('Photo'),
    )
    linkedin_url = models.URLField(_('LinkedIn URL'), blank=True)
    is_active = models.BooleanField(_('Active'), default=True)

    class Meta:
        db_table = 'training_instructor'
        ordering = ['name_en']
        verbose_name = _('Instructor')
        verbose_name_plural = _('Instructors')

    def __str__(self):
        return self.name_en


class ProgramInstructor(TimeStampedModel):
    """Through model linking Instructor to Program with display order."""

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE,
        related_name='program_instructors',
        verbose_name=_('Program'),
    )
    instructor = models.ForeignKey(
        Instructor, on_delete=models.CASCADE,
        related_name='program_instructors',
        verbose_name=_('Instructor'),
    )
    display_order = models.PositiveIntegerField(_('Display Order'), default=0)

    class Meta:
        db_table = 'training_programinstructor'
        ordering = ['display_order', 'id']
        verbose_name = _('Program Instructor')
        verbose_name_plural = _('Program Instructors')
        constraints = [
            models.UniqueConstraint(
                fields=['program', 'instructor'],
                name='unique_program_instructor',
            ),
        ]
        indexes = [
            models.Index(fields=['program', 'display_order'], name='tr_instr_order_idx'),
        ]

    def __str__(self):
        return f'{self.program.title_en} — {self.instructor.name_en}'


class ProgramTestimonial(TimeStampedModel):
    """A student testimonial for a specific program."""

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE,
        related_name='program_testimonials',
        verbose_name=_('Program'),
    )
    student_name_en = models.CharField(_('Student Name (English)'), max_length=255)
    student_name_ar = models.CharField(_('Student Name (Arabic)'), max_length=255, blank=True)
    content_en = models.TextField(_('Testimonial (English)'), blank=True)
    content_ar = models.TextField(_('Testimonial (Arabic)'), blank=True)
    rating = models.PositiveSmallIntegerField(
        _('Rating'), default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    image = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='testimonial_images',
        verbose_name=_('Student Photo'),
    )
    is_approved = models.BooleanField(
        _('Approved / Published'), default=False,
        help_text=_('Only approved testimonials appear on public pages.'),
    )
    display_order = models.PositiveIntegerField(_('Display Order'), default=0)

    class Meta:
        db_table = 'training_programtestimonial'
        ordering = ['display_order', 'id']
        verbose_name = _('Program Testimonial')
        verbose_name_plural = _('Program Testimonials')
        indexes = [
            models.Index(fields=['program', 'is_approved', 'display_order'], name='tr_test_order_idx'),
        ]

    def __str__(self):
        return f'{self.program.title_en} — {self.student_name_en}'


class ProgramFAQ(TimeStampedModel):
    """A frequently asked question for a specific program."""

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE,
        related_name='program_faqs',
        verbose_name=_('Program'),
    )
    question_en = models.CharField(_('Question (English)'), max_length=500)
    question_ar = models.CharField(_('Question (Arabic)'), max_length=500, blank=True)
    answer_en = models.TextField(_('Answer (English)'), blank=True)
    answer_ar = models.TextField(_('Answer (Arabic)'), blank=True)
    display_order = models.PositiveIntegerField(_('Display Order'), default=0)

    class Meta:
        db_table = 'training_programfaq'
        ordering = ['display_order', 'id']
        verbose_name = _('Program FAQ')
        verbose_name_plural = _('Program FAQs')
        indexes = [
            models.Index(fields=['program', 'display_order'], name='tr_faq_order_idx'),
        ]

    def __str__(self):
        return f'{self.program.title_en} — {self.question_en}'


# ---------------------------------------------------------------------------
# Courses Offers — OfferCampaign → OfferItem → Program
# ---------------------------------------------------------------------------

# CTA destinations that must never be allowed in CMS-managed offer fields.
_BLOCKED_CTA_SCHEMES = ('javascript:', 'data:', 'vbscript:', 'file:', 'about:')


def validate_offer_cta_url(value):
    """Validate a CMS-managed offer CTA URL.

    Accepts internal paths (starting with /), internal anchors (#),
    and absolute https:// URLs. Rejects dangerous schemes and
    protocol-relative URLs to prevent CMS-injected navigation attacks.
    """
    if not value:
        return value
    if not isinstance(value, str):
        raise ValidationError('CTA URL must be a string.')
    lowered = value.lower().strip()
    for scheme in _BLOCKED_CTA_SCHEMES:
        if lowered.startswith(scheme):
            raise ValidationError(f'CTA URL must not use the {scheme} scheme.')
    if lowered.startswith('//'):
        raise ValidationError('CTA URL must not use protocol-relative URLs.')
    if lowered.startswith(('#', '/')) or lowered.startswith('https://'):
        return value
    raise ValidationError(
        'CTA URL must be an internal path (/), internal anchor (#), or https:// URL.'
    )


class OfferCampaignQuerySet(models.QuerySet):
    """Query helpers for offer campaign scheduling."""

    def active_now(self):
        """Campaigns visible on public surfaces right now.

        A campaign is publicly visible when it is manually active AND its
        schedule window includes the current timezone-aware moment:
        start_date <= now AND (end_date is null OR end_date >= now).
        Expired or not-yet-started campaigns are excluded but never deleted,
        preserving CMS history.
        """
        now = timezone.now()
        return self.filter(
            is_active=True,
            start_date__lte=now,
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=now),
        )

    def scheduled(self):
        """Campaigns that are active but have not started yet."""
        now = timezone.now()
        return self.filter(is_active=True, start_date__gt=now)

    def expired(self):
        """Campaigns whose end date has passed."""
        now = timezone.now()
        return self.filter(end_date__lt=now)


class OfferCampaign(TimeStampedModel):
    """A promotional campaign grouping course offers under shared scheduling.

    One campaign can contain many courses (via OfferItem). Campaign-level
    metadata (title, dates, global copy, default badge) lives once; per-course
    customization lives on each OfferItem. Campaigns are never deleted on
    expiry — they simply stop appearing on public active surfaces.
    """

    slug = models.SlugField(_('Slug'), max_length=255, unique=True, db_index=True)
    title_en = models.CharField(_('Title (English)'), max_length=255)
    title_ar = models.CharField(_('Title (Arabic)'), max_length=255, blank=True)
    description_en = models.TextField(_('Description (English)'), blank=True)
    description_ar = models.TextField(_('Description (Arabic)'), blank=True)
    badge_en = models.CharField(
        _('Default Badge (English)'), max_length=80, blank=True,
        help_text=_('Default badge shown for offer items that do not override it.'),
    )
    badge_ar = models.CharField(_('Default Badge (Arabic)'), max_length=80, blank=True)

    start_date = models.DateTimeField(
        _('Start Date'),
        help_text=_('Campaign becomes publicly visible at this moment (when active).'),
    )
    end_date = models.DateTimeField(
        _('End Date'), null=True, blank=True,
        help_text=_('Leave empty for an open-ended campaign.'),
    )
    is_active = models.BooleanField(
        _('Active'), default=False, db_index=True,
        help_text=_('Manual toggle. Public visibility also requires the schedule window to include now.'),
    )
    priority = models.PositiveIntegerField(
        _('Priority'), default=0, db_index=True,
        help_text=_('Lower values appear first when multiple campaigns are active.'),
    )

    # SEO (follows the existing per-model SEO field convention)
    seo_title_en = models.CharField(_('SEO Title (English)'), max_length=255, blank=True)
    seo_title_ar = models.CharField(_('SEO Title (Arabic)'), max_length=255, blank=True)
    seo_description_en = models.TextField(_('SEO Description (English)'), blank=True)
    seo_description_ar = models.TextField(_('SEO Description (Arabic)'), blank=True)

    objects = OfferCampaignQuerySet.as_manager()

    class Meta:
        db_table = 'training_offercampaign'
        ordering = ['priority', 'start_date', 'id']
        verbose_name = _('Offer Campaign')
        verbose_name_plural = _('Offer Campaigns')
        indexes = [
            models.Index(fields=['is_active', 'start_date', 'end_date'], name='tr_ocamp_active_idx'),
        ]

    def __str__(self):
        return self.title_en or self.slug

    @property
    def is_active_now(self):
        """True when manually active and the schedule window includes now."""
        if not self.is_active:
            return False
        now = timezone.now()
        if self.start_date and self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        return True

    @property
    def status(self):
        """Lifecycle status for CMS list badges."""
        now = timezone.now()
        if not self.is_active:
            return 'inactive'
        if self.start_date and self.start_date > now:
            return 'scheduled'
        if self.end_date and self.end_date < now:
            return 'expired'
        return 'active'

    def clean(self):
        super().clean()
        errors = {}
        if self.start_date and self.end_date and self.end_date < self.start_date:
            errors['end_date'] = ValidationError('End date must be after the start date.')
        if errors:
            raise ValidationError(errors)


class OfferItem(TimeStampedModel):
    """Per-course configuration within an offer campaign.

    Junction table between OfferCampaign and Program carrying per-course
    overrides: badge, promotional copy, CTA, display order, promo price, and
    price visibility. Empty override fields fall back to campaign defaults
    (badge/copy) or program defaults (CTA).
    """

    campaign = models.ForeignKey(
        OfferCampaign, on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Campaign'),
    )
    program = models.ForeignKey(
        Program, on_delete=models.CASCADE,
        related_name='offer_items',
        verbose_name=_('Program'),
    )

    # Per-course overrides (fall back to campaign/program values when empty)
    badge_en = models.CharField(
        _('Badge (English)'), max_length=80, blank=True,
        help_text=_('Overrides the campaign default badge for this course.'),
    )
    badge_ar = models.CharField(_('Badge (Arabic)'), max_length=80, blank=True)
    promotional_copy_en = models.TextField(
        _('Promotional Copy (English)'), blank=True,
        help_text=_('Overrides the campaign description for this course.'),
    )
    promotional_copy_ar = models.TextField(_('Promotional Copy (Arabic)'), blank=True)
    cta_label_en = models.CharField(
        _('CTA Label (English)'), max_length=120, blank=True,
        help_text=_('Overrides the program default CTA label.'),
    )
    cta_label_ar = models.CharField(_('CTA Label (Arabic)'), max_length=120, blank=True)
    cta_url = models.CharField(
        _('CTA URL Override'), max_length=255, blank=True,
        help_text=_('Defaults to the course landing page. Must be an internal path or https:// URL.'),
        validators=[validate_offer_cta_url],
    )

    display_order = models.PositiveIntegerField(_('Display Order'), default=0, db_index=True)

    # Optional promotional pricing - never required (offers can be copy-only)
    promo_price = models.DecimalField(
        _('Promotional Price'), max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)],
        help_text=_('Optional. Offers can be promotional without a numeric price.'),
    )
    promo_currency = models.CharField(
        _('Promotional Currency'), max_length=8, default='EGP',
    )
    show_promo_price_publicly = models.BooleanField(
        _('Show Promo Price Publicly'), default=False,
        help_text=_(
            'When False, the numeric promo price is never serialized by public APIs. '
            'Keep False for Professional courses (price shown on inquiry only).'
        ),
    )

    is_active = models.BooleanField(
        _('Active'), default=True, db_index=True,
        help_text=_('Allows disabling a single course without ending the campaign.'),
    )

    class Meta:
        db_table = 'training_offeritem'
        ordering = ['display_order', 'id']
        verbose_name = _('Offer Item')
        verbose_name_plural = _('Offer Items')
        constraints = [
            models.UniqueConstraint(
                fields=['campaign', 'program'],
                name='tr_offer_unique_campaign_program',
            ),
        ]
        indexes = [
            models.Index(fields=['campaign', 'is_active', 'display_order'], name='tr_oitem_active_idx'),
        ]

    def __str__(self):
        return f'{self.campaign.slug} - {self.program.title_en}'

    @property
    def effective_badge(self):
        return {'en': self.badge_en or self.campaign.badge_en, 'ar': self.badge_ar or self.campaign.badge_ar}

    @property
    def effective_promotional_copy(self):
        return {
            'en': self.promotional_copy_en or self.campaign.description_en,
            'ar': self.promotional_copy_ar or self.campaign.description_ar,
        }

    def clean(self):
        super().clean()
        errors = {}
        if self.promo_price is not None and self.promo_price < 0:
            errors['promo_price'] = ValidationError('Promotional price cannot be negative.')
        if self.cta_url:
            try:
                validate_offer_cta_url(self.cta_url)
            except ValidationError as exc:
                errors['cta_url'] = exc
        if errors:
            raise ValidationError(errors)


class StarterCampaignConfig(TimeStampedModel):
    """Singleton configuration for the shared Starter campaign registration form.

    The Starter registration page (/training/starter/register) is a single
    shared form containing a course dropdown for all active Starter programs.
    This model holds the campaign-level form presentation configuration that
    applies to the shared form regardless of which course is selected.

    Per-course controls (registration_open, registration_deadline,
    maximum_capacity, course visibility/order) remain on the Program model.
    Per-course landing form configuration (ProgramLanding) remains in use for
    professional/secondary course detail pages and is intentionally separate
    from this shared Starter campaign config.
    """

    # Visibility
    show_registration_form = models.BooleanField(
        _('Show Registration Form'), default=True,
        help_text=_('When disabled, the Starter registration form is hidden on the public campaign page.'),
    )

    # Form content — English
    form_title_en = models.CharField(
        _('Form Title (English)'), max_length=255,
        default='Register for a Starter Course',
    )
    form_description_en = models.TextField(
        _('Form Description (English)'), blank=True,
        default='Choose your course and fill in your details. We will contact you to complete registration.',
    )
    form_button_en = models.CharField(
        _('Submit Button (English)'), max_length=120,
        default='Register Now',
    )
    success_message_en = models.TextField(
        _('Success Message (English)'), blank=True,
        default='Thank you for registering! The Sidrah team will contact you to complete the registration process.',
    )
    success_note_en = models.TextField(
        _('Success Note (English)'), blank=True,
        default='This is a registration receipt confirmation — not an acceptance, payment, or seat confirmation.',
    )
    closed_message_en = models.TextField(
        _('Closed Message (English)'), blank=True,
        default='Registration for this course is currently closed.',
    )

    # Form content — Arabic
    form_title_ar = models.CharField(
        _('Form Title (Arabic)'), max_length=255,
        default='سجّل في كورس Starter',
    )
    form_description_ar = models.TextField(
        _('Form Description (Arabic)'), blank=True,
        default='اختر كورسك واملأ البيانات. سنتواصل معك لإكمال التسجيل.',
    )
    form_button_ar = models.CharField(
        _('Submit Button (Arabic)'), max_length=120,
        default='سجّل الآن',
    )
    success_message_ar = models.TextField(
        _('Success Message (Arabic)'), blank=True,
        default='شكراً لتسجيلك! سيتواصل معك فريق Sidrah لإكمال عملية التسجيل.',
    )
    success_note_ar = models.TextField(
        _('Success Note (Arabic)'), blank=True,
        default='هذا تأكيد استلام التسجيل — وليس تأكيد قبول أو دفع أو مقعد مؤكد.',
    )
    closed_message_ar = models.TextField(
        _('Closed Message (Arabic)'), blank=True,
        default='التسجيل في هذه الدورة مغلق حاليًا.',
    )

    is_active = models.BooleanField(
        _('Active'), default=True, db_index=True,
        help_text=_('Only one active config record is used. Activating this record deactivates others.'),
    )

    class Meta:
        db_table = 'training_startercampaignconfig'
        verbose_name = _('Starter Campaign Configuration')
        verbose_name_plural = _('Starter Campaign Configurations')

    def __str__(self):
        return 'Starter Campaign Configuration'

    def save(self, *args, **kwargs):
        """Enforce singleton: only one active record at a time."""
        if self.is_active:
            StarterCampaignConfig.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_current(cls):
        """Return the active Starter campaign config, or create one with defaults."""
        config = cls.objects.filter(is_active=True).first()
        if not config:
            config = cls.objects.first()
        if not config:
            config = cls.objects.create(is_active=True)
        return config


class StarterLandingPage(TimeStampedModel):
    """Page Builder model for the public Starter campaign landing page.

    Hybrid architecture: structured section lists stored as validated JSON.
    ``draft_sections`` is what CMS editors modify; ``published_sections`` is
    the only payload the public API exposes. Publishing validates the draft,
    copies it atomically, stamps publish metadata and creates a
    ``StarterLandingRevision`` snapshot for future rollback.

    Registration-form copy intentionally lives on ``StarterCampaignConfig``
    (single source of truth) — the ``registration_form`` section type only
    controls placement/visibility and never duplicates those values.
    """

    SLUG = 'starter-register'

    slug = models.SlugField(max_length=64, unique=True, default=SLUG)
    draft_sections = models.JSONField(default=list, blank=True)
    published_sections = models.JSONField(default=list, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='starter_landing_publications',
    )

    class Meta:
        verbose_name = _('Starter Landing Page')
        verbose_name_plural = _('Starter Landing Pages')

    def __str__(self):
        return f'Starter Landing Page ({self.slug})'

    @classmethod
    def get_current(cls):
        """Return the singleton page row, creating it with compiled defaults."""
        from .landing_sections import default_sections
        page = cls.objects.filter(slug=cls.SLUG).first()
        if not page:
            page = cls.objects.create(
                slug=cls.SLUG,
                draft_sections=default_sections(),
                published_sections=default_sections(),
                published_at=timezone.now(),
            )
        return page

    def publish(self, user=None):
        """Atomically publish the draft. Caller must validate first."""
        self.published_sections = self.draft_sections
        self.published_at = timezone.now()
        self.published_by = user
        self.save(update_fields=['published_sections', 'published_at', 'published_by', 'updated_at'])
        StarterLandingRevision.objects.create(
            page=self,
            sections=self.published_sections,
            published_at=self.published_at,
            published_by=user,
        )

    @property
    def has_unpublished_changes(self):
        return self.draft_sections != self.published_sections


class StarterLandingRevision(models.Model):
    """Append-only snapshot of each published sections payload.

    Kept for future rollback / version-history support. No public API
    exposes revision contents.
    """

    page = models.ForeignKey(
        StarterLandingPage, on_delete=models.CASCADE, related_name='revisions',
    )
    sections = models.JSONField(default=list)
    published_at = models.DateTimeField()
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='starter_landing_revisions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Starter Landing Revision')
        verbose_name_plural = _('Starter Landing Revisions')

    def __str__(self):
        return f'{self.page.slug} @ {self.published_at}'

