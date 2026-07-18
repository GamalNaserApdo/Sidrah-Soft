"""Django Admin configuration for the Contact Management CMS app."""
import csv
from datetime import datetime

from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

from .models import ContactSubmission, InquiryType


@admin.action(description=_('Activate selected inquiry types'))
def activate_inquiry_types(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description=_('Deactivate selected inquiry types'))
def deactivate_inquiry_types(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.register(InquiryType)
class InquiryTypeAdmin(admin.ModelAdmin):
    list_display = (
        'name_en',
        'name_ar',
        'slug',
        'recipient_email',
        'order',
        'is_active',
        'created_at',
    )
    list_filter = ('is_active',)
    search_fields = ('name_en', 'name_ar', 'slug')
    ordering = ('order', 'name_en')
    prepopulated_fields = {'slug': ('name_en',)}
    readonly_fields = ('created_at', 'updated_at')
    actions = [activate_inquiry_types, deactivate_inquiry_types]

    fieldsets = (
        (
            _('Identity'),
            {
                'fields': (
                    'name_en',
                    'name_ar',
                    'slug',
                ),
            },
        ),
        (
            _('Details'),
            {
                'fields': (
                    'description_en',
                    'description_ar',
                ),
            },
        ),
        (
            _('Configuration'),
            {
                'fields': (
                    'recipient_email',
                    'order',
                    'is_active',
                ),
            },
        ),
        (
            _('Timestamps'),
            {
                'classes': ('collapse',),
                'fields': ('created_at', 'updated_at'),
            },
        ),
    )


@admin.action(description=_('Mark selected submissions as contacted'))
def mark_contacted(modeladmin, request, queryset):
    queryset.update(status=ContactSubmission.STATUS_CONTACTED)


@admin.action(description=_('Mark selected submissions as in progress'))
def mark_in_progress(modeladmin, request, queryset):
    queryset.update(status=ContactSubmission.STATUS_IN_PROGRESS)


@admin.action(description=_('Mark selected submissions as closed'))
def mark_closed(modeladmin, request, queryset):
    queryset.update(status=ContactSubmission.STATUS_CLOSED)


@admin.action(description=_('Mark selected submissions as spam'))
def mark_spam(modeladmin, request, queryset):
    queryset.update(status=ContactSubmission.STATUS_SPAM)


@admin.action(description=_('Archive selected submissions'))
def archive_submissions(modeladmin, request, queryset):
    queryset.update(status=ContactSubmission.STATUS_ARCHIVED)


@admin.action(description=_('Restore selected submissions to new'))
def restore_to_new(modeladmin, request, queryset):
    queryset.update(status=ContactSubmission.STATUS_NEW)


@admin.action(description=_('Export selected records to CSV'))
def export_csv(modeladmin, request, queryset):
    """Export selected contact submissions to a UTF-8 CSV."""
    filename = f"contact_submissions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    # UTF-8 BOM for Excel compatibility with Arabic text.
    response.write('\ufeff')

    writer = csv.writer(response, quoting=csv.QUOTE_ALL)
    writer.writerow([
        'Public ID',
        'Created date',
        'Updated date',
        'Full name',
        'Email',
        'Phone',
        'Company',
        'Job title',
        'Inquiry type',
        'Related service',
        'Subject',
        'Message',
        'Preferred contact method',
        'Status',
        'Priority',
        'Assigned user',
        'Internal notes',
        'Language',
        'Source page',
        'Privacy consent',
        'Email delivery status',
        'Recipient email used',
        'Contacted date',
        'Closed date',
    ])

    def safe_cell(value):
        """Escape CSV cells to prevent formula injection."""
        if value is None:
            return ''
        text = str(value).replace('\r', ' ').replace('\n', ' ')
        if text and text[0] in ('=', '+', '-', '@'):
            text = f"'{text}"
        return text

    for submission in queryset.iterator():
        writer.writerow([
            safe_cell(submission.public_id),
            safe_cell(submission.created_at.isoformat() if submission.created_at else ''),
            safe_cell(submission.updated_at.isoformat() if submission.updated_at else ''),
            safe_cell(submission.full_name),
            safe_cell(submission.email),
            safe_cell(submission.phone),
            safe_cell(submission.company),
            safe_cell(submission.job_title),
            safe_cell(submission.inquiry_type.name_en if submission.inquiry_type else ''),
            safe_cell(submission.related_service.name_en if submission.related_service else ''),
            safe_cell(submission.subject),
            safe_cell(submission.message),
            safe_cell(submission.get_preferred_contact_method_display()),
            safe_cell(submission.get_status_display()),
            safe_cell(submission.get_priority_display()),
            safe_cell(
                submission.assigned_to.get_full_name()
                if submission.assigned_to
                else ''
            ),
            safe_cell(submission.internal_notes),
            safe_cell(submission.language),
            safe_cell(submission.source_page),
            safe_cell('Yes' if submission.privacy_consent else 'No'),
            safe_cell(submission.get_email_delivery_status_display()),
            safe_cell(submission.recipient_email_used),
            safe_cell(
                submission.contacted_at.isoformat() if submission.contacted_at else ''
            ),
            safe_cell(
                submission.closed_at.isoformat() if submission.closed_at else ''
            ),
        ])

    return response


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'public_id',
        'created_at',
        'full_name',
        'email',
        'phone',
        'inquiry_type',
        'related_service',
        'status',
        'priority',
        'assigned_to',
        'email_delivery_status',
    )
    list_filter = (
        'status',
        'priority',
        'inquiry_type',
        'related_service',
        'assigned_to',
        'email_delivery_status',
        'language',
        'privacy_consent',
        'created_at',
    )
    search_fields = (
        'public_id',
        'full_name',
        'email',
        'phone',
        'company',
        'subject',
        'message',
    )
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = (
        'public_id',
        'full_name',
        'email',
        'phone',
        'company',
        'job_title',
        'inquiry_type',
        'related_service',
        'subject',
        'message',
        'preferred_contact_method',
        'privacy_consent',
        'source_page',
        'language',
        'ip_address',
        'user_agent',
        'email_attempted_at',
        'email_sent_at',
        'email_error_summary',
        'recipient_email_used',
        'created_at',
        'updated_at',
        'contacted_at',
        'closed_at',
    )
    actions = [
        mark_contacted,
        mark_in_progress,
        mark_closed,
        mark_spam,
        archive_submissions,
        restore_to_new,
        export_csv,
    ]

    fieldsets = (
        (
            _('Submission'),
            {
                'fields': (
                    'public_id',
                    'full_name',
                    'email',
                    'phone',
                    'company',
                    'job_title',
                ),
            },
        ),
        (
            _('Inquiry'),
            {
                'fields': (
                    'inquiry_type',
                    'related_service',
                    'subject',
                    'message',
                    'preferred_contact_method',
                    'privacy_consent',
                ),
            },
        ),
        (
            _('Workflow'),
            {
                'fields': (
                    'status',
                    'priority',
                    'assigned_to',
                    'internal_notes',
                ),
            },
        ),
        (
            _('Source'),
            {
                'classes': ('collapse',),
                'fields': (
                    'source_page',
                    'language',
                    'ip_address',
                    'user_agent',
                ),
            },
        ),
        (
            _('Email audit'),
            {
                'classes': ('collapse',),
                'fields': (
                    'recipient_email_used',
                    'email_delivery_status',
                    'email_attempted_at',
                    'email_sent_at',
                    'email_error_summary',
                ),
            },
        ),
        (
            _('Timestamps'),
            {
                'classes': ('collapse',),
                'fields': (
                    'created_at',
                    'updated_at',
                    'contacted_at',
                    'closed_at',
                ),
            },
        ),
    )
