"""Lightweight sitemap.xml and robots.txt views.

No external dependencies — generates XML from public CMS content.
Only published/active content is included; drafts and archived items are excluded.
"""
from datetime import datetime
from xml.sax.saxutils import escape as xml_escape

from django.http import HttpResponse
from django.utils import timezone

from apps.site_settings.models import SiteSetting


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
        lines = [
            'User-agent: *',
            'Allow: /',
            '',
            f'Sitemap: {base_url}/sitemap.xml',
        ]
    else:
        lines = [
            'User-agent: *',
            'Disallow: /',
            '',
            f'Sitemap: {base_url}/sitemap.xml',
        ]

    return HttpResponse('\n'.join(lines) + '\n', content_type='text/plain')


def sitemap_xml(request):
    """Generate sitemap.xml from public CMS content."""
    base_url = _get_base_url()
    now = timezone.now()

    urls = []

    # Static pages
    static_pages = [
        ('/', 'weekly', 1.0),
        ('/training', 'monthly', 0.8),
        ('/case-studies', 'weekly', 0.8),
        ('/insights', 'weekly', 0.8),
        ('/careers', 'weekly', 0.7),
    ]

    for path, changefreq, priority in static_pages:
        urls.append({
            'loc': f'{base_url}{path}',
            'lastmod': now.strftime('%Y-%m-%d'),
            'changefreq': changefreq,
            'priority': str(priority),
        })

    # Published insights
    try:
        from apps.insights.models import Article, STATUS_PUBLISHED
        articles = Article.objects.filter(
            status=STATUS_PUBLISHED,
            published_at__lte=now,
            robots_index=True,
        ).values('slug', 'published_at', 'updated_at')

        for article in articles:
            lastmod = article.get('updated_at') or article.get('published_at') or now
            urls.append({
                'loc': f'{base_url}/insights/{article["slug"]}',
                'lastmod': lastmod.strftime('%Y-%m-%d') if hasattr(lastmod, 'strftime') else now.strftime('%Y-%m-%d'),
                'changefreq': 'monthly',
                'priority': '0.6',
            })
    except Exception:
        pass

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
        xml_parts.append(f'    <lastmod>{url["lastmod"]}</lastmod>')
        xml_parts.append(f'    <changefreq>{url["changefreq"]}</changefreq>')
        xml_parts.append(f'    <priority>{url["priority"]}</priority>')
        xml_parts.append('  </url>')

    xml_parts.append('</urlset>')

    return HttpResponse('\n'.join(xml_parts), content_type='application/xml')
