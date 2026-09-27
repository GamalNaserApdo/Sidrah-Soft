"""Shared validation helpers for SEO fields in CMS serializers."""
import re

from rest_framework import serializers

CONTROL_CHAR_RE = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')

SEO_TITLE_MAX_LENGTH = 60
SEO_DESCRIPTION_MAX_LENGTH = 160
OG_TITLE_MAX_LENGTH = 100
OG_DESCRIPTION_MAX_LENGTH = 200

VALID_TWITTER_CARD_TYPES = {'summary', 'summary_large_image', 'player'}


def clean_seo_text(value):
    """Strip control characters from text fields. Returns None if input is None."""
    if value is None:
        return None
    return CONTROL_CHAR_RE.sub('', value)


def validate_seo_title(value):
    """Validate SEO title length and content."""
    if not value:
        return value
    cleaned = clean_seo_text(value)
    if len(cleaned) > SEO_TITLE_MAX_LENGTH:
        raise serializers.ValidationError(
            f'SEO title must be {SEO_TITLE_MAX_LENGTH} characters or fewer (got {len(cleaned)}).'
        )
    return cleaned


def validate_seo_description(value):
    """Validate SEO description length and content."""
    if not value:
        return value
    cleaned = clean_seo_text(value)
    if len(cleaned) > SEO_DESCRIPTION_MAX_LENGTH:
        raise serializers.ValidationError(
            f'SEO description must be {SEO_DESCRIPTION_MAX_LENGTH} characters or fewer (got {len(cleaned)}).'
        )
    return cleaned


def validate_og_title(value):
    """Validate OG title length and content."""
    if not value:
        return value
    cleaned = clean_seo_text(value)
    if len(cleaned) > OG_TITLE_MAX_LENGTH:
        raise serializers.ValidationError(
            f'OG title must be {OG_TITLE_MAX_LENGTH} characters or fewer (got {len(cleaned)}).'
        )
    return cleaned


def validate_og_description(value):
    """Validate OG description length and content."""
    if not value:
        return value
    cleaned = clean_seo_text(value)
    if len(cleaned) > OG_DESCRIPTION_MAX_LENGTH:
        raise serializers.ValidationError(
            f'OG description must be {OG_DESCRIPTION_MAX_LENGTH} characters or fewer (got {len(cleaned)}).'
        )
    return cleaned


def validate_canonical_url(value):
    """Validate canonical URL: must be http/https scheme if provided."""
    if not value:
        return value
    lowered = value.lower()
    if not (lowered.startswith('https://') or lowered.startswith('http://')):
        raise serializers.ValidationError(
            'Canonical URL must start with http:// or https://'
        )
    return value


def validate_twitter_card_type(value):
    """Validate Twitter card type is one of the allowed values."""
    if not value:
        return value
    if value not in VALID_TWITTER_CARD_TYPES:
        raise serializers.ValidationError(
            f'Twitter card type must be one of: {", ".join(sorted(VALID_TWITTER_CARD_TYPES))}.'
        )
    return value


# Meta Pixel IDs are numeric strings, typically 15-16 digits.
META_PIXEL_ID_RE = re.compile(r'^\d{8,20}$')


def validate_meta_pixel_id(value):
    """Validate a Meta Pixel ID.

    The ID must be a trimmed numeric string of 8-20 digits. This intentionally
    rejects HTML, JavaScript, URLs, script tags, whitespace, and any non-digit
    characters to prevent CMS users from injecting arbitrary code.
    """
    if not value:
        return ''
    if not isinstance(value, str):
        raise serializers.ValidationError('Meta Pixel ID must be a string.')
    cleaned = value.strip()
    if not cleaned:
        return ''
    if not META_PIXEL_ID_RE.match(cleaned):
        raise serializers.ValidationError(
            'Meta Pixel ID must contain only digits (8-20 numeric characters). '
            'HTML, JavaScript, URLs, and special characters are not allowed.'
        )
    return cleaned


# Google Tag Manager container ID: GTM- followed by ASCII alphanumeric characters.
# Google does not publish a fixed length for the suffix, so the validator only
# enforces the prefix and an alphanumeric suffix without whitespace, hidden
# Unicode characters, or arbitrary punctuation.
GTM_CONTAINER_ID_RE = re.compile(r'^GTM-[A-Z0-9]+$')


