"""Short-lived, signed preview tokens for draft programs.

Architecture decision: Preview tokens are NOT stored in the database.
Instead, we use Django's cryptographic signing framework to create
time-limited tokens that are:
  - Bound to a specific program slug
  - Bound to a specific purpose ('program_preview')
  - Valid for a short duration (default 10 minutes)
  - Issued only to authenticated CMS users
  - Cannot be reused after expiry
  - Do not allow data modification

The token is signed with Django's SECRET_KEY, so any change to SECRET_KEY
invalidates all outstanding tokens.
"""
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired


PREVIEW_PURPOSE = 'program_preview'
DEFAULT_MAX_AGE = 600  # 10 minutes in seconds


def generate_preview_token(program_slug, max_age=DEFAULT_MAX_AGE):
    """Generate a short-lived signed preview token for a program slug.

    The token encodes the program_slug and a timestamp. The max_age is
    NOT embedded in the token — it is enforced at verification time
    using DEFAULT_MAX_AGE. Callers should not override max_age unless
    they have a specific reason.

    Args:
        program_slug: The slug of the program to preview.
        max_age: Token validity in seconds (default 600 = 10 minutes).
                 Note: this is enforced at verification time, not embedded.

    Returns:
        A signed token string.
    """
    signer = TimestampSigner(salt=PREVIEW_PURPOSE)
    return signer.sign(program_slug)


def verify_preview_token(token, program_slug, max_age=DEFAULT_MAX_AGE):
    """Verify a preview token against a program slug.

    Args:
        token: The signed token string.
        program_slug: The expected program slug.
        max_age: Maximum age in seconds (default 600 = 10 minutes).

    Returns:
        True if the token is valid and matches the program slug.

    Raises:
        SignatureExpired: If the token has expired.
        BadSignature: If the token is invalid, tampered, or doesn't match.
    """
    signer = TimestampSigner(salt=PREVIEW_PURPOSE)
    # unsign validates the timestamp; max_age controls expiry
    unsigned = signer.unsign(token, max_age=max_age)
    # The unsigned value is the program_slug
    if unsigned != program_slug:
        raise BadSignature('Token does not match program slug.')
    return True


def is_preview_token_valid(token, program_slug, max_age=DEFAULT_MAX_AGE):
    """Safe boolean check — returns True/False without raising."""
    try:
        verify_preview_token(token, program_slug, max_age)
        return True
    except (BadSignature, SignatureExpired):
        return False
