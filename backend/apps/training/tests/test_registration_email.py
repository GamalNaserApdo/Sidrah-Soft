"""Tests for training registration confirmation email integration.

Covers:
- New registration triggers confirmation email
- Email attempted only after DB commit (transaction.on_commit)
- Email success → status SENT
- Email failure → status FAILED, registration remains persisted
- Duplicate registration → no second email
- Validation failure → no email
- CMS disabled setting → no email
- Arabic language → Arabic template
- English language → English template
- HTML + plain text alternatives
- Sender identity + Reply-To
- Secret never serialized
- CMS settings RBAC + validation
- Latency simulation
"""
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock

from apps.site_settings.models import SiteSetting
from apps.training.models import Program, ProgramLanding, TrainingRegistration


# Use locmem email backend for tests — never sends real email.
TEST_EMAIL_SETTINGS = {
    'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend',
    'DEFAULT_FROM_EMAIL': 'Sidrah Soft <noreply@sidrahsoft.com>',
}

# Disable rate limiting for registration tests (the shared suite fires many
# registration POSTs in one process and would otherwise trip the 5/m throttle).
THROTTLE_OVERRIDE = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'website_registration': '1000/m',
        'certificate_verify': '1000/m',
    },
}


def _create_program(**overrides):
    defaults = {
        'title_en': 'Python for Beginners',
        'title_ar': 'بايثون للمبتدئين',
        'slug': 'python-for-beginners',
        'branch': 'professional',
        'status': 'active',
        'registration_open': True,
    }
    defaults.update(overrides)
    return Program.objects.create(**defaults)


def _ensure_site_setting():
    """Ensure an active SiteSetting exists with confirmation email enabled."""
    setting = SiteSetting.get_current()
    if not setting:
        setting = SiteSetting.objects.create(
            site_name='Sidrah Soft',
            is_active=True,
            training_confirmation_email_enabled=True,
            training_confirmation_sender_name='Sidrah Soft',
            training_confirmation_reply_to='sidrahsoft@gmail.com',
        )
    else:
        setting.training_confirmation_email_enabled = True
        setting.training_confirmation_sender_name = 'Sidrah Soft'
        setting.training_confirmation_reply_to = 'sidrahsoft@gmail.com'
        setting.save()
    return setting


