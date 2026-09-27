"""Course price snapshot tests.

Covers:
- Website/Google/CMS creation snapshots ProgramLanding.current_price
- Snapshot survives later price changes and normal updates
- Browser-supplied price cannot override the server snapshot
- Legacy NULL snapshot renders safely (list/export blank)
- Four-state workflow unaffected
"""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.training.models import Program, ProgramLanding, TrainingRegistration

User = get_user_model()


def _program_with_price(slug, price='499.00', currency='EGP'):
    program = Program.objects.create(
        slug=slug, title_en=slug.title(), status=Program.STATUS_ACTIVE,
        registration_open=True, external_form_key=f'{slug}-key',
    )
    ProgramLanding.objects.create(
        program=program, current_price=Decimal(price), currency=currency,
    )
    return program


@override_settings(ALLOWED_HOSTS=['*'])
class PriceSnapshotCreationTests(TestCase):
    def setUp(self):
        self.program = _program_with_price('price-snap-starter')

    def test_website_registration_snapshots_price(self):
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Web Reg', phone='01011112222',
            source=TrainingRegistration.SOURCE_WEBSITE,
        )
        self.assertEqual(reg.course_price, Decimal('499.00'))
        self.assertEqual(reg.course_price_currency, 'EGP')

    def test_google_form_registration_snapshots_price(self):
        from apps.training.serializers import GoogleFormRegistrationSerializer
        ser = GoogleFormRegistrationSerializer(data={
            'form_key': 'price-snap-starter-key',
            'external_submission_id': 'snap-g1',
            'full_name': 'Google Reg', 'phone': '01033334444',
        })
        self.assertTrue(ser.is_valid(), ser.errors)
        reg = ser.save()
        self.assertEqual(reg.course_price, Decimal('499.00'))
        self.assertEqual(reg.course_price_currency, 'EGP')

    def test_cms_created_registration_snapshots_price(self):
        from apps.training.cms_serializers import CMSTrainingRegistrationWriteSerializer
        ser = CMSTrainingRegistrationWriteSerializer(data={
            'program': self.program.pk, 'full_name': 'CMS Reg',
            'phone': '01055556666',
        })
        self.assertTrue(ser.is_valid(), ser.errors)
        reg = ser.save()
        self.assertEqual(reg.course_price, Decimal('499.00'))
        self.assertEqual(reg.course_price_currency, 'EGP')

    def test_program_without_landing_leaves_null(self):
        bare = Program.objects.create(
            slug='price-snap-bare', title_en='Bare', status=Program.STATUS_ACTIVE,
        )
        reg = TrainingRegistration.objects.create(
            program=bare, full_name='No Landing', phone='01077778888',
        )
        self.assertIsNone(reg.course_price)
        self.assertEqual(reg.course_price_currency, '')


class PriceSnapshotImmutabilityTests(TestCase):
    def setUp(self):
        self.program = _program_with_price('price-snap-immutable')

    def test_price_change_does_not_rewrite_snapshot(self):
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Early Reg', phone='01099990000',
        )
        landing = self.program.landing
        landing.current_price = Decimal('699.00')
        landing.save()
        reg.refresh_from_db()
        self.assertEqual(reg.course_price, Decimal('499.00'))

        new_reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Late Reg', phone='01099990001',
        )
        self.assertEqual(new_reg.course_price, Decimal('699.00'))

    def test_normal_update_does_not_overwrite_snapshot(self):
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Update Reg', phone='01099990002',
        )
        self.program.landing.current_price = Decimal('999.00')
        self.program.landing.save()
        reg.internal_notes = 'staff note'
        reg.save()
        reg.refresh_from_db()
        self.assertEqual(reg.course_price, Decimal('499.00'))

    def test_program_change_preserves_snapshot(self):
        other = _program_with_price('price-snap-other', price='1200.00')
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Move Reg', phone='01099990003',
        )
        reg.program = other
        reg.save()
        reg.refresh_from_db()
        self.assertEqual(reg.course_price, Decimal('499.00'))


@override_settings(ALLOWED_HOSTS=['*'])
class PriceSnapshotApiTests(TestCase):
    def setUp(self):
        self.program = _program_with_price('price-snap-api')
        self.admin = User.objects.create_user('price-admin', password='pass', role='admin')
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_browser_cannot_submit_price(self):
        r = self.client.post(
            f'/api/v1/training/programs/{self.program.slug}/register/',
            {'full_name': 'Browser Reg', 'phone': '01044445555',
             'privacy_policy_consent': True,
             'course_price': '0.01', 'course_price_currency': 'USD'},
            format='json', HTTP_HOST='localhost',
        )
        self.assertIn(r.status_code, (200, 201))
        reg = TrainingRegistration.objects.get(phone_normalized='01044445555')
        self.assertEqual(reg.course_price, Decimal('499.00'))
        self.assertEqual(reg.course_price_currency, 'EGP')

    def test_cms_patch_cannot_write_snapshot(self):
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Patch Reg', phone='01044446666',
        )
        r = self.client.patch(
            f'/api/v1/cms/training/registrations/{reg.id}/',
            {'course_price': '1.00', 'course_price_currency': 'USD'},
            format='json', HTTP_HOST='localhost',
        )
        self.assertEqual(r.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.course_price, Decimal('499.00'))
        self.assertEqual(reg.course_price_currency, 'EGP')

    def test_list_exposes_snapshot_null_safe(self):
        bare = Program.objects.create(
            slug='price-snap-null', title_en='Null', status=Program.STATUS_ACTIVE,
        )
        TrainingRegistration.objects.create(
            program=bare, full_name='Null Price', phone='01044447777',
        )
        r = self.client.get(
            '/api/v1/cms/training/registrations/?search=01044447777',
            HTTP_HOST='localhost',
        )
        self.assertEqual(r.status_code, 200)
        row = r.data['results'][0]
        self.assertIsNone(row['course_price'])
        self.assertEqual(row['course_price_currency'], '')

    def test_operational_workflow_unaffected(self):
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Ops Reg', phone='01044448888',
        )
        r = self.client.post(
            f'/api/v1/cms/training/registrations/{reg.id}/operational-status/',
            {'status': 'contacted'}, format='json', HTTP_HOST='localhost',
        )
        self.assertEqual(r.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.operational_status, 'contacted')
        self.assertEqual(reg.course_price, Decimal('499.00'))
