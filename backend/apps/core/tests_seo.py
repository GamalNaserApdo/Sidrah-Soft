"""Regression tests for SEO foundation: sitemap, robots.txt, X-Robots-Tag.

These tests validate the sitemap content, robots.txt directives, and
X-Robots-Tag headers without mutating permanent seed data. Temporary
records are created in the test database and cleaned up automatically
by Django's TestCase transaction rollback.
"""
from datetime import timedelta
from xml.dom import minidom

from django.test import TestCase, override_settings
from django.utils import timezone

from apps.insights.models import Article, STATUS_PUBLISHED, STATUS_DRAFT
from apps.site_settings.models import SiteSetting
from apps.training.models import Program, ProgramLanding


class SitemapBaseTestCase(TestCase):
    """Base test case that ensures a SiteSetting with canonical_base_url set."""

    @classmethod
    def setUpTestData(cls):
        cls.setting = SiteSetting.objects.create(
            site_name='Test Site',
            canonical_base_url='https://sidrahsoft.com',
            robots_index=True,
            is_active=True,
        )

    def setUp(self):
        # Ensure the test setting is the active one.
        SiteSetting.objects.exclude(pk=self.setting.pk).update(is_active=False)
        self.setting.refresh_from_db()


class SitemapStructureTests(SitemapBaseTestCase):
    """Tests 1-4: sitemap returns 200, valid XML, correct origin, /training/secondary."""

    def test_sitemap_returns_200(self):
        response = self.client.get('/sitemap.xml')
        self.assertEqual(response.status_code, 200)

    def test_sitemap_content_type_is_xml(self):
        response = self.client.get('/sitemap.xml')
        self.assertIn('application/xml', response['Content-Type'])

    def test_sitemap_xml_is_valid(self):
        response = self.client.get('/sitemap.xml')
        try:
            dom = minidom.parseString(response.content)
            self.assertEqual(dom.documentElement.tagName, 'urlset')
        except Exception as exc:
            self.fail(f'Sitemap XML is not parseable: {exc}')

    def test_sitemap_uses_production_origin(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertIn('https://sidrahsoft.com', content)
        self.assertNotIn('localhost', content)
        self.assertNotIn('127.0.0.1', content)

    def test_sitemap_contains_training_secondary(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertIn('https://sidrahsoft.com/training/secondary', content)


class SitemapTrainingTests(SitemapBaseTestCase):
    """Tests 5-7: active indexable courses appear; noindex/draft/archived excluded."""

    def setUp(self):
        super().setUp()
        self.active_course = Program.objects.create(
            slug='test-active-course',
            title_en='Active Course',
            branch='professional',
            status='active',
        )
        ProgramLanding.objects.create(program=self.active_course, seo_noindex=False)

        self.noindex_course = Program.objects.create(
            slug='test-noindex-course',
            title_en='Noindex Course',
            branch='professional',
            status='active',
        )
        ProgramLanding.objects.create(program=self.noindex_course, seo_noindex=True)

        self.draft_course = Program.objects.create(
            slug='test-draft-course',
            title_en='Draft Course',
            branch='professional',
            status='draft',
        )
        ProgramLanding.objects.create(program=self.draft_course, seo_noindex=False)

        self.archived_course = Program.objects.create(
            slug='test-archived-course',
            title_en='Archived Course',
            branch='professional',
            status='archived',
        )
        ProgramLanding.objects.create(program=self.archived_course, seo_noindex=False)

    def test_active_indexable_course_appears(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertIn('https://sidrahsoft.com/training/test-active-course', content)

    def test_noindex_course_excluded(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('https://sidrahsoft.com/training/test-noindex-course', content)

    def test_draft_course_excluded(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('https://sidrahsoft.com/training/test-draft-course', content)

    def test_archived_course_excluded(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('https://sidrahsoft.com/training/test-archived-course', content)


class SitemapInsightsTests(SitemapBaseTestCase):
    """Tests 8-9: published/indexable insights appear; unpublished/noindex excluded."""

    def setUp(self):
        super().setUp()
        now = timezone.now()
        self.published_article = Article.objects.create(
            title_en='Published Article',
            slug='test-published-article',
            status=STATUS_PUBLISHED,
            published_at=now - timedelta(days=1),
            robots_index=True,
        )
        self.unpublished_article = Article.objects.create(
            title_en='Draft Article',
            slug='test-draft-article',
            status=STATUS_DRAFT,
            published_at=now,
            robots_index=True,
        )
        self.noindex_article = Article.objects.create(
            title_en='Noindex Article',
            slug='test-noindex-article',
            status=STATUS_PUBLISHED,
            published_at=now - timedelta(days=1),
            robots_index=False,
        )

    def test_published_indexable_insight_appears(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertIn('https://sidrahsoft.com/insights/test-published-article', content)

    def test_unpublished_insight_excluded(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('https://sidrahsoft.com/insights/test-draft-article', content)

    def test_noindex_insight_excluded(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('https://sidrahsoft.com/insights/test-noindex-article', content)


class SitemapExclusionTests(SitemapBaseTestCase):
    """Tests 10-14: private URLs never appear in sitemap."""

    def test_certificate_verify_urls_absent(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('/certificates/verify', content)

    def test_cms_urls_absent(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('/cms/', content)
        self.assertNotIn('/cms/login', content)

    def test_leads_urls_absent(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('/leads/', content)
        self.assertNotIn('/leads/login', content)

    def test_api_urls_absent(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('/api/', content)

    def test_admin_urls_absent(self):
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('/sidrah-management/', content)


class RobotsTxtTests(SitemapBaseTestCase):
    """Tests 15-17: robots.txt private-path exclusions, sitemap directive, kill switch."""

    def test_robots_contains_private_path_exclusions(self):
        response = self.client.get('/robots.txt')
        content = response.content.decode('utf-8')
        self.assertIn('Disallow: /cms/', content)
        self.assertIn('Disallow: /leads/', content)
        self.assertIn('Disallow: /api/', content)
        self.assertIn('Disallow: /sidrah-management/', content)
        self.assertIn('Disallow: /certificates/verify', content)

    def test_robots_contains_sitemap_directive(self):
        response = self.client.get('/robots.txt')
        content = response.content.decode('utf-8')
        self.assertIn('Sitemap: https://sidrahsoft.com/sitemap.xml', content)

    def test_robots_index_disabled_produces_disallow_all(self):
        self.setting.robots_index = False
        self.setting.save()
        response = self.client.get('/robots.txt')
        content = response.content.decode('utf-8')
        self.assertIn('Disallow: /', content)
        # The sitemap directive should still be present.
        self.assertIn('Sitemap:', content)


class XRobotsTagTests(SitemapBaseTestCase):
    """Tests 18-19: API and admin responses contain X-Robots-Tag."""

    def test_api_response_contains_x_robots_tag(self):
        response = self.client.get('/api/v1/site-settings/')
        self.assertEqual(response['X-Robots-Tag'], 'noindex, nofollow')

    def test_admin_response_contains_x_robots_tag(self):
        # Django admin redirects to login (302) — the header should still be set.
        response = self.client.get('/sidrah-management/')
        self.assertEqual(response['X-Robots-Tag'], 'noindex, nofollow')

    def test_sitemap_does_not_have_x_robots_tag(self):
        response = self.client.get('/sitemap.xml')
        self.assertNotIn('X-Robots-Tag', response)

    def test_robots_txt_does_not_have_x_robots_tag(self):
        response = self.client.get('/robots.txt')
        self.assertNotIn('X-Robots-Tag', response)
