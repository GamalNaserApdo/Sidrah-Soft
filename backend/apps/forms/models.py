"""Dynamic Form Builder models.

Architecture:
- FormDefinition: the form itself (bilingual, active/inactive)
- FormField: ordered fields in a form (system or custom)
- FormFieldOption: options for select/radio/checkbox fields
- FormAssignment: links a form to a page target (allowlist-controlled)
- FormSubmission: a submitted form entry
- FormSubmissionValue: individual field values in a submission

System fields (is_system=True) are protected from unsafe CMS operations.
Custom fields (is_system=False) have full CMS lifecycle.

This Form Builder does NOT replace Training Registration or Contact forms.
It provides a generic system for NEW forms (surveys, event signups, etc.).
"""
import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


# ---------------------------------------------------------------------------
# Field type constants
# ---------------------------------------------------------------------------
FIELD_TEXT = 'text'
FIELD_EMAIL = 'email'
FIELD_PHONE = 'phone'
FIELD_NUMBER = 'number'
FIELD_TEXTAREA = 'textarea'
FIELD_SELECT = 'select'
FIELD_RADIO = 'radio'
FIELD_CHECKBOX = 'checkbox'
FIELD_DATE = 'date'
FIELD_URL = 'url'

FIELD_TYPE_CHOICES = [
    (FIELD_TEXT, 'Text'),
    (FIELD_EMAIL, 'Email'),
    (FIELD_PHONE, 'Phone'),
    (FIELD_NUMBER, 'Number'),
    (FIELD_TEXTAREA, 'Textarea'),
    (FIELD_SELECT, 'Select'),
    (FIELD_RADIO, 'Radio'),
    (FIELD_CHECKBOX, 'Checkbox'),
    (FIELD_DATE, 'Date'),
    (FIELD_URL, 'URL'),
]

FIELD_TYPES_WITH_OPTIONS = {FIELD_SELECT, FIELD_RADIO, FIELD_CHECKBOX}


# ---------------------------------------------------------------------------
# Form assignment target allowlist
# ---------------------------------------------------------------------------
# All targets that the backend can store. The CMS UI should only expose
# targets that are also in OPERATIONAL_TARGETS (i.e., have a real frontend
# consumer). Non-operational targets are kept for future integration but
# hidden from the CMS assignment UI to avoid misleading staff.
ASSIGNMENT_TARGET_CHOICES = [
    ('ai_automation', 'AI Automation Page'),
    ('contact', 'Contact Page'),
    ('landing_generic', 'Generic Landing Page'),
]

ASSIGNMENT_TARGET_VALUES = [k for k, _ in ASSIGNMENT_TARGET_CHOICES]

# Targets that have a real public frontend consumer and are safe to expose
# in the CMS assignment UI. A target is operational only if BOTH:
#   A. FormAssignment can store it (it's in ASSIGNMENT_TARGET_CHOICES)
#   B. An actual public frontend page consumes the assignment and renders
#      the form via DynamicFormRenderer
# `contact` is NOT operational because the public Contact form uses a
# specialized Lead workflow that must not be replaced by a generic form.
# `landing_generic` is NOT operational because no public route consumes it.
OPERATIONAL_TARGETS = ['ai_automation']

# Human-readable labels for the CMS UI (bilingual)
ASSIGNMENT_TARGET_LABELS = {
    'ai_automation': {'en': 'AI Automation Page', 'ar': 'صفحة أتمتة الذكاء الاصطناعي'},
    'contact': {'en': 'Contact Page (reserved)', 'ar': 'صفحة التواصل (محجوزة)'},
    'landing_generic': {'en': 'Generic Landing Page (reserved)', 'ar': 'صفحة هبوط عامة (محجوزة)'},
}


# ---------------------------------------------------------------------------
# System field keys (protected from unsafe CMS operations)
# ---------------------------------------------------------------------------
SYSTEM_FIELD_KEYS = {'email', 'phone', 'name', 'consent'}


class FormDefinition(models.Model):
    """A dynamic form definition managed through the CMS."""

    name = models.CharField(max_length=120, help_text=_('Internal name for CMS reference'))
    title_en = models.CharField(max_length=200, help_text=_('Public English title'))
    title_ar = models.CharField(max_length=200, blank=True, help_text=_('Public Arabic title'))
    description_en = models.TextField(blank=True, help_text=_('English description shown above fields'))
    description_ar = models.TextField(blank=True, help_text=_('Arabic description shown above fields'))
    slug = models.SlugField(max_length=120, unique=True, db_index=True, help_text=_('URL-safe identifier'))
    is_active = models.BooleanField(default=False, db_index=True, help_text=_('Inactive forms are not publicly accessible'))
    submit_button_en = models.CharField(max_length=60, default='Submit')
    submit_button_ar = models.CharField(max_length=60, blank=True)
    success_message_en = models.TextField(default='Thank you for your submission.')
    success_message_ar = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forms_formdefinition'
        ordering = ['name']
        verbose_name = _('Form Definition')
        verbose_name_plural = _('Form Definitions')

    def __str__(self):
        return self.name

    @property
    def has_submissions(self):
        return self.submissions.exists()


