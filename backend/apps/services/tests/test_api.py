"""Lightweight API tests for the services CMS."""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from ..models import Service


class ServicesAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.active_service = Service.objects.create(
            name_en='Web Applications',
            slug='web-applications',
            short_description_en='Custom web platforms.',
            display_order=1,
            is_active=True,
            show_on_homepage=True,
            is_featured=True,
        )
        self.inactive_service = Service.objects.create(
            name_en='Hidden Service',
            slug='hidden-service',
            short_description_en='Should not appear.',
            display_order=2,
            is_active=False,
            show_on_homepage=False,
            is_featured=False,
        )
        self.homepage_service = Service.objects.create(
            name_en='ERP Solutions',
            slug='erp-solutions',
            short_description_en='Integrated systems.',
            display_order=3,
            is_active=True,
            show_on_homepage=True,
            is_featured=False,
        )

    def test_list_returns_only_active_services(self):
        response = self.client.get(reverse('services:service-list'))
        self.assertEqual(response.status_code, 200)
        results = response.json()
        slugs = {item['slug'] for item in results}
        self.assertIn('web-applications', slugs)
        self.assertIn('erp-solutions', slugs)
        self.assertNotIn('hidden-service', slugs)

    def test_list_preserves_ordering(self):
        response = self.client.get(reverse('services:service-list'))
        results = response.json()
        self.assertEqual(results[0]['slug'], 'web-applications')
        self.assertEqual(results[1]['slug'], 'erp-solutions')

    def test_list_filter_show_on_homepage(self):
        response = self.client.get(
            reverse('services:service-list'),
            {'show_on_homepage': 'true'},
        )
        self.assertEqual(response.status_code, 200)
        for item in response.json():
            self.assertTrue(item['show_on_homepage'])

    def test_detail_returns_active_service(self):
        response = self.client.get(
            reverse('services:service-detail', kwargs={'slug': 'web-applications'}),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['name']['en'], 'Web Applications')

    def test_detail_excludes_inactive_service(self):
        response = self.client.get(
            reverse('services:service-detail', kwargs={'slug': 'hidden-service'}),
        )
        self.assertEqual(response.status_code, 404)

    def test_health_endpoint_remains_available(self):
        response = self.client.get(reverse('core:health'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'ok')
