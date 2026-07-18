"""Central activity logging service for the Custom Sidrah CMS."""
import json
import logging
import re
from typing import Any

from django.conf import settings
from django.utils.timezone import now

from .models import ActivityLog


logger = logging.getLogger(__name__)

# Length bounds to prevent audit table bloat.
_MAX_USER_AGENT_LENGTH = 512
_MAX_OBJECT_REPR_LENGTH = 255
_MAX_FAILURE_REASON_LENGTH = 255
_MAX_ORIGIN_LENGTH = 255
_MAX_DESCRIPTION_LENGTH = 1000
_MAX_METADATA_DEPTH = 5
_MAX_METADATA_STRING_LENGTH = 1000

# Keys that must never appear in metadata or string representations.
_SENSITIVE_KEYS = {
    'password',
    'password1',
    'password2',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'secret_key',
    'authorization',
    'cookie',
    'cookies',
    'csrf',
    'csrftoken',
    'session',
    'sessionid',
    'session_key',
    'key',
    'api_key',
    'credential',
    'credentials',
    'auth',
    'otp',
    'pin',
    'credit_card',
    'cvv',
    'ssn',
}


_SENSITIVE_KEY_RE = re.compile(
    r'(' + '|'.join(re.escape(k) for k in _SENSITIVE_KEYS) + r')',
    re.IGNORECASE,
)


def _is_sensitive_key(key):
    """Return True if the key matches a sensitive pattern."""
    if not isinstance(key, str):
        return False
    return bool(_SENSITIVE_KEY_RE.search(key))


def _truncate(value, max_length):
    """Truncate a string to max_length characters."""
    if not isinstance(value, str):
        return value
    return value[:max_length]


def sanitize_metadata(obj, depth=0):
    """
    Recursively sanitize a JSON-serializable object.

    - Removes sensitive keys.
    - Truncates overly long strings.
    - Limits recursion depth.
    - Converts non-serializable objects to strings safely.
    """
    if depth > _MAX_METADATA_DEPTH:
        return '[max-depth-reached]'

    if isinstance(obj, dict):
        cleaned = {}
        for key, value in obj.items():
            if _is_sensitive_key(key):
                cleaned[key] = '[redacted]'
                continue
            cleaned[key] = sanitize_metadata(value, depth + 1)
        return cleaned

    if isinstance(obj, (list, tuple)):
        return [sanitize_metadata(item, depth + 1) for item in obj]

    if isinstance(obj, str):
        return _truncate(obj, _MAX_METADATA_STRING_LENGTH)

    if isinstance(obj, (bool, int, float)):
        return obj

    if obj is None:
        return None

    # Fall back to a safe string representation.
    try:
        return str(obj)
    except Exception:
        return '[unserializable]'


def _extract_username(user):
    """Return a safe username string for an anonymous or authenticated user."""
    if not user or not getattr(user, 'is_authenticated', False):
        return ''
    return getattr(user, 'username', '') or getattr(user, 'email', '') or ''


def _extract_client_ip(request):
    """
    Extract the client IP address using a conservative trusted-proxy policy.

    If settings.ACTIVITY_LOG_TRUST_PROXY is True and a well-formed
    X-Forwarded-For header is present, the last IP in the chain is used.
    Otherwise REMOTE_ADDR is used, which is the only trusted value for
    single-server or untrusted-proxy deployments.
    """
    remote_addr = request.META.get('REMOTE_ADDR', '') if request else ''
    if not getattr(settings, 'ACTIVITY_LOG_TRUST_PROXY', False):
        return remote_addr or None

    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '') if request else ''
    if not forwarded:
        return remote_addr or None

    # Take the last address before the immediate proxy (common convention).
    parts = [p.strip() for p in forwarded.split(',') if p.strip()]
    candidate = parts[-1] if parts else remote_addr
    return candidate or None


def _safe_request_context(request):
    """Extract safe request context without secrets."""
    if not request:
        return {}

    context = {
        'method': (request.method or '')[:10],
        'path': (request.path or '')[:255],
        'origin': '',
        'user_agent': '',
    }

    try:
        origin = request.headers.get('Origin', '')
        context['origin'] = _truncate(origin, _MAX_ORIGIN_LENGTH)
    except Exception:
        pass

    try:
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        context['user_agent'] = _truncate(user_agent, _MAX_USER_AGENT_LENGTH)
    except Exception:
        pass

    return context


def log_activity(
    *,
    user=None,
    action,
    module='',
    request=None,
    object_instance=None,
    object_type='',
    object_id='',
    object_repr='',
    description='',
    metadata=None,
    is_success=True,
    failure_reason='',
):
    """
    Create an ActivityLog entry.

    This function is append-only and never raises; failures are logged to
    the Python logger so the primary business operation is never disrupted.
    """
    try:
        request_context = _safe_request_context(request)
        metadata = sanitize_metadata(metadata or {})

        # Resolve target object identifiers.
        if object_instance is not None:
            if not object_type:
                object_type = f'{object_instance._meta.app_label}.{object_instance._meta.model_name}'
            if not object_id:
                object_id = str(getattr(object_instance, 'pk', ''))
            if not object_repr:
                object_repr = str(object_instance)[:_MAX_OBJECT_REPR_LENGTH]

        # Ensure text bounds.
        object_repr = _truncate(object_repr, _MAX_OBJECT_REPR_LENGTH)
        description = _truncate(description, _MAX_DESCRIPTION_LENGTH)
        failure_reason = _truncate(failure_reason, _MAX_FAILURE_REASON_LENGTH)

        ActivityLog.objects.create(
            user=user if user and getattr(user, 'is_authenticated', False) else None,
            username=_extract_username(user),
            action=action,
            module=module,
            object_type=object_type,
            object_id=object_id,
            object_repr=object_repr,
            description=description,
            metadata=metadata,
            ip_address=_extract_client_ip(request),
            user_agent=request_context.get('user_agent', ''),
            origin=request_context.get('origin', ''),
            request_method=request_context.get('method', ''),
            request_path=request_context.get('path', ''),
            is_success=is_success,
            failure_reason=failure_reason,
        )
    except Exception as exc:
        # Never break the primary operation because of logging failure.
        logger.exception('Failed to create activity log: %s', exc)


def log_content_action(
    *,
    user,
    action,
    module,
    instance=None,
    request=None,
    object_type='',
    object_id='',
    object_repr='',
    description='',
    metadata=None,
    is_success=True,
    failure_reason='',
):
    """
    Reusable helper for content CRUD logging.

    Future admin API views should call this after successful mutations.
    """
    log_activity(
        user=user,
        action=action,
        module=module,
        request=request,
        object_instance=instance,
        object_type=object_type,
        object_id=object_id,
        object_repr=object_repr,
        description=description,
        metadata=metadata,
        is_success=is_success,
        failure_reason=failure_reason,
    )
