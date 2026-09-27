"""Production deployment security checks for SidrahSoft.

These checks run as part of Django's system check framework and warn or error
on dangerous production misconfigurations.

Run with: python manage.py check --deploy
"""
from django.conf import settings
from django.core.checks import Error, Tags, register


@register(Tags.security, deploy=True)
def check_debug_false_in_production(app_configs, **kwargs):
    """Error if DEBUG=True in a deployment context.

    A deployment context is any environment where DJANGO_DEPLOYMENT_CHECK
    is enabled, or where DEBUG is True but ALLOWED_HOSTS contains non-localhost
    hosts (a strong signal of a non-development environment).
    """
    errors = []

    if not getattr(settings, 'DEBUG', True):
        return errors

    # Check if this looks like a production environment.
    # If DJANGO_DEPLOYMENT_CHECK is explicitly enabled, always check.
    deployment_check = (
        os.environ.get('DJANGO_DEPLOYMENT_CHECK', '').strip().lower()
        in ('true', '1', 'yes')
    )

    allowed_hosts = getattr(settings, 'ALLOWED_HOSTS', [])
    has_non_localhost_host = any(
        host not in ('localhost', '127.0.0.1', '::1', '0.0.0.0')
        for host in allowed_hosts
    )

    if deployment_check or has_non_localhost_host:
        errors.append(
            Error(
                'DEBUG is True in what appears to be a production environment.',
                hint=(
                    'Set DJANGO_DEBUG=False (or DEBUG=False) in the production '
                    'environment. DEBUG=True exposes stack traces, internal paths, '
                    'and configuration details to attackers.'
                ),
                obj=settings,
                id='sidrah.E001',
            )
        )

    return errors


@register(Tags.security, deploy=True)
def check_secret_key_strength(app_configs, **kwargs):
    """Warn if SECRET_KEY is missing or appears to be a development default."""
    import os
    errors = []

    secret_key = getattr(settings, 'SECRET_KEY', '')
    if not secret_key:
        errors.append(
            Error(
                'SECRET_KEY is not set. The application cannot start safely in production.',
                hint='Set DJANGO_SECRET_KEY to a 64+ character random value.',
                obj=settings,
                id='sidrah.E002',
            )
        )
        return errors

    # Check for known weak/development keys
    weak_patterns = (
        'dev-only-key',
        'change-me',
        'changeme',
        'insecure',
        'placeholder',
        'test-key',
        'django-insecure',
    )
    key_lower = secret_key.lower()
    for pattern in weak_patterns:
        if pattern in key_lower:
            errors.append(
                Error(
                    f'SECRET_KEY appears to contain a weak/development pattern ("{pattern}").',
                    hint='Generate a strong SECRET_KEY with: python -c "import secrets; print(secrets.token_hex(32))"',
                    obj=settings,
                    id='sidrah.E003',
                )
            )
            break

    # Check minimum length
    if len(secret_key) < 32:
        errors.append(
            Error(
                f'SECRET_KEY is only {len(secret_key)} characters. Minimum 50 recommended, 64+ ideal.',
                hint='Generate a stronger SECRET_KEY with: python -c "import secrets; print(secrets.token_hex(32))"',
                obj=settings,
                id='sidrah.E004',
            )
        )

    return errors


@register(Tags.security, deploy=True)
def check_production_allowed_hosts(app_configs, **kwargs):
    """Warn if production ALLOWED_HOSTS contains localhost or LAN IPs."""
    errors = []

    if getattr(settings, 'DEBUG', True):
        return errors

    allowed_hosts = getattr(settings, 'ALLOWED_HOSTS', [])
    development_hosts = {'localhost', '127.0.0.1', '::1', '0.0.0.0'}
    lan_prefixes = ('192.168.', '10.', '172.16.', '172.17.', '172.18.',
                    '172.19.', '172.20.', '172.21.', '172.22.', '172.23.',
                    '172.24.', '172.25.', '172.26.', '172.27.', '172.28.',
                    '172.29.', '172.30.', '172.31.')

    for host in allowed_hosts:
        if host in development_hosts:
            errors.append(
                Error(
                    f'ALLOWED_HOSTS contains development host "{host}" in production.',
                    hint='Remove localhost/127.0.0.1 from ALLOWED_HOSTS in production.',
                    obj=settings,
                    id='sidrah.E005',
                )
            )
        elif any(host.startswith(prefix) for prefix in lan_prefixes):
            errors.append(
                Error(
                    f'ALLOWED_HOSTS contains LAN IP "{host}" in production.',
                    hint='Remove LAN IPs from ALLOWED_HOSTS in production.',
                    obj=settings,
                    id='sidrah.E006',
                )
            )

    return errors


@register(Tags.security, deploy=True)
def check_production_cors_origins(app_configs, **kwargs):
    """Warn if production CORS origins contain localhost, LAN IPs, or HTTP."""
    errors = []

    if getattr(settings, 'DEBUG', True):
        return errors

    cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    development_indicators = ('localhost', '127.0.0.1', '192.168.', '10.', 'http://')

    for origin in cors_origins:
        for indicator in development_indicators:
            if indicator in origin:
                errors.append(
                    Error(
                        f'CORS_ALLOWED_ORIGINS contains development origin "{origin}" in production.',
                        hint='Use only HTTPS production origins in CORS_ALLOWED_ORIGINS.',
                        obj=settings,
                        id='sidrah.E007',
                    )
                )
                break

    return errors


@register(Tags.security, deploy=True)
def check_public_site_url(app_configs, **kwargs):
    """Warn if PUBLIC_SITE_URL is not set to a real production domain."""
    errors = []

    if getattr(settings, 'DEBUG', True):
        return errors

    public_url = getattr(settings, 'PUBLIC_SITE_URL', '')
    if not public_url or 'localhost' in public_url or '127.0.0.1' in public_url:
        errors.append(
            Error(
                'PUBLIC_SITE_URL is not set to a production domain.',
                hint='Set PUBLIC_SITE_URL to the production HTTPS domain (e.g., https://sidrahsoft.com).',
                obj=settings,
                id='sidrah.E008',
            )
        )

    if public_url and not public_url.startswith('https://'):
        errors.append(
            Error(
                f'PUBLIC_SITE_URL ("{public_url}") does not use HTTPS.',
                hint='Set PUBLIC_SITE_URL to an HTTPS URL in production.',
                obj=settings,
                id='sidrah.E009',
            )
        )

    return errors


# Import os at module level (needed by check_debug_false_in_production)
import os