class FormField(models.Model):
    """A field in a form definition.

    System fields (is_system=True) are protected: CMS can edit labels,
    placeholders, help text, and required flag, but NOT type, key, or delete.
    Custom fields (is_system=False) have full CMS lifecycle.
    """

    form = models.ForeignKey(FormDefinition, on_delete=models.CASCADE, related_name='fields')
    field_key = models.CharField(max_length=60, null=True, blank=True, db_index=True, help_text=_('Stable internal key for system fields'))
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default=FIELD_TEXT)
    label_en = models.CharField(max_length=200)
    label_ar = models.CharField(max_length=200, blank=True)
    placeholder_en = models.CharField(max_length=200, blank=True)
    placeholder_ar = models.CharField(max_length=200, blank=True)
    help_text_en = models.CharField(max_length=300, blank=True)
    help_text_ar = models.CharField(max_length=300, blank=True)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    is_system = models.BooleanField(default=False, db_index=True, help_text=_('System fields are protected from unsafe CMS operations'))
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forms_formfield'
        ordering = ['display_order', 'id']
        verbose_name = _('Form Field')
        verbose_name_plural = _('Form Fields')
        unique_together = [('form', 'field_key')]
        indexes = [
            models.Index(fields=['form', 'display_order']),
            models.Index(fields=['form', 'is_active']),
        ]

    def __str__(self):
        return f'{self.form.name} → {self.label_en} ({self.field_type})'

    @property
    def has_options(self):
        return self.field_type in FIELD_TYPES_WITH_OPTIONS


class FormFieldOption(models.Model):
    """An option for select/radio/checkbox fields.

    The `value` field is the stable internal identifier used in submissions.
    Labels are bilingual for display only.
    """

    field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='options')
    value = models.CharField(max_length=100, help_text=_('Stable internal value stored in submissions'))
    label_en = models.CharField(max_length=200)
    label_ar = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forms_formfieldoption'
        ordering = ['display_order', 'id']
        verbose_name = _('Form Field Option')
        verbose_name_plural = _('Form Field Options')
        unique_together = [('field', 'value')]
        indexes = [
            models.Index(fields=['field', 'display_order']),
            models.Index(fields=['field', 'is_active']),
        ]

    def __str__(self):
        return f'{self.field.label_en} → {self.value}'


class FormAssignment(models.Model):
    """Links a form to a page target.

    The target is controlled by an allowlist — CMS cannot assign forms
    to arbitrary pages. Only one active assignment per target is allowed
    (enforced by a partial unique constraint).
    """

    form = models.ForeignKey(FormDefinition, on_delete=models.CASCADE, related_name='assignments')
    target = models.CharField(max_length=60, choices=ASSIGNMENT_TARGET_CHOICES, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forms_formassignment'
        ordering = ['target']
        verbose_name = _('Form Assignment')
        verbose_name_plural = _('Form Assignments')
        indexes = [
            models.Index(fields=['target', 'is_active']),
        ]
        # Enforce one active assignment per target. Using a condition so
        # multiple inactive assignments can coexist without conflict.
        constraints = [
            models.UniqueConstraint(
                fields=['target'],
                condition=models.Q(is_active=True),
                name='unique_active_assignment_per_target',
            ),
        ]

    def __str__(self):
        return f'{self.form.name} → {self.target}'


class FormSubmission(models.Model):
    """A submitted form entry.

    Stores metadata (IP, user agent, language, source page) and links
    to individual FormSubmissionValue records for each field.
    """

    form = models.ForeignKey(FormDefinition, on_delete=models.CASCADE, related_name='submissions')
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True, editable=False)
    language = models.CharField(max_length=10, default='en')
    source_page = models.CharField(max_length=512, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    status = models.CharField(max_length=16, default='new', db_index=True, choices=[
        ('new', 'New'),
        ('reviewed', 'Reviewed'),
        ('archived', 'Archived'),
    ])
    internal_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'forms_formsubmission'
        ordering = ['-submitted_at']
        verbose_name = _('Form Submission')
        verbose_name_plural = _('Form Submissions')
        indexes = [
            models.Index(fields=['form', 'status']),
            models.Index(fields=['form', 'submitted_at']),
        ]

    def __str__(self):
        return f'{self.form.name} submission {self.public_id}'


class FormSubmissionValue(models.Model):
    """An individual field value in a submission.

    The `field_key` and `field_label` are snapshotted at submission time
    to preserve historical readability even if fields are later modified.
    The `value` field stores the submitted value (or the option `value`
    for select/radio/checkbox fields).
    """

    submission = models.ForeignKey(FormSubmission, on_delete=models.CASCADE, related_name='values')
    field_key = models.CharField(max_length=60, blank=True, db_index=True)
    field_label = models.CharField(max_length=200, blank=True)
    field_type = models.CharField(max_length=20, default=FIELD_TEXT)
    value = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'forms_formsubmissionvalue'
        ordering = ['id']
        verbose_name = _('Form Submission Value')
        verbose_name_plural = _('Form Submission Values')
        indexes = [
            models.Index(fields=['submission', 'field_key']),
        ]

    def __str__(self):
        return f'{self.submission.public_id} → {self.field_label}'