def validate_google_tag_manager_container_id(value):
    """Validate a Google Tag Manager container ID (GTM-XXXX...).

    Rejects arbitrary scripts, URLs, HTML, whitespace, zero-width Unicode
    characters, and malformed values.
    """
    if not value:
        return ''
    if not isinstance(value, str):
        raise serializers.ValidationError('GTM container ID must be a string.')
    if value != value.strip():
        raise serializers.ValidationError('GTM container ID must not contain leading or trailing whitespace.')
    cleaned = value.upper()
    if not cleaned:
        return ''
    if not GTM_CONTAINER_ID_RE.match(cleaned):
        raise serializers.ValidationError(
            'GTM container ID must start with GTM- followed by only letters and digits. '
            'Spaces, Unicode control characters, and special characters are not allowed.'
        )
    return cleaned


# Google Analytics 4 measurement ID: G- followed by 10 alphanumeric characters.
GA4_MEASUREMENT_ID_RE = re.compile(r'^G-[A-Z0-9]{10}$')


def validate_google_analytics_measurement_id(value):
    """Validate a Google Analytics 4 Measurement ID (G-XXXXXXXXXX).

    Rejects arbitrary scripts, URLs, HTML, and malformed values.
    """
    if not value:
        return ''
    if not isinstance(value, str):
        raise serializers.ValidationError('GA4 Measurement ID must be a string.')
    cleaned = value.strip().upper()
    if not cleaned:
        return ''
    if not GA4_MEASUREMENT_ID_RE.match(cleaned):
        raise serializers.ValidationError(
            'GA4 Measurement ID must match G-XXXXXXXXXX (10 letters/digits). '
            'HTML, JavaScript, URLs, and special characters are not allowed.'
        )
    return cleaned


VALID_SEARCH_CONSOLE_VERIFICATION_METHODS = {'dns', 'html_meta', 'html_file'}


def validate_search_console_verification_method(value):
    """Validate Google Search Console verification method."""
    if not value:
        return 'dns'
    if not isinstance(value, str):
        raise serializers.ValidationError('Verification method must be a string.')
    cleaned = value.strip().lower()
    if cleaned not in VALID_SEARCH_CONSOLE_VERIFICATION_METHODS:
        raise serializers.ValidationError(
            f'Verification method must be one of: '
            f'{", ".join(sorted(VALID_SEARCH_CONSOLE_VERIFICATION_METHODS))}.'
        )
    return cleaned


def validate_search_console_sitemap_url(value):
    """Validate a sitemap URL or path.

    Allows a relative path (e.g. /sitemap.xml) or an https URL.
    """
    if not value:
        return ''
    if not isinstance(value, str):
        raise serializers.ValidationError('Sitemap URL must be a string.')
    cleaned = value.strip()
    if not cleaned:
        return ''
    if cleaned.startswith('/'):
        if not re.match(r'^/[A-Za-z0-9._\-/]+$', cleaned) or '..' in cleaned or '//' in cleaned:
            raise serializers.ValidationError(
                'Relative sitemap path must be a simple, safe path starting with /.'
            )
        return cleaned
    if not (cleaned.lower().startswith('https://') or cleaned.lower().startswith('http://')):
        raise serializers.ValidationError(
            'Sitemap URL must be a relative path starting with / or an http(s) URL.'
        )
    return cleaned


# Schemes that must never be used in CMS-editable CTA destinations.
UNSAFE_CTA_SCHEMES = ('javascript:', 'data:', 'vbscript:', 'file:', 'about:')


def validate_safe_cta_url(value):
    """Validate a CMS-editable CTA destination.

    Allows:
      - safe internal paths starting with /
      - http(s) URLs

    Rejects unsafe schemes (javascript:, data:, vbscript:, file:, about:)
    and relative paths containing traversal patterns.
    """
    if not value:
        return ''
    if not isinstance(value, str):
        raise serializers.ValidationError('CTA URL must be a string.')
    cleaned = value.strip()
    if not cleaned:
        return ''
    lowered = cleaned.lower()
    if any(lowered.startswith(s) for s in UNSAFE_CTA_SCHEMES):
        raise serializers.ValidationError(
            'CTA URL must not use an unsafe scheme (javascript:, data:, vbscript:, file:, about:).'
        )
    if cleaned.startswith('/'):
        if '..' in cleaned or '//' in cleaned:
            raise serializers.ValidationError('CTA relative path must not contain traversal patterns.')
        if not re.match(r'^/[A-Za-z0-9._\-/?=&#]+$', cleaned):
            raise serializers.ValidationError(
                'CTA relative path must be a simple, safe path starting with /.'
            )
        return cleaned
    if not (lowered.startswith('https://') or lowered.startswith('http://')):
        raise serializers.ValidationError(
            'CTA URL must be a relative path starting with / or an http(s) URL.'
        )
    return cleaned
