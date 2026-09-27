"""Lightweight sitemap.xml and robots.txt views.

No external dependencies — generates XML from public CMS content.
Only published/active content is included; drafts and archived items are excluded.
"""
from xml.sax.saxutils import escape as xml_escape

from django.http import HttpResponse
from django.utils import timezone

from apps.site_settings.models import SiteSetting


# Private path prefixes that must never appear in the sitemap and should be
# disallowed in robots.txt. These are explicitly listed to keep the robots
# policy transparent and auditable.
PRIVATE_PATHS = [
    '/cms/',
    '/leads/',
    '/api/',
    '/sidrah-management/',
    '/certificates/verify',
    '/careers',
]

# Static public pages that are always eligible for the sitemap when global
# indexing is enabled. lastmod is intentionally omitted for static pages
# because there is no single reliable "last modified" timestamp for a
# composite CMS-driven page — publishing a fake date would be misleading.
STATIC_PAGES = [
    ('/', 'weekly', 1.0),
    ('/services', 'weekly', 0.9),
    ('/services/ai-automation', 'weekly', 0.8),
    ('/training', 'weekly', 0.8),
    ('/training/starter', 'weekly', 0.7),
    ('/training/offers', 'weekly', 0.7),
    ('/training/secondary', 'weekly', 0.7),
    ('/case-studies', 'weekly', 0.8),
    ('/insights', 'weekly', 0.8),
    # Careers is intentionally excluded from the sitemap while the
    # no-hiring policy is active. The backend, CMS, and data are preserved;
    # only public discovery/indexing is disabled. Re-add when hiring resumes.
]


def _get_base_url():
    """Return the canonical base URL from CMS settings or a default."""
    setting = SiteSetting.get_current()
    if setting and setting.canonical_base_url:
        return setting.canonical_base_url.rstrip('/')
    return 'https://sidrahsoft.com'


def _is_indexable():
    """Return global robots index toggle from CMS settings."""
    setting = SiteSetting.get_current()
    if setting:
        return setting.robots_index
    return True


def robots_txt(request):
    """Generate robots.txt from CMS global settings."""
    base_url = _get_base_url()
    indexable = _is_indexable()

    if indexable:
        lines = ['User-agent: *', 'Allow: /']
        for path in PRIVATE_PATHS:
            lines.append(f'Disallow: {path}')
    else:
        lines = ['User-agent: *', 'Disallow: /']

    lines.append('')
    lines.append(f'Sitemap: {base_url}/sitemap.xml')

    return HttpResponse('\n'.join(lines) + '\n', content_type='text/plain')


def _format_lastmod(dt):
    """Format a datetime as YYYY-MM-DD for sitemap lastmod, or None."""
    if not dt:
        return None
    if hasattr(dt, 'strftime'):
        return dt.strftime('%Y-%m-%d')
    return None


def _collect_training_urls(base_url):
    """Collect indexable professional training program URLs.

    Only programs with status=active and a non-empty slug are included.
    Programs whose landing has seo_noindex=True are excluded.

    lastmod uses the program's updated_at (from TimeStampedModel).
    """
    from apps.training.models import Program

    urls = []
    programs = (
        Program.objects
        .filter(status=Program.STATUS_ACTIVE)
        .exclude(slug='')
        .select_related('landing')
        .order_by('display_order', 'title_en')
    )

    for program in programs:
        # Exclude programs whose landing is marked noindex.
        try:
            landing = program.landing
            if landing.seo_noindex:
                continue
        except Program.landing.RelatedObjectDoesNotExist:
            # No landing record — the public detail page would 404, so skip.
            continue

        lastmod = _format_lastmod(program.updated_at)
        url_entry = {
            'loc': f'{base_url}/training/{program.slug}',
            'changefreq': 'weekly',
            'priority': '0.7',
        }
        if lastmod:
            url_entry['lastmod'] = lastmod
        urls.append(url_entry)

    return urls


def _collect_insight_urls(base_url):
    """Collect published, indexable insight article URLs.

    Only articles with status=published, published_at <= now, and
    robots_index=True are included.

    lastmod uses updated_at, falling back to published_at.
    """
    from apps.insights.models import Article, STATUS_PUBLISHED

    urls = []
    now = timezone.now()
    articles = (
        Article.objects
        .filter(
            status=STATUS_PUBLISHED,
            published_at__lte=now,
            robots_index=True,
        )
        .order_by('-published_at')
    )

    for article in articles:
        lastmod = _format_lastmod(article.updated_at) or _format_lastmod(article.published_at)
        url_entry = {
            'loc': f'{base_url}/insights/{article.slug}',
            'changefreq': 'monthly',
            'priority': '0.6',
        }
        if lastmod:
            url_entry['lastmod'] = lastmod
        urls.append(url_entry)

    return urls


def _collect_service_urls(base_url):
    """Collect active service detail URLs.

    Services with a ``detail_url_override`` (bespoke pages) are skipped here
    because the override URL is already in STATIC_PAGES (e.g.
    /services/ai-automation). Only generic /services/<slug> URLs are generated.
    """
    from apps.services.models import Service

    urls = []
    services = (
        Service.objects
        .filter(is_active=True)
        .exclude(detail_url_override__gt='')
        .order_by('display_order', 'name_en')
    )

    for service in services:
        lastmod = _format_lastmod(service.updated_at)
        url_entry = {
            'loc': f'{base_url}/services/{service.slug}',
            'changefreq': 'weekly',
            'priority': '0.7',
        }
        if lastmod:
            url_entry['lastmod'] = lastmod
        urls.append(url_entry)

    return urls


def sitemap_xml(request):
    """Generate sitemap.xml from public CMS content."""
    base_url = _get_base_url()

    urls = []

    # Static pages — no lastmod (no reliable single timestamp for composite pages)
    for path, changefreq, priority in STATIC_PAGES:
        urls.append({
            'loc': f'{base_url}{path}',
            'changefreq': changefreq,
            'priority': str(priority),
        })

    # Dynamic: active, indexable professional training programs
    urls.extend(_collect_training_urls(base_url))

    # Dynamic: published, indexable insights
    urls.extend(_collect_insight_urls(base_url))

    # Dynamic: active services (generic detail pages only — bespoke pages
    # like /services/ai-automation are in STATIC_PAGES)
    urls.extend(_collect_service_urls(base_url))

    # Active case studies — listing page only (no public detail route exists)
    # Individual case study URLs are NOT included because /case-studies/:slug
    # has no frontend route. Only the /case-studies listing is in the sitemap.

    # Build XML
    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for url in urls:
        loc = xml_escape(url['loc'])
        xml_parts.append('  <url>')
        xml_parts.append(f'    <loc>{loc}</loc>')
        if url.get('lastmod'):
            xml_parts.append(f'    <lastmod>{url["lastmod"]}</lastmod>')
        xml_parts.append(f'    <changefreq>{url["changefreq"]}</changefreq>')
        xml_parts.append(f'    <priority>{url["priority"]}</priority>')
        xml_parts.append('  </url>')

    xml_parts.append('</urlset>')

    return HttpResponse('\n'.join(xml_parts), content_type='application/xml')
