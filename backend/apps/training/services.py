"""Training registration confirmation email service.

Sends a professional bilingual confirmation email to the applicant after a
successful NEW registration. Email failure never rolls back the registration.

Architecture:
- Uses Django's EmailMultiAlternatives (HTML + plain text).
- SendGrid is the SMTP transport (configured via environment variables).
- CMS-managed content via SiteSetting fields.
- Safe placeholder substitution (whitelisted: applicant_name, program_name).
- Delivery state persisted on TrainingRegistration.
- Activity log integration.
- Masked email + bounded error summary in logs (no secrets, no full PII).

Integration point:
- Called from WebsiteRegistrationView via transaction.on_commit() so the
  registration is durably saved before the email is attempted.
"""
import logging
import re
from email.utils import formataddr
from smtplib import SMTPException

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

from apps.activity_logs.services import log_activity
from apps.site_settings.models import SiteSetting

from .models import TrainingRegistration


logger = logging.getLogger(__name__)

# Mask the local part of an email address for safe logging.
_MASK_RE = re.compile(r'(?<=.).(?=[^@]*@)')


def _mask_email(email: str) -> str:
    """Redact the local part of an email address for safe logging."""
    if not email or '@' not in email:
        return email or ''
    return _MASK_RE.sub('*', email)


def _sanitize_error(error: Exception) -> str:
    """Return a bounded, sanitized summary of an email error (no secrets)."""
    message = str(error)
    if len(message) > 500:
        message = message[:500] + '...'
    return message


# Whitelisted safe placeholders that CMS content may reference.
# These are the ONLY values substituted into CMS-authored content.
SAFE_PLACEHOLDERS = ('applicant_name', 'program_name')


def _substitute_placeholders(text: str, context: dict) -> str:
    """Substitute only whitelisted placeholders into CMS-authored text.

    Uses a simple {{name}} syntax. Unknown placeholders are left intact
    (not evaluated as Django template code) to prevent arbitrary execution.
    """
    if not text:
        return text
    for key in SAFE_PLACEHOLDERS:
        token = '{{' + key + '}}'
        text = text.replace(token, str(context.get(key, '')))
    return text


def _resolve_language(registration: TrainingRegistration) -> str:
    """Return the language to use for the email ('ar' or 'en')."""
    lang = (registration.preferred_language or '').strip().lower()
    return 'ar' if lang == 'ar' else 'en'


def _resolve_sender(site_setting) -> str:
    """Build the From header. The email address is infrastructure-controlled;
    only the display name is CMS-managed.

    The authenticated sender address (noreply@sidrahsoft.com) comes from
    settings.DEFAULT_FROM_EMAIL and must NOT be CMS-editable.
    """
    display_name = (site_setting.training_confirmation_sender_name or '').strip() or 'Sidrah Soft'
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or 'Sidrah Soft <noreply@sidrahsoft.com>'
    # If DEFAULT_FROM_EMAIL already includes a display name, use it as-is
    # (it is the infrastructure-controlled authenticated sender).
    if '<' in from_email and '>' in from_email:
        # Replace the infrastructure display name with the CMS display name.
        addr = from_email[from_email.find('<') + 1: from_email.find('>')]
        return formataddr((display_name, addr))
    return formataddr((display_name, from_email))


def _resolve_reply_to(site_setting):
    """Return the Reply-To list from CMS-managed field, validated as email."""
    reply_to = (site_setting.training_confirmation_reply_to or '').strip()
    if reply_to and '@' in reply_to:
        return [reply_to]
    return None


def _build_context(registration: TrainingRegistration, site_setting, language: str) -> dict:
    """Build the safe template context (no PII beyond what the email needs)."""
    program = registration.program
    program_name = program.title_ar if (language == 'ar' and program.title_ar) else program.title_en
    site_name = site_setting.site_name or 'Sidrah Soft'
    support_email = site_setting.training_confirmation_reply_to or getattr(
        settings, 'CONTACT_NOTIFICATION_EMAIL', 'sidrahsoft@gmail.com'
    )
    site_url = getattr(settings, 'PUBLIC_SITE_URL', 'https://sidrahsoft.com').rstrip('/')
    return {
        'applicant_name': registration.full_name or '',
        'program_name': program_name or '',
        'program_slug': program.slug if program else '',
        'site_name': site_name,
        'support_email': support_email,
        'site_url': site_url,
        'language': language,
    }


