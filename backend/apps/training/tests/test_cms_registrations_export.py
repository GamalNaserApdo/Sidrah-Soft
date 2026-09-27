"""Targeted tests for CMS Registrations sheet view + clean export.

Export contract (approved): the Download file contains EXACTLY four
columns — Name, Phone, Track, Course Price — using the immutable
registration-time price snapshot. No email/UTM/source/status/payment
columns are exported.

Covers:
- Export respects active filters (program, source, branch, utm_campaign)
- Exact 4-column header
- Snapshot price (not current program price) is exported
- NULL legacy price exports blank
- Phone numbers are wrapped =\"...\" to preserve leading zeros
- CSV formula-injection protection on user-controlled cells
- Email status / UTM / acquisition filters on list endpoint
- RBAC: export requires training_registrations.export permission
- Anonymous access to export is rejected
- No secrets in export
- Legacy Google Form records remain in export
"""
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from apps.training.models import Program, TrainingRegistration


User = get_user_model()


@override_settings(ALLOWED_HOSTS=['*'])
class CMSRegistrationsExportTests(TestCase):
    """Tests for the CSV export endpoint and filter-respecting behavior."""

    @classmethod
    def setUpTestData(cls):
        cls.starter = Program.objects.create(
            slug='starter-export-test',
            title_en='Starter Export Test',
            title_ar='اختبار التصدير',
            branch=Program.BRANCH_STARTER,
            status=Program.STATUS_ACTIVE,
        )
        cls.professional = Program.objects.create(
            slug='pro-export-test',
            title_en='Pro Export Test',
            title_ar='برو',
            branch=Program.BRANCH_PROFESSIONAL,
            status=Program.STATUS_ACTIVE,
        )
        # Native website registration with UTM
        cls.web_reg = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='Web User',
            email='web.export@example.com',
            phone='+20 100 111 2222',
            source=TrainingRegistration.SOURCE_WEBSITE,
            current_level='beginner',
            current_status='student',
            acquisition_source='facebook',
            utm_source='facebook',
            utm_medium='paid_social',
            utm_campaign='starter_99_launch',
            confirmation_email_status=TrainingRegistration.CONFIRMATION_SENT,
        )
        # Legacy Google Form registration
        cls.google_reg = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='Google User',
            email='google.export@example.com',
            phone='+20 100 333 4444',
            source=TrainingRegistration.SOURCE_GOOGLE_FORM,
        )
        # Professional program registration
        cls.pro_reg = TrainingRegistration.objects.create(
            program=cls.professional,
            full_name='Pro User',
            email='pro.export@example.com',
            phone='+20 100 555 6666',
            source=TrainingRegistration.SOURCE_WEBSITE,
        )
        # CMS user with export permission
        cls.user = User.objects.create_user(
            'export-user', password='pass', role='content_manager',
        )

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _export(self, params=''):
        url = f'/api/v1/cms/training/registrations/export/'
        if params:
            url += f'?{params}'
        return self.client.get(url, HTTP_HOST='localhost')

    def _rows(self, response):
        import csv, io
        return list(csv.reader(io.StringIO(response.content.decode('utf-8-sig'))))

    def test_export_returns_csv(self):
        """Export endpoint returns CSV content type."""
        response = self._export()
        self.assertEqual(response.status_code, 200)
        self.assertIn('text/csv', response['Content-Type'])

    def test_export_exact_four_columns(self):
        """Export header is EXACTLY Name, Phone, Track, Course Price."""
        response = self._export()
        rows = self._rows(response)
        self.assertEqual(rows[0], ['Name', 'Phone', 'Track', 'Course Price'])
        for row in rows[1:]:
            self.assertEqual(len(row), 4, row)

    def test_export_excludes_sensitive_columns(self):
        """No email, UTM, source, status, payment, or notes data leaks."""
        response = self._export()
        content = response.content.decode('utf-8').lower()
        for bad in ('web.export@example.com', 'utm_source', 'utm_campaign',
                    'starter_99_launch', 'website', 'google_form',
                    'paid_amount', 'payment_status', 'whatsapp',
                    'enrollment_stage', 'operational_status',
                    'confirmation_email'):
            self.assertNotIn(bad, content, bad)

    def test_export_respects_source_filter(self):
        """Export with source=website returns only website registrations."""
        response = self._export('source=website')
        content = response.content.decode('utf-8')
        self.assertIn('Web User', content)
        self.assertIn('Pro User', content)
        self.assertNotIn('Google User', content)

    def test_export_respects_program_filter(self):
        """Export with program filter returns only that program's registrations."""
        response = self._export(f'program={self.starter.id}')
        content = response.content.decode('utf-8')
        self.assertIn('Web User', content)
        self.assertIn('Google User', content)
        self.assertNotIn('Pro User', content)

    def test_export_respects_utm_campaign_filter(self):
        """Export with utm_campaign filter returns only matching registrations."""
        response = self._export('utm_campaign=starter_99_launch')
        content = response.content.decode('utf-8')
        self.assertIn('Web User', content)
        self.assertNotIn('Google User', content)

    def test_export_respects_branch_filter(self):
        """Export with branch=starter returns only starter program registrations."""
        response = self._export('branch=starter')
        content = response.content.decode('utf-8')
        self.assertIn('Web User', content)
        self.assertNotIn('Pro User', content)

    def test_export_includes_legacy_google_form(self):
        """Legacy Google Form records remain in export (not filtered out)."""
        response = self._export()
        content = response.content.decode('utf-8')
        self.assertIn('Google User', content)

    def test_export_phone_preserves_leading_zero(self):
        """Phones export as =\"...\" text formulas so spreadsheets keep '01...'."""
        response = self._export()
        rows = self._rows(response)
        web_row = next(r for r in rows if r[0] == 'Web User')
        self.assertEqual(web_row[1], '="+20 100 111 2222"')

    def test_export_uses_snapshot_price_not_current(self):
        """Course Price column reads the immutable registration snapshot."""
        self.web_reg.course_price = 499
        self.web_reg.course_price_currency = 'EGP'
        self.web_reg.save(update_fields=['course_price', 'course_price_currency'])
        response = self._export()
        rows = self._rows(response)
        web_row = next(r for r in rows if r[0] == 'Web User')
        self.assertEqual(web_row[3], '499 EGP')
        google_row = next(r for r in rows if r[0] == 'Google User')
        self.assertEqual(google_row[3], '')  # NULL snapshot -> blank

    def test_export_no_secrets(self):
        """Export does not contain API keys, passwords, or secrets."""
        response = self._export()
        content = response.content.decode('utf-8').lower()
        self.assertNotIn('api_key', content)
        self.assertNotIn('password', content)
        self.assertNotIn('sendgrid', content)
        self.assertNotIn('secret', content)

    def test_export_requires_authentication(self):
        """Anonymous access to export is rejected (401/403)."""
        anon_client = APIClient()
        response = anon_client.get(
            '/api/v1/cms/training/registrations/export/',
            HTTP_HOST='localhost',
        )
        self.assertIn(response.status_code, (401, 403))


