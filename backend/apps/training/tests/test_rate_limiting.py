"""Tests for rate limiting on public endpoints.

These tests RE-ENABLE throttling (which is disabled in test_settings.py)
to verify that rate limiting actually works.

DRF caches throttle_classes at class definition time, so we patch the
view classes directly instead of relying on override_settings.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.throttling import ScopedRateThrottle
from unittest.mock import patch

from apps.training.models import (
    Certificate,
    Program,
    ProgramLanding,
    TrainingRegistration,
)


def _create_program(**overrides):
    defaults = {
        'title_en': 'Throttle Test Course',
        'title_ar': 'كورس اختبار',
        'slug': 'throttle-test-course',
        'branch': 'professional',
        'status': 'active',
        'registration_open': True,
    }
    defaults.update(overrides)
    return Program.objects.create(**defaults)


class RegistrationRateLimitTests(TestCase):
    """Verify that the registration endpoint enforces rate limiting."""

    def setUp(self):
        # Patch the view to use ScopedRateThrottle
        self._view_patcher = patch.object(
            __import__('apps.training.views', fromlist=['WebsiteRegistrationView']).WebsiteRegistrationView,
            'throttle_classes',
            [ScopedRateThrottle]
        )
        self._view_patcher.start()

        # Patch the throttle rates dict on the class itself
        self._original_rates = ScopedRateThrottle.THROTTLE_RATES
        ScopedRateThrottle.THROTTLE_RATES = {
            **self._original_rates,
            'website_registration': '2/min',
        }

        self.program = _create_program()
        ProgramLanding.objects.create(program=self.program, show_registration_form=True)
        self.client = APIClient()
        self.url = f'/api/v1/training/programs/{self.program.slug}/register/'
        self.payload = {
            'full_name': 'Throttle Test',
            'email': 'throttle@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
        }

    def tearDown(self):
        self._view_patcher.stop()
        ScopedRateThrottle.THROTTLE_RATES = self._original_rates

    def test_registration_rate_limited_after_limit(self):
        """After 2 requests/min, the 3rd should return 429."""
        r1 = self.client.post(self.url, {**self.payload, 'email': 't1@example.com'}, format='json')
        self.assertEqual(r1.status_code, 201)

        r2 = self.client.post(self.url, {**self.payload, 'email': 't2@example.com'}, format='json')
        self.assertEqual(r2.status_code, 201)

        r3 = self.client.post(self.url, {**self.payload, 'email': 't3@example.com'}, format='json')
        self.assertEqual(r3.status_code, 429)


class CertificateVerifyRateLimitTests(TestCase):
    """Verify that the certificate verification endpoint enforces rate limiting."""

    def setUp(self):
        self._view_patcher = patch.object(
            __import__('apps.training.views', fromlist=['CertificateVerifyView']).CertificateVerifyView,
            'throttle_classes',
            [ScopedRateThrottle]
        )
        self._view_patcher.start()

        self._original_rates = ScopedRateThrottle.THROTTLE_RATES
        ScopedRateThrottle.THROTTLE_RATES = {
            **self._original_rates,
            'certificate_verify': '2/min',
        }

        self.program = _create_program(slug='cert-throttle-course')
        self.reg = TrainingRegistration.objects.create(
            program=self.program,
            full_name='Cert Throttle',
            email='certthrottle@example.com',
            phone='+201234567890',
            source='website',
        )
        for s in ['reviewed', 'accepted', 'enrolled', 'completed']:
            self.reg.status = s
            self.reg.save()

        self.cert = Certificate.objects.create(
            certificate_type='completion',
            training_registration=self.reg,
            status='issued',
        )
        self.client = APIClient()

    def tearDown(self):
        self._view_patcher.stop()
        ScopedRateThrottle.THROTTLE_RATES = self._original_rates

    def test_verification_rate_limited_after_limit(self):
        """After 2 requests/min, the 3rd should return 429."""
        url = f'/api/v1/training/certificates/{self.cert.reference}/verify/'

        r1 = self.client.get(url)
        self.assertEqual(r1.status_code, 200)

        r2 = self.client.get(url)
        self.assertEqual(r2.status_code, 200)

        r3 = self.client.get(url)
        self.assertEqual(r3.status_code, 429)
