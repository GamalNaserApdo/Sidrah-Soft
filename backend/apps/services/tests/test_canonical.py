"""Tests for the canonical service catalog and new API fields."""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from ..models import Service


class ServiceDetailUrlTests(TestCase):
    """Tests for the detail_url serializer field and override behavior."""

    def setUp(self):
        self.client = APIClient()
        self.generic_service = Service.objects.create(
            name_en='Web Development',
            slug='web-development',
            short_description_en='Custom web platforms.',
            display_order=1,
            is_active=True,
            show_on_homepage=True,
            is_featured=True,
        )
        self.bespoke_service = Service.objects.create(
            name_en='AI & Automation',
            slug='ai-automation',
            short_description_en='Intelligent workflows.',
            display_order=2,
            is_active=True,
            show_on_homepage=True,
            is_featured=True,
            detail_url_override='/services/ai-automation',
        )

    def test_generic_service_detail_url(self):
        """Generic services return /services/<slug> as detail_url."""
        response = self.client.get(
            reverse('services:service-detail', kwargs={'slug': 'web-development'}),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['detail_url'], '/services/web-development')

    def test_bespoke_service_detail_url_override(self):
        """Services with detail_url_override return the override URL."""
        response = self.client.get(
            reverse('services:service-detail', kwargs={'slug': 'ai-automation'}),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['detail_url'], '/services/ai-automation')

    def test_list_includes_detail_url(self):
        """List endpoint includes detail_url for each service."""
        response = self.client.get(reverse('services:service-list'))
        self.assertEqual(response.status_code, 200)
        results = {item['slug']: item['detail_url'] for item in response.json()}
        self.assertEqual(results['web-development'], '/services/web-development')
        self.assertEqual(results['ai-automation'], '/services/ai-automation')


class ServiceCaseStudiesTests(TestCase):
    """Tests for the case_studies serializer field."""

    def setUp(self):
        self.client = APIClient()
        self.service = Service.objects.create(
            name_en='Web Development',
            slug='web-development',
            short_description_en='Custom web platforms.',
            display_order=1,
            is_active=True,
            show_on_homepage=True,
        )

    def test_case_studies_empty_when_none_related(self):
        """case_studies is an empty list when no case studies are related."""
        response = self.client.get(
            reverse('services:service-detail', kwargs={'slug': 'web-development'}),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['case_studies'], [])


class ServiceUrlValidationTests(TestCase):
    """Tests for cta_url and detail_url_override validation."""

    def test_clean_rejects_javascript_cta_url(self):
        from django.core.exceptions import ValidationError

        service = Service(
            name_en='Test',
            slug='test-service',
            cta_url='javascript:alert(1)',
        )
        with self.assertRaises(ValidationError):
            service.clean()

    def test_clean_rejects_javascript_detail_url_override(self):
        from django.core.exceptions import ValidationError

        service = Service(
            name_en='Test',
            slug='test-service',
            detail_url_override='javascript:alert(1)',
        )
        with self.assertRaises(ValidationError):
            service.clean()

    def test_clean_accepts_safe_internal_path(self):
        service = Service(
            name_en='Test',
            slug='test-service',
            cta_url='/services/test-service',
            detail_url_override='/services/ai-automation',
        )
        service.clean()  # should not raise


class SeedReconciliationTests(TestCase):
    """Tests for the canonical seed command reconciliation logic."""

    def test_seed_creates_seven_canonical_services(self):
        from django.core.management import call_command

        call_command('seed_services')
        slugs = set(
            Service.objects.values_list('slug', flat=True)
        )
        expected = {
            'web-development',
            'mobile-app-development',
            'erp-business-systems',
            'ai-automation',
            'custom-software-development',
            'data-analytics',
            'system-integration',
        }
        self.assertEqual(slugs, expected)

    def test_seed_is_idempotent(self):
        from django.core.management import call_command

        call_command('seed_services')
        call_command('seed_services')
        self.assertEqual(Service.objects.filter(is_active=True).count(), 7)

    def test_seed_deactivates_non_canonical_services(self):
        from django.core.management import call_command

        Service.objects.create(
            name_en='Legacy Service',
            slug='legacy-thing',
            is_active=True,
        )
        call_command('seed_services')
        legacy = Service.objects.get(slug='legacy-thing')
        self.assertFalse(legacy.is_active)

    def test_seed_renames_legacy_slugs(self):
        from django.core.management import call_command

        Service.objects.create(
            name_en='Web Applications',
            slug='web-applications',
            is_active=True,
        )
        call_command('seed_services')
        self.assertFalse(Service.objects.filter(slug='web-applications').exists())
        self.assertTrue(Service.objects.filter(slug='web-development').exists())

    def test_seed_ai_automation_has_detail_url_override(self):
        from django.core.management import call_command

        call_command('seed_services')
        ai = Service.objects.get(slug='ai-automation')
        self.assertEqual(ai.detail_url_override, '/services/ai-automation')

    def test_seed_does_not_create_training_programs(self):
        from django.core.management import call_command

        call_command('seed_services')
        self.assertFalse(
            Service.objects.filter(slug='training-programs').exists()
        )


class SitemapServicesTests(TestCase):
    """Tests for services in the sitemap."""

    def test_sitemap_includes_services_overview(self):
        response = self.client.get('/sitemap.xml')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode('utf-8')
        self.assertIn('/services', content)
        self.assertIn('/services/ai-automation', content)

    def test_sitemap_includes_active_service_detail_urls(self):
        Service.objects.create(
            name_en='Web Development',
            slug='web-development',
            is_active=True,
        )
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertIn('/services/web-development', content)

    def test_sitemap_excludes_inactive_service_detail_urls(self):
        Service.objects.create(
            name_en='Inactive',
            slug='inactive-service',
            is_active=False,
        )
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('/services/inactive-service', content)

    def test_sitemap_excludes_bespoke_service_from_dynamic_urls(self):
        """Services with detail_url_override are in STATIC_PAGES, not dynamic."""
        Service.objects.create(
            name_en='AI & Automation',
            slug='ai-automation',
            is_active=True,
            detail_url_override='/services/ai-automation',
        )
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        # The static /services/ai-automation should appear exactly once
        # (from STATIC_PAGES, not from _collect_service_urls)
        self.assertEqual(content.count('/services/ai-automation'), 1)

    def test_sitemap_excludes_careers(self):
        """Careers must not be in the sitemap while the no-hiring policy is active."""
        response = self.client.get('/sitemap.xml')
        content = response.content.decode('utf-8')
        self.assertNotIn('/careers', content)
