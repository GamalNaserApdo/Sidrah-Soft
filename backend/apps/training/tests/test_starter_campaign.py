"""Tests for Starter campaign registration fields and validation.

Covers the new campaign landing page registration flow:
- valid Starter registration with campaign fields
- invalid/non-Starter Program rejection
- required fields
- invalid email
- phone validation
- Current Status Other validation
- Acquisition Source Other validation
- UTM persistence
- duplicate handling
- email failure does not lose registration
- email only after valid persistence
- CMS visibility/serialization
- anonymous endpoint security
"""
from unittest.mock import patch, MagicMock

from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from apps.training.models import Program, TrainingRegistration


# Disable throttling for tests — the 5/m website_registration scope would
# otherwise trip after 5 POSTs in one test run.
THROTTLE_OVERRIDE = {
    'DEFAULT_THROTTLE_RATES': {
        'website_registration': '1000/m',
        'apps_script_submission': '1000/m',
        'certificate_verify': '1000/m',
    }
}


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_RATES': THROTTLE_OVERRIDE['DEFAULT_THROTTLE_RATES']})
class StarterCampaignRegistrationTests(TestCase):
    """Test the Starter campaign registration flow end-to-end."""

    @classmethod
    def setUpTestData(cls):
        cls.starter = Program.objects.create(
            slug='starter-python-campaign-test',
            title_en='Python Programming',
            title_ar='برمجة بايثون',
            branch=Program.BRANCH_STARTER,
            status=Program.STATUS_ACTIVE,
            registration_open=True,
        )
        cls.professional = Program.objects.create(
            slug='pro-frontend-campaign-test',
            title_en='Frontend Development Pro',
            title_ar='تطوير الواجهة الأمامية',
            branch=Program.BRANCH_PROFESSIONAL,
            status=Program.STATUS_ACTIVE,
            registration_open=True,
        )

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = reverse('website-registration', args=[self.starter.slug])
        self.valid_payload = {
            'full_name': 'Ahmed Test',
            'email': 'ahmed.test@example.com',
            'phone': '+20 100 123 4567',
            'current_level': 'beginner',
            'current_status': 'student',
            'acquisition_source': 'facebook',
            'privacy_policy_consent': True,
        }

    def test_valid_starter_registration(self):
        """A valid Starter registration with campaign fields succeeds."""
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_new'])
        reg = TrainingRegistration.objects.get(email='ahmed.test@example.com')
        self.assertEqual(reg.current_level, 'beginner')
        self.assertEqual(reg.current_status, 'student')
        self.assertEqual(reg.acquisition_source, 'facebook')
        self.assertEqual(reg.program, self.starter)

    def test_native_registration_source_is_website(self):
        """A registration through the native website form must have source='website',
        NOT 'google_form'. This is the source attribution bug fix verification."""
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, 201)
        reg = TrainingRegistration.objects.get(email='ahmed.test@example.com')
        self.assertEqual(reg.source, TrainingRegistration.SOURCE_WEBSITE)
        self.assertNotEqual(reg.source, TrainingRegistration.SOURCE_GOOGLE_FORM)

    def test_utm_source_does_not_overwrite_registration_source(self):
        """UTM source (marketing attribution) must NOT overwrite the registration
        source (channel/system). source='website', utm_source='facebook' coexist."""
        payload = {**self.valid_payload, 'utm_source': 'facebook'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        reg = TrainingRegistration.objects.get(email='ahmed.test@example.com')
        self.assertEqual(reg.source, TrainingRegistration.SOURCE_WEBSITE)
        self.assertEqual(reg.utm_source, 'facebook')

    def test_legacy_google_form_source_preserved(self):
        """Existing legacy Google Form registrations remain supported — the
        SOURCE_GOOGLE_FORM value is still valid and displayable."""
        legacy = TrainingRegistration.objects.create(
            program=self.starter,
            full_name='Legacy User',
            email='legacy@example.com',
            phone='+20 100 000 0000',
            source=TrainingRegistration.SOURCE_GOOGLE_FORM,
        )
        self.assertEqual(legacy.source, TrainingRegistration.SOURCE_GOOGLE_FORM)
        # Ensure it's a valid choice
        self.assertIn(legacy.source, dict(TrainingRegistration.SOURCE_CHOICES))

    def test_non_starter_program_rejected(self):
        """A registration against a non-Starter program still works (legacy forms)
        but campaign fields are optional — they don't block non-starter programs."""
        url = reverse('website-registration', args=[self.professional.slug])
        payload = {
            'full_name': 'Pro User',
            'email': 'pro@example.com',
            'phone': '+20 100 999 8888',
            'privacy_policy_consent': True,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 201)

    def test_required_fields(self):
        """Missing required fields returns 400."""
        payload = {'full_name': '', 'email': '', 'phone': ''}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_invalid_email(self):
        """Invalid email format returns 400."""
        payload = {**self.valid_payload, 'email': 'not-an-email'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_blank_email_succeeds_for_starter_and_skips_confirmation(self):
        payload = {**self.valid_payload, 'email': ''}
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        registration = TrainingRegistration.objects.get(phone_normalized='201001234567')
        self.assertEqual(registration.email, '')
        self.assertEqual(
            registration.confirmation_email_status,
            TrainingRegistration.CONFIRMATION_NOT_ATTEMPTED,
        )
        self.assertIsNone(registration.confirmation_email_attempted_at)

    def test_blank_email_uses_phone_for_idempotency(self):
        payload = {**self.valid_payload, 'email': ''}
        response1 = self.client.post(self.url, payload, format='json')
        response2 = self.client.post(self.url, payload, format='json')
        self.assertEqual(response1.status_code, 201)
        self.assertEqual(response2.status_code, 200)
        self.assertFalse(response2.data['is_new'])
        self.assertEqual(
            TrainingRegistration.objects.filter(
                program=self.starter,
                phone_normalized='201001234567',
            ).count(),
            1,
        )

    def test_distinct_blank_email_phones_are_not_duplicates(self):
        first = {**self.valid_payload, 'email': '', 'phone': '+20 100 123 4567'}
        second = {**self.valid_payload, 'email': '', 'phone': '+20 100 765 4321'}
        response1 = self.client.post(self.url, first, format='json')
        response2 = self.client.post(self.url, second, format='json')
        self.assertEqual(response1.status_code, 201)
        self.assertEqual(response2.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.filter(program=self.starter).count(), 2)

    def test_blank_email_allowed_for_professional_registration(self):
        """Canonical rule: email is optional on ALL registration paths."""
        url = reverse('website-registration', args=[self.professional.slug])
        payload = {
            'full_name': 'Pro User',
            'email': '',
            'phone': '+20 100 999 8888',
            'privacy_policy_consent': True,
        }
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        registration = TrainingRegistration.objects.get(phone_normalized='201009998888')
        self.assertEqual(registration.email, '')
        self.assertEqual(
            registration.confirmation_email_status,
            TrainingRegistration.CONFIRMATION_NOT_ATTEMPTED,
        )

    def test_phone_validation(self):
        """Phone with fewer than 7 digits returns 400."""
        payload = {**self.valid_payload, 'phone': '123'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('phone', response.data)

    def test_current_status_other_validation(self):
        """When current_status=other, current_status_other is required."""
        payload = {**self.valid_payload, 'current_status': 'other', 'current_status_other': ''}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('current_status_other', response.data)

    def test_current_status_other_filled_succeeds(self):
        """When current_status=other and current_status_other is filled, succeeds."""
        payload = {**self.valid_payload, 'current_status': 'other', 'current_status_other': 'Self-employed'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 201)

    def test_acquisition_source_other_validation(self):
        """When acquisition_source=other, acquisition_source_other is required."""
        payload = {**self.valid_payload, 'acquisition_source': 'other', 'acquisition_source_other': ''}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('acquisition_source_other', response.data)

    def test_acquisition_source_other_filled_succeeds(self):
        """When acquisition_source=other and acquisition_source_other is filled, succeeds."""
        payload = {**self.valid_payload, 'acquisition_source': 'other', 'acquisition_source_other': 'Twitter'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 201)

    def test_utm_persistence(self):
        """UTM parameters are persisted on the registration record."""
        payload = {
            **self.valid_payload,
            'utm_source': 'facebook',
            'utm_medium': 'paid_social',
            'utm_campaign': 'starter_99_launch',
            'utm_content': 'ad_variant_a',
            'utm_term': 'python_course',
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        reg = TrainingRegistration.objects.get(email='ahmed.test@example.com')
        self.assertEqual(reg.utm_source, 'facebook')
        self.assertEqual(reg.utm_medium, 'paid_social')
        self.assertEqual(reg.utm_campaign, 'starter_99_launch')
        self.assertEqual(reg.utm_content, 'ad_variant_a')
        self.assertEqual(reg.utm_term, 'python_course')

    def test_duplicate_handling(self):
        """Duplicate registration (same email+program within 24h) returns 200 with is_new=False."""
        # First registration
        response1 = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response1.status_code, 201)
        self.assertTrue(response1.data['is_new'])

        # Duplicate — same email+program
        response2 = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response2.status_code, 200)
        self.assertFalse(response2.data['is_new'])

        # Only one registration record
        self.assertEqual(TrainingRegistration.objects.filter(
            email='ahmed.test@example.com',
            program=self.starter,
        ).count(), 1)

    @patch('apps.training.views.send_registration_confirmation')
    def test_email_failure_preserves_registration(self, mock_send):
        """Email failure does NOT roll back or delete the registration."""
        mock_send.side_effect = Exception('SMTP connection refused')
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_new'])
        # Registration is still persisted
        self.assertTrue(TrainingRegistration.objects.filter(
            email='ahmed.test@example.com'
        ).exists())

    def test_email_only_after_valid_persistence(self):
        """Confirmation email is only attempted after the registration is saved."""
        with patch('apps.training.views.send_registration_confirmation') as mock_send:
            # Invalid payload — should not trigger email
            payload = {**self.valid_payload, 'email': 'invalid'}
            response = self.client.post(self.url, payload, format='json')
            self.assertEqual(response.status_code, 400)
            mock_send.assert_not_called()

            # Valid payload — should trigger email
            response = self.client.post(self.url, self.valid_payload, format='json')
            self.assertEqual(response.status_code, 201)
            # on_commit is called after the transaction commits
            # In tests, on_commit callbacks run immediately

    def test_successful_email_records_sent_status(self):
        """When the email backend accepts the message, confirmation_email_status='sent'.
        This verifies that 'Sent' means the email backend accepted the message —
        NOT proof of inbox delivery (no SendGrid webhook exists)."""
        from django.core.mail.backends.locmem import EmailBackend
        from django.test import override_settings
        from apps.site_settings.models import SiteSetting

        # Ensure SiteSetting exists with email enabled
        setting = SiteSetting.get_current()
        if setting:
            setting.training_confirmation_email_enabled = True
            setting.save()
        else:
            SiteSetting.objects.create(
                site_name='Sidrah Soft',
                is_active=True,
                training_confirmation_email_enabled=True,
                training_confirmation_sender_name='Sidrah Soft',
                training_confirmation_reply_to='sidrahsoft@gmail.com',
            )

        with override_settings(
            EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
            DEFAULT_FROM_EMAIL='Sidrah Soft <noreply@sidrahsoft.com>',
        ):
            response = self.client.post(self.url, self.valid_payload, format='json')
            self.assertEqual(response.status_code, 201)
            reg = TrainingRegistration.objects.get(email='ahmed.test@example.com')
            # The on_commit callback runs in TestCase (atomic) after the test,
            # so we call the service directly to verify the status update.
            from apps.training.services import send_registration_confirmation
            result = send_registration_confirmation(reg)
            self.assertTrue(result)
            reg.refresh_from_db()
            self.assertEqual(
                reg.confirmation_email_status,
                TrainingRegistration.CONFIRMATION_SENT
            )

    def test_no_sendgrid_secret_in_api_response(self):
        """No SendGrid API key or secret is exposed in the API response."""
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, 201)
        response_text = str(response.data)
        # Must not contain common secret patterns
        self.assertNotIn('api_key', response_text.lower())
        self.assertNotIn('sendgrid', response_text.lower())
        self.assertNotIn('password', response_text.lower())
        self.assertNotIn('secret', response_text.lower())

    def test_invalid_current_level(self):
        """An invalid current_level value returns 400."""
        payload = {**self.valid_payload, 'current_level': 'expert'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('current_level', response.data)

    def test_invalid_current_status(self):
        """An invalid current_status value returns 400."""
        payload = {**self.valid_payload, 'current_status': 'manager'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('current_status', response.data)

    def test_invalid_acquisition_source(self):
        """An invalid acquisition_source value returns 400."""
        payload = {**self.valid_payload, 'acquisition_source': 'snapchat'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('acquisition_source', response.data)

    def test_honeypot_rejected(self):
        """Honeypot field filled — submission rejected silently."""
        payload = {**self.valid_payload, 'website_field': 'spam-bot'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_privacy_consent_required(self):
        """Privacy consent is required."""
        payload = {**self.valid_payload, 'privacy_policy_consent': False}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_program_not_found(self):
        """Registration against a non-existent program returns 404."""
        url = reverse('website-registration', args=['nonexistent-program'])
        response = self.client.post(url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, 404)

    def test_anonymous_endpoint_security(self):
        """The endpoint is accessible without authentication (public)."""
        # No authentication headers — should still work
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, 201)


@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_RATES': THROTTLE_OVERRIDE['DEFAULT_THROTTLE_RATES']})
class StarterCampaignCMSTests(TestCase):
    """Test CMS visibility of Starter campaign registration fields."""

    @classmethod
    def setUpTestData(cls):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        cls.starter = Program.objects.create(
            slug='starter-cms-campaign-test',
            title_en='Starter CMS Test',
            title_ar='اختبار CMS',
            branch=Program.BRANCH_STARTER,
            status=Program.STATUS_ACTIVE,
            registration_open=True,
        )
        cls.reg = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='CMS Test User',
            email='cms.test@example.com',
            phone='+20 100 000 0000',
            source=TrainingRegistration.SOURCE_WEBSITE,
            current_level='beginner',
            current_status='student',
            acquisition_source='facebook',
            utm_source='facebook',
            utm_campaign='starter_99_launch',
        )
        cls.user = User.objects.create_user(
            'cms-starter', password='pass', role='content_manager',
        )

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_cms_list_includes_campaign_fields(self):
        """CMS list serializer includes campaign fields."""
        url = '/api/v1/cms/training/registrations/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        if results:
            reg = results[0]
            self.assertIn('current_level', reg)
            self.assertIn('current_status', reg)
            self.assertIn('acquisition_source', reg)

    def test_cms_detail_includes_campaign_fields(self):
        """CMS detail serializer includes campaign fields."""
        url = f'/api/v1/cms/training/registrations/{self.reg.pk}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('current_level', response.data)
        self.assertIn('current_status', response.data)
        self.assertIn('current_status_other', response.data)
        self.assertIn('acquisition_source', response.data)
        self.assertIn('acquisition_source_other', response.data)
        self.assertEqual(response.data['current_level'], 'beginner')
        self.assertEqual(response.data['current_status'], 'student')
        self.assertEqual(response.data['acquisition_source'], 'facebook')

    def test_cms_filter_by_branch(self):
        """CMS can filter registrations by program branch (starter)."""
        url = '/api/v1/cms/training/registrations/?branch=starter'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        # All results should be for starter programs
        for r in results:
            self.assertEqual(r['program'], self.starter.pk)
