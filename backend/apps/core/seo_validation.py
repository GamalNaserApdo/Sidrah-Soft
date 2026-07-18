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