@override_settings(**TEST_EMAIL_SETTINGS)
@override_settings(REST_FRAMEWORK={
    'DEFAULT_THROTTLE_RATES': THROTTLE_OVERRIDE['DEFAULT_THROTTLE_RATES'],
})
class RegistrationConfirmationEmailTests(TestCase):
    """End-to-end tests for the confirmation email flow."""

    def setUp(self):
        cache.clear()
        self.program = _create_program()
        ProgramLanding.objects.create(program=self.program, show_registration_form=True)
        self.setting = _ensure_site_setting()
        self.client = APIClient()
        self.url = f'/api/v1/training/programs/{self.program.slug}/register/'
        self.payload = {
            'full_name': 'Jane Doe',
            'email': 'jane@example.com',
            'phone': '+201234567890',
            'privacy_policy_consent': True,
            'preferred_language': 'en',
        }
        mail.outbox = []

    def tearDown(self):
        cache.clear()

    def _post(self, **overrides):
        payload = {**self.payload, **overrides}
        # TestCase wraps tests in a transaction, so transaction.on_commit()
        # callbacks never fire. captureOnCommitCallbacks executes them immediately.
        with self.captureOnCommitCallbacks(execute=True):
            return self.client.post(self.url, payload, format='json')

    # --- New registration ---

    def test_new_registration_sends_confirmation_email(self):
        """A new registration triggers exactly one confirmation email."""
        response = self._post()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_new'])
        # transaction.on_commit fires synchronously in TestCase.
        self.assertEqual(len(mail.outbox), 1)

        email = mail.outbox[0]
        self.assertEqual(email.to, ['jane@example.com'])
        self.assertIn('noreply@sidrahsoft.com', email.from_email)
        self.assertIn('Sidrah Soft', email.from_email)

    def test_confirmation_email_has_html_and_text_alternatives(self):
        """Email includes both HTML and plain-text alternatives."""
        self._post()
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        # EmailMultiAlternatives stores alternatives.
        self.assertTrue(hasattr(email, 'alternatives'))
        content_types = [alt[1] for alt in email.alternatives]
        self.assertIn('text/html', content_types)
        # Plain text is the body.
        self.assertTrue(email.body)

    def test_confirmation_email_has_reply_to(self):
        """Reply-To is set from CMS-managed field."""
        self._post()
        email = mail.outbox[0]
        self.assertEqual(email.reply_to, ['sidrahsoft@gmail.com'])

    def test_confirmation_email_contains_applicant_name(self):
        """Email body contains the applicant's name."""
        self._post()
        email = mail.outbox[0]
        self.assertIn('Jane Doe', email.body)

    def test_confirmation_email_contains_program_name(self):
        """Email body contains the program name."""
        self._post()
        email = mail.outbox[0]
        self.assertIn('Python for Beginners', email.body)

    # --- Delivery state ---

    def test_delivery_status_sent_on_success(self):
        """After successful email, status is SENT and timestamps recorded."""
        self._post()
        reg = TrainingRegistration.objects.get(email='jane@example.com')
        self.assertEqual(reg.confirmation_email_status, TrainingRegistration.CONFIRMATION_SENT)
        self.assertIsNotNone(reg.confirmation_email_attempted_at)
        self.assertIsNotNone(reg.confirmation_email_sent_at)
        self.assertEqual(reg.confirmation_email_error_summary, '')

    def test_delivery_status_starts_not_attempted_for_existing_records(self):
        """Existing registrations (pre-email feature) default to NOT_ATTEMPTED."""
        reg = TrainingRegistration.objects.create(
            program=self.program,
            full_name='Legacy User',
            email='legacy@example.com',
            phone='+201000000000',
            source=TrainingRegistration.SOURCE_CMS_MANUAL,
        )
        self.assertEqual(reg.confirmation_email_status, TrainingRegistration.CONFIRMATION_NOT_ATTEMPTED)

    # --- Failure isolation ---

    def test_email_failure_does_not_rollback_registration(self):
        """If email sending fails, the registration remains persisted and API returns 201."""
        with patch('django.core.mail.backends.locmem.EmailBackend.send_messages') as mock_send:
            mock_send.side_effect = Exception('SMTP connection refused')
            response = self._post()

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_new'])
        # Registration exists despite email failure.
        self.assertTrue(TrainingRegistration.objects.filter(email='jane@example.com').exists())

    def test_email_failure_records_failed_status(self):
        """Email failure sets status to FAILED with sanitized error summary."""
        with patch('django.core.mail.backends.locmem.EmailBackend.send_messages') as mock_send:
            mock_send.side_effect = Exception('SMTP connection refused')
            self._post()

        reg = TrainingRegistration.objects.get(email='jane@example.com')
        self.assertEqual(reg.confirmation_email_status, TrainingRegistration.CONFIRMATION_FAILED)
        self.assertIn('SMTP connection refused', reg.confirmation_email_error_summary)
        self.assertIsNotNone(reg.confirmation_email_attempted_at)
        self.assertIsNone(reg.confirmation_email_sent_at)

    def test_email_failure_error_summary_is_bounded(self):
        """Error summary is bounded to prevent log flooding."""
        long_error = 'x' * 1000
        with patch('django.core.mail.backends.locmem.EmailBackend.send_messages') as mock_send:
            mock_send.side_effect = Exception(long_error)
            self._post()

        reg = TrainingRegistration.objects.get(email='jane@example.com')
        self.assertLessEqual(len(reg.confirmation_email_error_summary), 503)  # 500 + '...'

    # --- Duplicate protection ---

    def test_duplicate_registration_does_not_send_second_email(self):
        """A duplicate registration (is_new=False) does not trigger another email."""
        self._post()
        self.assertEqual(len(mail.outbox), 1)

        # Second submission with same email within 24h.
        mail.outbox = []
        response2 = self._post()
        self.assertEqual(response2.status_code, 200)
        self.assertFalse(response2.data['is_new'])
        self.assertEqual(len(mail.outbox), 0)

    # --- Validation failure ---

    def test_validation_failure_sends_no_email(self):
        """A 400 validation failure does not create a registration or send email."""
        response = self._post(full_name='', email='invalid')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(TrainingRegistration.objects.filter(email='invalid').exists())

    def test_missing_privacy_consent_sends_no_email(self):
        """Missing privacy consent → 400, no email."""
        response = self._post(privacy_policy_consent=False)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(mail.outbox), 0)

    # --- CMS disabled ---

    def test_cms_disabled_prevents_email(self):
        """When CMS disables confirmation email, no email is sent but registration succeeds."""
        self.setting.training_confirmation_email_enabled = False
        self.setting.save()
        response = self._post()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_new'])
        self.assertEqual(len(mail.outbox), 0)

        reg = TrainingRegistration.objects.get(email='jane@example.com')
        self.assertEqual(reg.confirmation_email_status, TrainingRegistration.CONFIRMATION_NOT_ATTEMPTED)

    # --- Language ---

    def test_arabic_language_selects_arabic_template(self):
        """preferred_language='ar' selects Arabic subject and RTL HTML."""
        self._post(preferred_language='ar')
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('تأكيد', email.subject)
        # HTML alternative should have dir="rtl".
        html_content = [alt[0] for alt in email.alternatives if alt[1] == 'text/html'][0]
        self.assertIn('dir="rtl"', html_content)

    def test_english_language_selects_english_template(self):
        """preferred_language='en' selects English subject and LTR HTML."""
        self._post(preferred_language='en')
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('Sidrah Soft', email.subject)
        html_content = [alt[0] for alt in email.alternatives if alt[1] == 'text/html'][0]
        self.assertIn('dir="ltr"', html_content)

    def test_blank_language_defaults_to_english(self):
        """Blank preferred_language defaults to English."""
        self._post(preferred_language='')
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('Sidrah Soft', email.subject)

    # --- CMS content customization ---

    def test_cms_custom_subject_is_used(self):
        """CMS-managed subject overrides the default."""
        self.setting.training_confirmation_subject_en = 'Welcome to {{program_name}}!'
        self.setting.save()
        self._post()
        email = mail.outbox[0]
        self.assertEqual(email.subject, 'Welcome to Python for Beginners!')

    def test_cms_custom_message_with_placeholders(self):
        """CMS-managed message with placeholders is correctly substituted."""
        self.setting.training_confirmation_message_en = 'Hi {{applicant_name}}, you are in {{program_name}}.'
        self.setting.save()
        self._post()
        email = mail.outbox[0]
        self.assertIn('Hi Jane Doe, you are in Python for Beginners.', email.body)

    def test_cms_unsafe_cta_url_rejected(self):
        """CMS serializer rejects unsafe CTA URL schemes."""
        from apps.core.seo_validation import validate_safe_cta_url
        from rest_framework import serializers as drf_serializers

        with self.assertRaises(drf_serializers.ValidationError):
            validate_safe_cta_url('javascript:alert(1)')
        with self.assertRaises(drf_serializers.ValidationError):
            validate_safe_cta_url('data:text/html,<script>')
        with self.assertRaises(drf_serializers.ValidationError):
            validate_safe_cta_url('vbscript:msgbox')
        with self.assertRaises(drf_serializers.ValidationError):
            validate_safe_cta_url('file:///etc/passwd')

    def test_cms_safe_cta_url_accepted(self):
        """CMS serializer accepts safe CTA URLs."""
        from apps.core.seo_validation import validate_safe_cta_url
        self.assertEqual(validate_safe_cta_url('/training'), '/training')
        self.assertEqual(validate_safe_cta_url('https://sidrahsoft.com/training'), 'https://sidrahsoft.com/training')
        self.assertEqual(validate_safe_cta_url(''), '')

    # --- Secret exposure ---

    def test_api_response_does_not_expose_email_secrets(self):
        """Registration API response contains no SMTP/email secrets."""
        response = self._post()
        data = response.data
        for key, value in data.items():
            if isinstance(value, str):
                self.assertNotIn('SENDGRID', value.upper())
                self.assertNotIn('API_KEY', value.upper())
                self.assertNotIn('PASSWORD', value.upper())
                self.assertNotIn('EMAIL_HOST_PASSWORD', value.upper())

    def test_cms_registration_detail_does_not_expose_secrets(self):
        """CMS registration detail serializer has no SMTP/API key fields."""
        from apps.training.cms_serializers import CMSTrainingRegistrationDetailSerializer
        serializer = CMSTrainingRegistrationDetailSerializer()
        field_names = list(serializer.fields.keys())
        for name in field_names:
            lower = name.lower()
            self.assertNotIn('password', lower)
            self.assertNotIn('api_key', lower)
            self.assertNotIn('sendgrid', lower)
            self.assertNotIn('smtp', lower)
            self.assertNotIn('email_host', lower)

    # --- Transaction safety ---

    def test_email_not_attempted_before_commit(self):
        """Email is not attempted if the DB transaction rolls back.

        We simulate a rollback by patching serializer.save() to raise
        IntegrityError inside the atomic block. The on_commit callback
        should never fire because the transaction never commits.
        """
        from django.db import IntegrityError

        with patch('apps.training.serializers.WebsiteRegistrationSerializer.save') as mock_save:
            mock_save.side_effect = IntegrityError('simulated constraint violation')
            with patch('apps.training.services.send_registration_confirmation') as mock_email:
                response = self._post()

        self.assertEqual(response.status_code, 409)
        mock_email.assert_not_called()
        self.assertFalse(TrainingRegistration.objects.filter(email='jane@example.com').exists())

    # --- Latency ---

    def test_slow_email_does_not_change_api_status(self):
        """Even a slow email send (simulated) does not change the API response."""
        import time
        original_send = mail.backends.locmem.EmailBackend.send_messages

        def slow_send(self, messages):
            time.sleep(0.05)  # 50ms simulated latency
            return original_send(self, messages)

        with patch('django.core.mail.backends.locmem.EmailBackend.send_messages', slow_send):
            response = self._post()

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_new'])
        self.assertEqual(len(mail.outbox), 1)


