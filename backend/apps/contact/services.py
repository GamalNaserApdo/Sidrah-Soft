"""Email delivery service for contact submissions."""
import logging
from smtplib import SMTPException

from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils import timezone

from apps.activity_logs.services import log_activity
from apps.site_settings.models import SiteSetting

from .models import ContactSubmission


logger = logging.getLogger(__name__)

DEFAULT_FALLBACK_EMAIL = 'sidrahsoft@gmail.com'


def _mask_email(email: str) -> str:
    """Redact the local part of an email address for safe logging."""
    if not email or '@' not in email:
        return email
    local, domain = email.rsplit('@', 1)
    return f'{local[:1]}***@{domain}'


def resolve_recipient_email(submission: ContactSubmission) -> str:
    """Return the recipient email address for a submission.

    Resolution order:
      1. Configured CONTACT_NOTIFICATION_EMAIL.
      2. Active inquiry type's recipient_email override.
      3. Current Site Setting's recipient_email.
      4. Project-safe fallback address.
    """
    configured = getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', '')
    if configured:
        return configured

    if submission.inquiry_type and submission.inquiry_type.recipient_email:
        return submission.inquiry_type.recipient_email

    site_setting = SiteSetting.get_current()
    if site_setting and site_setting.recipient_email:
        return site_setting.recipient_email

    return DEFAULT_FALLBACK_EMAIL


def _lead_dashboard_url(submission: ContactSubmission) -> str:
    """Return a direct link to the lead detail page, if configured."""
    base = getattr(settings, 'LEADS_DASHBOARD_BASE_URL', '')
    if not base:
        return ''
    return f"{base.rstrip('/')}/leads/{submission.id}"


def _inquiry_name(submission: ContactSubmission) -> str:
    if submission.inquiry_type:
        return submission.inquiry_type.name_en
    return '-'


def _service_name(submission: ContactSubmission) -> str:
    if submission.related_service:
        return submission.related_service.name_en
    return '-'


def _render_notification_email(submission: ContactSubmission):
    """Render plain-text internal notification email content."""
    inquiry_name = _inquiry_name(submission)
    context = {
        'submission': submission,
        'inquiry_name': inquiry_name,
        'service_name': _service_name(submission),
        'site_name': 'SidrahSoft',
        'lead_url': _lead_dashboard_url(submission),
    }
    subject = f"New SidrahSoft Lead — {inquiry_name} — {submission.full_name}"
    body = render_to_string('contact/notification_email.txt', context)
    return subject, body


def _render_confirmation_email(submission: ContactSubmission):
    """Render plain-text visitor confirmation email content."""
    language = submission.language or 'en'
    inquiry_name = _inquiry_name(submission)
    template = (
        'contact/confirmation_email_ar.txt'
        if language == 'ar'
        else 'contact/confirmation_email.txt'
    )
    context = {
        'submission': submission,
        'inquiry_name': inquiry_name,
        'site_name': 'SidrahSoft',
        'support_email': getattr(
            settings, 'CONTACT_NOTIFICATION_EMAIL', DEFAULT_FALLBACK_EMAIL,
        ),
    }
    if language == 'ar':
        subject = f"شكراً لتواصلك مع SidrahSoft — {inquiry_name}"
    else:
        subject = f"Thank you for contacting SidrahSoft — {inquiry_name}"
    body = render_to_string(template, context)
    return subject, body


def _sanitize_error(error: Exception) -> str:
    """Return a bounded, sanitized summary of an email error."""
    message = str(error)
    if len(message) > 500:
        message = message[:500] + '...'
    return message


def _is_email_configured() -> bool:
    """Return True if an email backend is configured."""
    email_backend = getattr(settings, 'EMAIL_BACKEND', '')
    return email_backend != 'django.core.mail.backends.dummy.EmailBackend' and bool(email_backend)


def _send_email(
    submission: ContactSubmission,
    subject: str,
    body: str,
    recipient: str,
    sender: str,
    reply_to=None,
):
    """Send a single email and return (success: bool, error_summary: str)."""
    try:
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=sender,
            to=[recipient],
            reply_to=reply_to,
        )
        email.send(fail_silently=False)
        return True, ''
    except SMTPException as exc:
        error_summary = _sanitize_error(exc)
        logger.warning(
            'SMTP failure for submission %s to %s: %s',
            submission.public_id, recipient, error_summary,
        )
        return False, error_summary
    except Exception as exc:  # noqa: BLE001
        error_summary = _sanitize_error(exc)
        logger.exception(
            'Unexpected email failure for submission %s to %s',
            submission.public_id, recipient,
        )
        return False, error_summary


def _log_email_activity(
    action: str,
    submission: ContactSubmission,
    request,
    success: bool,
    recipient: str,
    failure_reason: str = '',
):
    """Create a sanitized activity log entry for an email event."""
    metadata = {
        'lead_id': submission.id,
        'public_id': str(submission.public_id),
        'recipient': _mask_email(recipient),
        'success': success,
        'email_type': action,
    }
    log_activity(
        user=None,
        action=action,
        module='leads',
        request=request,
        object_instance=submission,
        object_repr=f'Lead {submission.public_id}',
        description='Internal lead notification sent.' if success else 'Internal lead notification failed.',
        metadata=metadata,
        is_success=success,
        failure_reason=failure_reason,
    )


def send_submission_notification(submission: ContactSubmission, request=None) -> None:
    """Send the internal notification and visitor confirmation emails.

    The submission record is already persisted before this function is called.
    Any failure here updates the audit fields but never rolls back the record.
    """
    recipient = resolve_recipient_email(submission)
    submission.recipient_email_used = recipient
    submission.email_attempted_at = timezone.now()

    sender = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or DEFAULT_FALLBACK_EMAIL
    if not sender:
        sender = DEFAULT_FALLBACK_EMAIL

    # If no real email backend is configured, mark not_configured and stop.
    if not _is_email_configured():
        submission.email_delivery_status = ContactSubmission.DELIVERY_NOT_CONFIGURED
        submission.save(update_fields=[
            'recipient_email_used',
            'email_attempted_at',
            'email_delivery_status',
        ])
        logger.info(
            'Email backend not configured for submission %s; marked not_configured.',
            submission.public_id,
        )
        return

    # Internal notification to SidrahSoft.
    subject, body = _render_notification_email(submission)
    internal_success, internal_error = _send_email(
        submission, subject, body, recipient, sender,
        reply_to=[submission.email] if submission.email else None,
    )
    _log_email_activity(
        'email_notification_sent' if internal_success else 'email_notification_failed',
        submission,
        request,
        internal_success,
        recipient,
        failure_reason=internal_error,
    )

    if internal_success:
        submission.email_delivery_status = ContactSubmission.DELIVERY_SENT
        submission.email_sent_at = timezone.now()
        submission.email_error_summary = ''
    else:
        submission.email_delivery_status = ContactSubmission.DELIVERY_FAILED
        submission.email_error_summary = internal_error

    submission.save(update_fields=[
        'recipient_email_used',
        'email_attempted_at',
        'email_delivery_status',
        'email_sent_at',
        'email_error_summary',
    ])

    # Visitor confirmation email — failures must not affect the stored lead.
    if submission.email:
        confirmation_subject, confirmation_body = _render_confirmation_email(submission)
        confirmation_success, confirmation_error = _send_email(
            submission, confirmation_subject, confirmation_body,
            submission.email, sender,
        )
        _log_email_activity(
            'visitor_confirmation_sent' if confirmation_success else 'visitor_confirmation_failed',
            submission,
            request,
            confirmation_success,
            submission.email,
            failure_reason=confirmation_error,
        )
