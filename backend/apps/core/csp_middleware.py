"""Content-Security-Policy middleware for SidrahSoft.

Sets a restrictive CSP header on all responses, configurable via environment
variables for production tuning.

The policy is designed to:
- Allow only same-origin resources by default
- Allow Google Fonts (used by the frontend)
- Allow 'unsafe-inline' for styles (required for Vite CSS injection and Django admin)
- Block all inline scripts (except nonces if needed in future)
- Prevent clickjacking (frame-ancestors 'none')
- Restrict form submissions to same origin
- Restrict base URI to same origin

In production, the CSP can be tightened or extended via environment variables.
"""
from django.conf import settings


# Default CSP policy — designed for the SidrahSoft frontend.
# This is intentionally restrictive but compatible with the real application.
# Meta Pixel (connect.facebook.net) is added only to the directives it needs:
#   - script-src: loads fbevents.js
#   - img-src:    <noscript> img fallback and pixel.gif tracking
#   - connect-src: XHR/fetch beacon requests to facebook.com
DEFAULT_CSP = {
    'default-src': ("'self'",),
    'script-src': (
        "'self'",
        'https://connect.facebook.net',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
    ),
    'style-src': ("'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'),
    'font-src': ("'self'", 'https://fonts.gstatic.com', 'data:'),
    'img-src': (
        "'self'",
        'data:',
        'https:',
        'https://www.facebook.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
    ),
    'connect-src': (
        "'self'",
        'https://connect.facebook.net',
        'https://www.facebook.com',
        'https://graph.facebook.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://*.google-analytics.com',
        'https://analytics.google.com',
    ),
    'frame-ancestors': ("'none'",),
    'frame-src': ("'self'", 'https://www.googletagmanager.com'),
    'base-uri': ("'self'",),
    'form-action': ("'self'",),
    'object-src': ("'none'",),
    'media-src': ("'self'",),
    'worker-src': ("'self'",),
    'manifest-src': ("'self'",),
}


def build_csp_header():
    """Build the CSP header string from the default policy."""
    parts = []
    for directive, sources in DEFAULT_CSP.items():
        parts.append(f"{directive} {' '.join(sources)}")
    return '; '.join(parts)


class CSPMiddleware:
    """Middleware that sets the Content-Security-Policy header.

    In DEBUG mode, the CSP is set to Report-Only mode so developers can
    identify violations without breaking functionality.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.csp_header = build_csp_header()

    def __call__(self, request):
        response = self.get_response(request)

        # Don't set CSP on health check or API JSON responses that aren't HTML.
        # CSP is most relevant for HTML pages (admin, error pages, frontend).
        content_type = response.get('Content-Type', '')
        is_html = 'text/html' in content_type or not content_type

        if is_html:
            if getattr(settings, 'DEBUG', False):
                # In development, use Report-Only to catch violations without breaking.
                response['Content-Security-Policy-Report-Only'] = self.csp_header
            else:
                # In production, enforce the policy.
                response['Content-Security-Policy'] = self.csp_header

        return response


class XRobotsTagMiddleware:
    """Add X-Robots-Tag: noindex, nofollow to non-HTML machine surfaces.

    Applies to:
    - /api/ responses (JSON API endpoints)
    - /sidrah-management/ responses (Django admin)

    This prevents search engines from indexing API responses and admin pages
    even if they are accidentally linked or crawled. It is a defense-in-depth
    signal — authentication and authorization remain the primary protection.
    """

    # Path prefixes that should receive the X-Robots-Tag header.
    PROTECTED_PREFIXES = ('/api/', '/sidrah-management/')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        path = request.path_info
        if any(path.startswith(prefix) for prefix in self.PROTECTED_PREFIXES):
            response['X-Robots-Tag'] = 'noindex, nofollow'
        return response