def _render_cms_content(site_setting, language: str, context: dict):
    """Return (subject, heading, body_message, cta_label, cta_url, footer)
    from CMS-managed fields with safe placeholder substitution applied.
    """
    if language == 'ar':
        subject = site_setting.training_confirmation_subject_ar or ''
        heading = site_setting.training_confirmation_heading_ar or ''
        message = site_setting.training_confirmation_message_ar or ''
        cta_label = site_setting.training_confirmation_cta_label_ar or ''
        footer = site_setting.training_confirmation_footer_ar or ''
    else:
        subject = site_setting.training_confirmation_subject_en or ''
        heading = site_setting.training_confirmation_heading_en or ''
        message = site_setting.training_confirmation_message_en or ''
        cta_label = site_setting.training_confirmation_cta_label_en or ''
        footer = site_setting.training_confirmation_footer_en or ''
    cta_url = site_setting.training_confirmation_cta_url or ''

    subject = _substitute_placeholders(subject, context)
    heading = _substitute_placeholders(heading, context)
    message = _substitute_placeholders(message, context)
    footer = _substitute_placeholders(footer, context)
    return subject, heading, message, cta_label, cta_url, footer


# Default content used when CMS fields are blank — produces a professional
# confirmation without requiring immediate CMS editing.
DEFAULTS = {
    'en': {
        'subject': 'Your Sidrah Soft training registration — {{program_name}}',
        'heading': 'Registration Received',
        'message': (
            'Dear {{applicant_name}},\n\n'
            'Thank you for registering for {{program_name}}. '
            'We have received your registration and our team will review it shortly.\n\n'
            'You will be contacted at this email address with next steps. '
            'If you have any questions, simply reply to this email.'
        ),
        'cta_label': 'View Program',
        'footer': (
            'Sidrah Soft\n'
            'This is an automated confirmation. Please do not consider this '
            'an admission or payment confirmation.'
        ),
    },
    'ar': {
        'subject': 'تأكيد تسجيلك في تدريب Sidrah Soft — {{program_name}}',
        'heading': 'تم استلام تسجيلك',
        'message': (
            'عزيزي {{applicant_name}}،\n\n'
            'شكراً لتسجيلك في {{program_name}}. '
            'لقد استلمنا طلبك وسيراجعه فريقنا قريباً.\n\n'
            'سيتم التواصل معك على هذا البريد الإلكتروني بشأن الخطوات التالية. '
            'إذا كان لديك أي استفسار، يمكنك الرد على هذه الرسالة مباشرة.'
        ),
        'cta_label': 'عرض البرنامج',
        'footer': (
            'Sidrah Soft\n'
            'هذه رسالة تأكيد آلية. لا تُعتبر تأكيد قبول أو دفع.'
        ),
    },
}


def _with_defaults(subject, heading, message, cta_label, cta_url, footer, language):
    """Fill in defaults for any blank CMS-managed field."""
    defaults = DEFAULTS.get(language, DEFAULTS['en'])
    return (
        subject or defaults['subject'],
        heading or defaults['heading'],
        message or defaults['message'],
        cta_label or defaults['cta_label'],
        cta_url or '',
        footer or defaults['footer'],
    )


