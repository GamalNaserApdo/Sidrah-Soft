"""Focused API tests for the careers CMS."""
from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from ..models import Job


class JobAPITests(TestCase):
    def setUp(self):
        self.active_job = Job.objects.create(
            title_en='Active Engineer',
            title_ar='مهندس نشط',
            slug='active-engineer',
            employment_type=Job.EMPLOYMENT_TYPE_FULL_TIME,
            workplace_type=Job.WORKPLACE_TYPE_HYBRID,
            experience_level=Job.EXPERIENCE_LEVEL_MID,
            application_method=Job.APPLICATION_METHOD_CONTACT_PAGE,
            is_active=True,
            show_on_homepage=True,
        )
        self.inactive_job = Job.objects.create(
            title_en='Inactive Engineer',
            title_ar='مهندس غير نشط',
            slug='inactive-engineer',
            employment_type=Job.EMPLOYMENT_TYPE_FULL_TIME,
            workplace_type=Job.WORKPLACE_TYPE_REMOTE,
            experience_level=Job.EXPERIENCE_LEVEL_SENIOR,
            application_method=Job.APPLICATION_METHOD_CONTACT_PAGE,
            is_active=False,
        )
        self.expired_job = Job.objects.create(
            title_en='Expired Engineer',
            title_ar='مهندس منتهي',
            slug='expired-engineer',
            employment_type=Job.EMPLOYMENT_TYPE_CONTRACT,
            workplace_type=Job.WORKPLACE_TYPE_ONSITE,
            experience_level=Job.EXPERIENCE_LEVEL_JUNIOR,
            application_method=Job.APPLICATION_METHOD_CONTACT_PAGE,
            is_active=True,
            closing_date=timezone.now().date() - timedelta(days=1),
        )

    def test_list_returns_200_and_active_jobs(self):
        response = self.client.get(reverse('careers:job-list'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        slugs = {item['slug'] for item in data}
        self.assertIn(self.active_job.slug, slugs)
        self.assertNotIn(self.inactive_job.slug, slugs)
        self.assertNotIn(self.expired_job.slug, slugs)

    def test_detail_returns_200_for_active_job(self):
        response = self.client.get(
            reverse('careers:job-detail', kwargs={'slug': self.active_job.slug}),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['slug'], self.active_job.slug)

    def test_detail_404_for_inactive_job(self):
        response = self.client.get(
            reverse('careers:job-detail', kwargs={'slug': self.inactive_job.slug}),
        )
        self.assertEqual(response.status_code, 404)

    def test_detail_404_for_expired_job(self):
        response = self.client.get(
            reverse('careers:job-detail', kwargs={'slug': self.expired_job.slug}),
        )
        self.assertEqual(response.status_code, 404)

    def test_homepage_filter(self):
        response = self.client.get(
            reverse('careers:job-list'),
            {'show_on_homepage': 'true'},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['slug'], self.active_job.slug)