@override_settings(**TEST_EMAIL_SETTINGS)
@override_settings(REST_FRAMEWORK={
    'DEFAULT_THROTTLE_RATES': THROTTLE_OVERRIDE['DEFAULT_THROTTLE_RATES'],
})
class CMSSiteSettingsEmailFieldsTests(TestCase):
    """Tests for CMS API access to the email settings fields."""

    def setUp(self):
        cache.clear()
        self.setting = _ensure_site_setting()
        from apps.accounts.models import User
        self.cms_user = User.objects.create_user(
            username='cms_editor', email='editor@example.com', password='pass123',
            role='admin',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.cms_user)

    def tearDown(self):
        cache.clear()

    def test_cms_settings_include_email_fields(self):
        """CMS GET site-settings returns the email configuration fields."""
        response = self.client.get('/api/v1/cms/site-settings/')
        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertIn('training_confirmation_email_enabled', data)
        self.assertIn('training_confirmation_sender_name', data)
        self.assertIn('training_confirmation_reply_to', data)
        self.assertIn('training_confirmation_subject_en', data)
        self.assertIn('training_confirmation_subject_ar', data)
        self.assertIn('training_confirmation_message_en', data)
        self.assertIn('training_confirmation_message_ar', data)
        self.assertIn('training_confirmation_cta_url', data)

    def test_cms_settings_update_email_fields(self):
        """CMS PUT can update email configuration fields."""
        response = self.client.put('/api/v1/cms/site-settings/', {
            'training_confirmation_email_enabled': False,
            'training_confirmation_sender_name': 'Sidrah Training',
            'training_confirmation_subject_en': 'Welcome!',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.setting.refresh_from_db()
        self.assertFalse(self.setting.training_confirmation_email_enabled)
        self.assertEqual(self.setting.training_confirmation_sender_name, 'Sidrah Training')
        self.assertEqual(self.setting.training_confirmation_subject_en, 'Welcome!')

    def test_cms_settings_reject_unsafe_cta_url(self):
        """CMS PUT rejects unsafe CTA URL."""
        response = self.client.put('/api/v1/cms/site-settings/', {
            'training_confirmation_cta_url': 'javascript:alert(1)',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_cms_settings_no_smtp_secrets_exposed(self):
        """CMS settings response contains no SMTP/API key fields."""
        response = self.client.get('/api/v1/cms/site-settings/')
        data = response.data
        for key in data.keys():
            lower = key.lower()
            self.assertNotIn('password', lower)
            self.assertNotIn('api_key', lower)
            self.assertNotIn('sendgrid', lower)
            self.assertNotIn('email_host', lower)
            self.assertNotIn('smtp', lower)

    def test_unauthenticated_cannot_access_cms_settings(self):
        """Anonymous users cannot access CMS settings."""
        self.client.logout()
        response = self.client.get('/api/v1/cms/site-settings/')
        self.assertIn(response.status_code, (401, 403))
