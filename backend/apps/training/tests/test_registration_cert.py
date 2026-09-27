"""Tests for the native website registration form and certificate lifecycle."""
from datetime import timedelta
from decimal import Decimal

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.training.models import (
    Certificate,
    Program,
    ProgramLanding,
    TrainingRegistration,
)

# Disable rate limiting for tests
THROTTLE_OVERRIDE = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'contact_submission': '1000/m',
        'cms_login': '1000/m',
        'apps_script_submission': '1000/m',
        'website_registration': '1000/m',
        'certificate_verify': '1000/m',
    },
}


def _create_program(**overrides):
    defaults = {
        'title_en': 'Test Course',
        'title_ar': 'كورس تجريبي',
        'slug': 'test-course',
        'branch': 'professional',
        'status': 'active',
        'registration_open': True,
    }
    defaults.update(overrides)
    return Program.objects.create(**defaults)


@override_settings(REST_FRAMEWORK=THROTTLE_OVERRIDE)
class WebsiteRegistrationTests(TestCase):
    """Tests for the native website registration endpoint."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.program = _create_program()
        self.landing = ProgramLanding.objects.create(
            program=self.program,
            show_registration_form=True,
        )
        self.client = APIClient()
        self.url = f'/api/v1/training/programs/{self.program.slug}/register/'

    def test_successful_registration(self):
        """A valid registration submission should create a registration with status 'new'."""
        response = self.client.post(self.url, {
            'full_name': 'Ahmed Test',
            'email': 'ahmed@example.com',
            'phone': '+201234567890',
            'college_or_school': 'Cairo University',
            'academic_year': '3rd Year',
            'privacy_policy_consent': True,
            'website_field': '',  # honeypot empty
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_new'])
        self.assertEqual(response.data['status'], 'new')

        reg = TrainingRegistration.objects.get(email='ahmed@example.com')
        self.assertEqual(reg.source, 'website')
        self.assertEqual(reg.full_name, 'Ahmed Test')
        self.assertEqual(reg.college_or_school, 'Cairo University')

    def test_honeypot_rejects_bots(self):
        """If the honeypot field is filled, the submission should be rejected."""
        response = self.client.post(self.url, {
            'full_name': 'Bot',
            'email': 'bot@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
            'website_field': 'spam',  # honeypot filled
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_privacy_consent_required(self):
        """Privacy policy consent must be True."""
        response = self.client.post(self.url, {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': False,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_missing_required_fields(self):
        """Missing required fields should return 400 with field errors."""
        response = self.client.post(self.url, {
            'full_name': '',
            'email': 'invalid',
            'phone': '',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_registration_closed_rejected(self):
        """When registration_open is False, submissions should be rejected."""
        self.program.registration_open = False
        self.program.save()
        response = self.client.post(self.url, {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_registration_deadline_passed(self):
        """When the deadline has passed, submissions should be rejected."""
        self.program.registration_deadline = timezone.now() - timedelta(hours=1)
        self.program.save()
        response = self.client.post(self.url, {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_form_hidden_rejected(self):
        """When show_registration_form is False, submissions should be rejected."""
        self.landing.show_registration_form = False
        self.landing.save()
        response = self.client.post(self.url, {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_duplicate_registration_idempotent(self):
        """A second registration with the same email within 24h should return existing."""
        data = {
            'full_name': 'First Submission',
            'email': 'dup@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
        }
        response1 = self.client.post(self.url, data, format='json')
        self.assertEqual(response1.status_code, 201)

        data['full_name'] = 'Second Submission'
        response2 = self.client.post(self.url, data, format='json')
        self.assertEqual(response2.status_code, 200)
        self.assertFalse(response2.data['is_new'])

    def test_utm_attribution_captured(self):
        """UTM parameters should be stored on the registration."""
        response = self.client.post(self.url, {
            'full_name': 'UTM Test',
            'email': 'utm@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
            'utm_source': 'facebook',
            'utm_medium': 'cpc',
            'utm_campaign': 'summer2026',
            'utm_content': 'ad1',
            'utm_term': 'programming',
            'referrer': 'https://facebook.com',
            'landing_page_url': 'http://localhost:5174/training/test-course',
        }, format='json')
        self.assertEqual(response.status_code, 201)

        reg = TrainingRegistration.objects.get(email='utm@example.com')
        self.assertEqual(reg.utm_source, 'facebook')
        self.assertEqual(reg.utm_medium, 'cpc')
        self.assertEqual(reg.utm_campaign, 'summer2026')
        self.assertEqual(reg.referrer, 'https://facebook.com')

    def test_nonexistent_program_404(self):
        """Registering for a non-existent program should return 404."""
        response = self.client.post(
            '/api/v1/training/programs/nonexistent/register/',
            {'full_name': 'Test', 'email': 't@e.com', 'phone': '+201234567890', 'privacy_policy_consent': True},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

    def test_education_fields_persisted(self):
        """University, university_other, education_status, education_status_other
        should be accepted and persisted to the database."""
        response = self.client.post(self.url, {
            'full_name': 'Education Test',
            'email': 'edu@example.com',
            'phone': '+201234567890',
            'university': 'cairo',
            'education_status': 'first_year',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        reg = TrainingRegistration.objects.get(email='edu@example.com')
        self.assertEqual(reg.university, 'cairo')
        self.assertEqual(reg.education_status, 'first_year')

    def test_other_university_requires_university_other(self):
        """When university='other', university_other must be provided."""
        response = self.client.post(self.url, {
            'full_name': 'Other Uni Test',
            'email': 'otheruni@example.com',
            'phone': '+201234567890',
            'university': 'other',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('university_other', response.data)

    def test_other_education_status_requires_other_field(self):
        """When education_status='other', education_status_other must be provided."""
        response = self.client.post(self.url, {
            'full_name': 'Other Status Test',
            'email': 'otherstatus@example.com',
            'phone': '+201234567890',
            'education_status': 'other',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('education_status_other', response.data)

    def test_invalid_university_rejected(self):
        """An invalid university value should be rejected."""
        response = self.client.post(self.url, {
            'full_name': 'Invalid Uni Test',
            'email': 'invaliduni@example.com',
            'phone': '+201234567890',
            'university': 'not_a_real_university',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_invalid_education_status_rejected(self):
        """An invalid education_status value should be rejected."""
        response = self.client.post(self.url, {
            'full_name': 'Invalid Status Test',
            'email': 'invalidstatus@example.com',
            'phone': '+201234567890',
            'education_status': 'not_a_real_status',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)


class RegistrationWorkflowTests(TestCase):
    """Tests for registration status transitions."""

    def setUp(self):
        self.program = _create_program()
        self.registration = TrainingRegistration.objects.create(
            program=self.program,
            full_name='Workflow Test',
            email='workflow@example.com',
            phone='+201234567890',
            source='website',
        )

    def test_new_to_reviewed(self):
        self.registration.status = 'reviewed'
        self.registration.save()
        self.assertEqual(self.registration.reviewed_at is not None, True)

    def test_invalid_transition_rejected(self):
        """Cannot jump from 'new' directly to 'completed'."""
        self.registration.status = 'completed'
        with self.assertRaises(Exception):
            self.registration.save()

    def test_completed_to_certificate_eligible(self):
        """A completed registration should be certificate eligible."""
        # Walk through valid transitions
        self.registration.status = 'reviewed'
        self.registration.save()
        self.registration.status = 'accepted'
        self.registration.save()
        self.registration.status = 'enrolled'
        self.registration.save()
        self.registration.status = 'completed'
        self.registration.save()
        self.assertTrue(self.registration.certificate_eligible)


@override_settings(REST_FRAMEWORK=THROTTLE_OVERRIDE)
class CertificateLifecycleTests(TestCase):
    """Tests for certificate creation, issuance, revocation, and verification."""

    def setUp(self):
        self.program = _create_program()
        self.registration = TrainingRegistration.objects.create(
            program=self.program,
            full_name='Cert Test',
            email='cert@example.com',
            phone='+201234567890',
            source='website',
        )
        # Walk to completed
        for status in ['reviewed', 'accepted', 'enrolled', 'completed']:
            self.registration.status = status
            self.registration.save()

    def test_completion_certificate_requires_completed_registration(self):
        """Cannot create a completion certificate for a non-completed registration."""
        # Create a fresh registration that is NOT completed
        reg = TrainingRegistration.objects.create(
            program=self.program,
            full_name='Not Completed',
            email='notcompleted@example.com',
            phone='+201234567890',
            source='website',
        )
        # Walk to enrolled (not completed)
        reg.status = 'reviewed'
        reg.save()
        reg.status = 'accepted'
        reg.save()
        reg.status = 'enrolled'
        reg.save()

        cert = Certificate(
            certificate_type='completion',
            training_registration=reg,
        )
        with self.assertRaises(Exception):
            cert.full_clean()

    def test_certificate_reference_format(self):
        """Reference should match SDR-TRN-YYYY-XXXXXX format."""
        cert = Certificate.objects.create(
            certificate_type='completion',
            training_registration=self.registration,
        )
        import re
        self.assertRegex(cert.reference, r'^SDR-TRN-\d{4}-[A-Z0-9]{6}$')

    def test_reference_immutable_after_creation(self):
        """Reference cannot be changed after creation."""
        cert = Certificate.objects.create(
            certificate_type='completion',
            training_registration=self.registration,
        )
        original = cert.reference
        cert.reference = 'SDR-TRN-2026-CHANGED'
        with self.assertRaises(Exception):
            cert.save()

    def test_draft_not_visible_in_public_verification(self):
        """Draft certificates should not be visible via public verification."""
        cert = Certificate.objects.create(
            certificate_type='completion',
            training_registration=self.registration,
            status='draft',
        )
        client = APIClient()
        response = client.get(f'/api/v1/training/certificates/{cert.reference}/verify/')
        self.assertEqual(response.status_code, 404)

    def test_issued_certificate_visible_in_verification(self):
        """Issued certificates should be visible via public verification."""
        cert = Certificate.objects.create(
            certificate_type='completion',
            training_registration=self.registration,
            status='issued',
        )
        client = APIClient()
        response = client.get(f'/api/v1/training/certificates/{cert.reference}/verify/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['reference'], cert.reference)
        self.assertEqual(response.data['recipient_name'], 'Cert Test')
        self.assertTrue(response.data['is_valid'])

    def test_revoked_certificate_still_verifiable(self):
        """Revoked certificates should still be verifiable but show as revoked."""
        cert = Certificate.objects.create(
            certificate_type='completion',
            training_registration=self.registration,
            status='issued',
        )
        cert.status = 'revoked'
        cert.save()

        client = APIClient()
        response = client.get(f'/api/v1/training/certificates/{cert.reference}/verify/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'revoked')
        self.assertFalse(response.data['is_valid'])

    def test_recognition_certificate_without_registration(self):
        """Recognition certificates can be created without a registration."""
        cert = Certificate.objects.create(
            certificate_type='recognition',
            recipient_name='Honored Person',
            program=self.program,
            certificate_title='Excellence Award',
            recognition_reason='Outstanding contribution',
            status='issued',
        )
        self.assertEqual(cert.effective_recipient_name, 'Honored Person')
        self.assertEqual(cert.effective_program, self.program)

        client = APIClient()
        response = client.get(f'/api/v1/training/certificates/{cert.reference}/verify/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['recipient_name'], 'Honored Person')

    def test_verification_no_pii_exposed(self):
        """Public verification should not expose email, phone, or internal notes."""
        cert = Certificate.objects.create(
            certificate_type='completion',
            training_registration=self.registration,
            status='issued',
        )
        client = APIClient()
        response = client.get(f'/api/v1/training/certificates/{cert.reference}/verify/')
        self.assertEqual(response.status_code, 200)
        # Ensure no PII fields in response
        self.assertNotIn('email', response.data)
        self.assertNotIn('phone', response.data)
        self.assertNotIn('national_id', response.data)
        self.assertNotIn('internal_notes', response.data)
        self.assertNotIn('revoked_reason', response.data)

    def test_nonexistent_reference_returns_404(self):
        """A non-existent reference should return 404."""
        client = APIClient()
        response = client.get('/api/v1/training/certificates/SDR-TRN-2026-NONEXS/verify/')
        self.assertEqual(response.status_code, 404)
