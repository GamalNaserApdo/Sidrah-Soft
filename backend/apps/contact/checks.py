"""Django system checks for the contact / leads configuration."""
from urllib.parse import urlparse

from django.conf import settings
from django.core.checks import Error, Tags, register


@register(Tags.security, deploy=True)
def check_leads_production_settings(app_configs, **kwargs):
    """Ensure production deployments do not silently use localhost links or console email."""
    errors = []

    if getattr(settings, 'DEBUG', True):
        return errors

    base_url = getattr(settings, 'LEADS_DASHBOARD_BASE_URL', '') or ''
    parsed = urlparse(base_url)
    hostname = (parsed.hostname or '').lower()
    if not base_url or hostname in ('localhost', '127.0.0.1', '::1'):
        errors.append(
            Error(
                'LEADS_DASHBOARD_BASE_URL must be set to a real production hostname.',
                hint='Set LEADS_DASHBOARD_BASE_URL to your production frontend domain.',
                obj='LEADS_DASHBOARD_BASE_URL',
                id='contact.E001',
            )
        )

    email_backend = getattr(settings, 'EMAIL_BACKEND', '')
    if 'console' in email_backend or 'locmem' in email_backend or 'dummy' in email_backend:
        errors.append(
            Error(
                'Production EMAIL_BACKEND cannot be console, locmem, or dummy.',
                hint='Configure an SMTP backend for production.',
                obj='EMAIL_BACKEND',
                id='contact.E002',
            )
        )

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or ''
    if '@example.com' in from_email.lower() or not from_email:
        errors.append(
            Error(
                'DEFAULT_FROM_EMAIL must be a valid sender address in production.',
                hint='Set DEFAULT_FROM_EMAIL to a domain you control.',
                obj='DEFAULT_FROM_EMAIL',
                id='contact.E003',
            )
        )

    return errors