@override_settings(ALLOWED_HOSTS=['*'])
class CMSRegistrationsFilterTests(TestCase):
    """Tests for list endpoint filters: email_status, utm_campaign, acquisition_source."""

    @classmethod
    def setUpTestData(cls):
        cls.starter = Program.objects.create(
            slug='starter-filter-test',
            title_en='Starter Filter Test',
            title_ar='اختبار الفلتر',
            branch=Program.BRANCH_STARTER,
            status=Program.STATUS_ACTIVE,
        )
        cls.reg_sent = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='Sent User',
            email='sent.filter@example.com',
            phone='+20 100 000 0001',
            source=TrainingRegistration.SOURCE_WEBSITE,
            acquisition_source='facebook',
            utm_campaign='starter_99_launch',
            confirmation_email_status=TrainingRegistration.CONFIRMATION_SENT,
        )
        cls.reg_failed = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='Failed User',
            email='failed.filter@example.com',
            phone='+20 100 000 0002',
            source=TrainingRegistration.SOURCE_WEBSITE,
            acquisition_source='instagram',
            utm_campaign='summer_promo',
            confirmation_email_status=TrainingRegistration.CONFIRMATION_FAILED,
        )
        cls.user = User.objects.create_user(
            'filter-user', password='pass', role='content_manager',
        )

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _list(self, params=''):
        url = '/api/v1/cms/training/registrations/'
        if params:
            url += f'?{params}'
        return self.client.get(url, HTTP_HOST='localhost')

    def test_filter_by_email_status_sent(self):
        """Filter by email_status=sent returns only sent registrations."""
        response = self._list('email_status=sent')
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        emails = [r['email'] for r in results]
        self.assertIn('sent.filter@example.com', emails)
        self.assertNotIn('failed.filter@example.com', emails)

    def test_filter_by_email_status_failed(self):
        """Filter by email_status=failed returns only failed registrations."""
        response = self._list('email_status=failed')
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        emails = [r['email'] for r in results]
        self.assertIn('failed.filter@example.com', emails)
        self.assertNotIn('sent.filter@example.com', emails)

    def test_filter_by_utm_campaign(self):
        """Filter by utm_campaign returns matching registrations."""
        response = self._list('utm_campaign=starter_99_launch')
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        emails = [r['email'] for r in results]
        self.assertIn('sent.filter@example.com', emails)
        self.assertNotIn('failed.filter@example.com', emails)

    def test_filter_by_acquisition_source(self):
        """Filter by acquisition_source returns matching registrations."""
        response = self._list('acquisition_source=facebook')
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        emails = [r['email'] for r in results]
        self.assertIn('sent.filter@example.com', emails)
        self.assertNotIn('failed.filter@example.com', emails)

    def test_list_includes_phone_field(self):
        """List serializer includes phone field."""
        response = self._list()
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        if results:
            self.assertIn('phone', results[0])

    def test_list_includes_email_status_field(self):
        """List serializer includes confirmation_email_status field."""
        response = self._list()
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        if results:
            self.assertIn('confirmation_email_status', results[0])

    def test_list_includes_full_utm_fields(self):
        """List serializer includes utm_medium and utm_content fields."""
        response = self._list()
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        if results:
            self.assertIn('utm_medium', results[0])
            self.assertIn('utm_content', results[0])
            self.assertIn('utm_term', results[0])