def send_registration_confirmation(registration: TrainingRegistration, request=None) -> bool:
    """Send a confirmation email to the applicant.

    Returns True on success, False on failure. Never raises.
    The registration is already persisted before this function is called.
    Email failure is recorded on the registration but never rolls it back.
    """
    if not registration.email:
        registration.confirmation_email_status = TrainingRegistration.CONFIRMATION_NOT_ATTEMPTED
        registration.confirmation_email_error_summary = ''
        registration.save(update_fields=[
            'confirmation_email_status',
            'confirmation_email_error_summary',
        ])
        return False

    # Mark attempt time.
    registration.confirmation_email_attempted_at = timezone.now()

    try:
        site_setting = SiteSetting.get_current()
    except Exception:  # noqa: BLE001
        site_setting = None

    # If CMS explicitly disabled confirmation emails, mark not attempted and stop.
    if site_setting and not site_setting.training_confirmation_email_enabled:
        registration.confirmation_email_status = TrainingRegistration.CONFIRMATION_NOT_ATTEMPTED
        registration.save(update_fields=[
            'confirmation_email_status',
            'confirmation_email_attempted_at',
        ])
        logger.info(
            'Confirmation email disabled by CMS for registration %s.',
            registration.pk,
        )
        return False

    language = _resolve_language(registration)
    context = _build_context(registration, site_setting, language) if site_setting else _build_context(registration, None, language)

    subject, heading, message, cta_label, cta_url, footer = _render_cms_content(
        site_setting, language, context
    ) if site_setting else ('', '', '', '', '', '')

    subject, heading, message, cta_label, cta_url, footer = _with_defaults(
        subject, heading, message, cta_label, cta_url, footer, language
    )

    # Re-apply placeholder substitution on defaults (which contain placeholders).
    subject = _substitute_placeholders(subject, context)
    heading = _substitute_placeholders(heading, context)
    message = _substitute_placeholders(message, context)
    footer = _substitute_placeholders(footer, context)

    sender = _resolve_sender(site_setting) if site_setting else getattr(
        settings, 'DEFAULT_FROM_EMAIL', 'Sidrah Soft <noreply@sidrahsoft.com>'
    )
    reply_to = _resolve_reply_to(site_setting) if site_setting else None

    template_ctx = {
        'heading': heading,
        'message': message,
        'cta_label': cta_label,
        'cta_url': cta_url,
        'footer': footer,
        'site_name': context.get('site_name', 'Sidrah Soft'),
        'site_url': context.get('site_url', ''),
        'support_email': context.get('support_email', ''),
        'program_name': context.get('program_name', ''),
        'applicant_name': context.get('applicant_name', ''),
        'language': language,
    }

    text_template = f'training/registration_confirmation_{"ar" if language == "ar" else "en"}.txt'
    html_template = f'training/registration_confirmation_{"ar" if language == "ar" else "en"}.html'

    try:
        text_body = render_to_string(text_template, template_ctx)
        html_body = render_to_string(html_template, template_ctx)
    except Exception as exc:  # noqa: BLE001
        error_summary = _sanitize_error(exc)
        logger.exception('Template render failed for registration %s', registration.pk)
        registration.confirmation_email_status = TrainingRegistration.CONFIRMATION_FAILED
        registration.confirmation_email_error_summary = error_summary
        registration.save(update_fields=[
            'confirmation_email_status',
            'confirmation_email_attempted_at',
            'confirmation_email_error_summary',
        ])
        _log_email_activity(registration, request, False, error_summary)
        return False

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=sender,
            to=[registration.email],
            reply_to=reply_to,
        )
        email.attach_alternative(html_body, 'text/html')
        email.send(fail_silently=False)

        registration.confirmation_email_status = TrainingRegistration.CONFIRMATION_SENT
        registration.confirmation_email_sent_at = timezone.now()
        registration.confirmation_email_error_summary = ''
        registration.save(update_fields=[
            'confirmation_email_status',
            'confirmation_email_attempted_at',
            'confirmation_email_sent_at',
            'confirmation_email_error_summary',
        ])
        _log_email_activity(registration, request, True, '')
        logger.info(
            'Confirmation email sent for registration %s to %s',
            registration.pk, _mask_email(registration.email),
        )
        return True
    except SMTPException as exc:
        error_summary = _sanitize_error(exc)
        logger.warning(
            'SMTP failure for registration %s to %s: %s',
            registration.pk, _mask_email(registration.email), error_summary,
        )
    except Exception as exc:  # noqa: BLE001
        error_summary = _sanitize_error(exc)
        logger.exception(
            'Unexpected email failure for registration %s to %s',
            registration.pk, _mask_email(registration.email),
        )

    registration.confirmation_email_status = TrainingRegistration.CONFIRMATION_FAILED
    registration.confirmation_email_error_summary = error_summary
    registration.save(update_fields=[
        'confirmation_email_status',
        'confirmation_email_attempted_at',
        'confirmation_email_error_summary',
    ])
    _log_email_activity(registration, request, False, error_summary)
    return False


def _log_email_activity(registration, request, success: bool, failure_reason: str = '') -> None:
    """Create a sanitized activity log entry for a confirmation email event."""
    metadata = {
        'registration_id': registration.id,
        'program_id': registration.program_id,
        'recipient': _mask_email(registration.email),
        'success': success,
        'email_type': 'training_confirmation',
    }
    log_activity(
        user=None,
        action='training_email_sent' if success else 'training_email_failed',
        module='training_registrations',
        request=request,
        object_instance=registration,
        object_repr=f'Training registration {registration.pk}',
        description='Training confirmation email sent.' if success else 'Training confirmation email failed.',
        metadata=metadata,
        is_success=success,
        failure_reason=failure_reason,
    )