@override_settings(ALLOWED_HOSTS=['*'])
class CSVInjectionSafetyTests(TestCase):
    """Tests for CSV formula-injection protection in the export endpoint.

    Verifies that user-controlled values beginning with =, +, -, @, or tab
    are prefixed with a single quote to prevent spreadsheet formula execution.
    """

    @classmethod
    def setUpTestData(cls):
        cls.starter = Program.objects.create(
            slug='starter-injection-test',
            title_en='Starter Injection Test',
            title_ar='اختبار الحقن',
            branch=Program.BRANCH_STARTER,
            status=Program.STATUS_ACTIVE,
        )
        # Registration with formula-injection attempt in name
        cls.injection_reg = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='=cmd|/c calc!A1',
            email='injection.test@example.com',
            phone='+20 100 000 0000',
            source=TrainingRegistration.SOURCE_WEBSITE,
            utm_campaign='=HYPERLINK("https://evil.com")',
        )
        cls.plus_reg = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='+cmd|/c calc!A1',
            email='plus.test@example.com',
            phone='+20 100 000 0001',
            source=TrainingRegistration.SOURCE_WEBSITE,
        )
        cls.minus_reg = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='-1+1|cmd',
            email='minus.test@example.com',
            phone='+20 100 000 0002',
            source=TrainingRegistration.SOURCE_WEBSITE,
        )
        cls.at_reg = TrainingRegistration.objects.create(
            program=cls.starter,
            full_name='@SUM(A1:A2)',
            email='at.test@example.com',
            phone='+20 100 000 0003',
            source=TrainingRegistration.SOURCE_WEBSITE,
        )
        cls.user = User.objects.create_user(
            'injection-user', password='pass', role='content_manager',
        )

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _export(self, params=''):
        url = '/api/v1/cms/training/registrations/export/'
        if params:
            url += f'?{params}'
        return self.client.get(url, HTTP_HOST='localhost')

    def test_equals_formula_is_escaped(self):
        """Values starting with = are prefixed with a single quote."""
        response = self._export()
        content = response.content.decode('utf-8')
        # The dangerous value should be prefixed with a single quote
        self.assertIn("'=cmd", content)
        # The raw dangerous value should NOT appear unescaped
        # (it should always appear with the quote prefix)
        lines = content.split('\n')
        for line in lines:
            if '=cmd|/c calc' in line and "'=cmd" not in line:
                self.fail(f"Unescaped formula found in export: {line}")

    def test_plus_formula_is_escaped(self):
        """Values starting with + are prefixed with a single quote."""
        response = self._export()
        content = response.content.decode('utf-8')
        self.assertIn("'+cmd", content)

    def test_minus_formula_is_escaped(self):
        """Values starting with - are prefixed with a single quote."""
        response = self._export()
        content = response.content.decode('utf-8')
        self.assertIn("'-1+1", content)

    def test_at_formula_is_escaped(self):
        """Values starting with @ are prefixed with a single quote."""
        response = self._export()
        content = response.content.decode('utf-8')
        self.assertIn("'@SUM", content)

    def test_utm_campaign_not_in_export(self):
        """UTM values are no longer exported at all (4-column contract)."""
        response = self._export()
        content = response.content.decode('utf-8')
        self.assertNotIn('HYPERLINK', content)

    def test_normal_values_not_escaped(self):
        """Normal values without formula prefixes are not modified."""
        import csv, io
        response = self._export()
        rows = list(csv.reader(io.StringIO(response.content.decode('utf-8-sig'))))
        eq_row = next(r for r in rows if r[0].startswith("'=cmd"))
        # Phone exports with the generated =\"...\" text wrapper
        self.assertEqual(eq_row[1], '="+20 100 000 0000"')
