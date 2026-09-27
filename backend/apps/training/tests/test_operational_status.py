"""Four-state operational_status workflow tests.

Covers: field default, migration mapping semantics, transition endpoint
rules, last_contacted_at stamping, activity logging, stats/filter parity,
and non-interference with certificates/payment/legacy status.
"""

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.roles import has_permission
from apps.activity_logs.models import ActivityLog
from apps.training.models import Program, TrainingRegistration
from django.contrib.auth import get_user_model

User = get_user_model()

LIST_URL = '/api/v1/cms/training/registrations/'
STATS_URL = '/api/v1/cms/training/registrations/stats/'


def _op_url(pk):
    return f'/api/v1/cms/training/registrations/{pk}/operational-status/'


def _reg(program, **kwargs):
    kwargs.setdefault('full_name', 'Test Reg')
    kwargs.setdefault('email', 'test@example.com')
    kwargs.setdefault('status', TrainingRegistration.STATUS_NEW)
    return TrainingRegistration.objects.create(program=program, **kwargs)


class OperationalStatusModelTests(TestCase):
    def setUp(self):
        self.program = Program.objects.create(slug='ops-test-program', title_en='Ops Test', status='active')

    def test_new_registration_defaults_to_lead(self):
        reg = _reg(self.program)
        self.assertEqual(reg.operational_status, 'lead')

    def test_model_transition_validation(self):
        reg = _reg(self.program)
        with self.assertRaises(ValidationError):
            reg.apply_operational_transition('subscribed')  # lead -> subscribed disallowed
        old = reg.apply_operational_transition('contacted')
        self.assertEqual(old, 'lead')
        self.assertEqual(reg.operational_status, 'contacted')
        self.assertIsNotNone(reg.last_contacted_at)

    def test_contacted_to_lead_rejected(self):
        reg = _reg(self.program, operational_status='contacted')
        with self.assertRaises(ValidationError):
            reg.apply_operational_transition('lead')

    def test_cancelled_to_subscribed_rejected(self):
        reg = _reg(self.program, operational_status='cancelled')
        with self.assertRaises(ValidationError):
            reg.apply_operational_transition('subscribed')

    def test_same_status_rejected(self):
        reg = _reg(self.program, operational_status='contacted')
        with self.assertRaises(ValidationError):
            reg.apply_operational_transition('contacted')

    def test_invalid_status_value_rejected(self):
        reg = _reg(self.program)
        with self.assertRaises(ValidationError):
            reg.apply_operational_transition('paid')

    def test_subscribed_does_not_touch_payment(self):
        reg = _reg(self.program, operational_status='contacted',
                   payment_status='unpaid', whatsapp_group_added=False)
        reg.apply_operational_transition('subscribed')
        reg.refresh_from_db()
        self.assertEqual(reg.payment_status, 'unpaid')
        self.assertFalse(reg.whatsapp_group_added)

    def test_certificate_eligibility_unaffected(self):
        reg = _reg(self.program, operational_status='subscribed')
        self.assertFalse(reg.certificate_eligible)  # still gated on legacy status
        # Bypass the legacy state machine — we're checking the certificate
        # gate reads `status`, not `operational_status`.
        TrainingRegistration.objects.filter(pk=reg.pk).update(
            status=TrainingRegistration.STATUS_COMPLETED)
        reg.refresh_from_db()
        self.assertTrue(reg.certificate_eligible)


class OperationalStatusTransitionEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user('ops-admin', password='pass', role='admin')
        self.client.force_authenticate(self.admin)
        self.program = Program.objects.create(slug='ops-endpoint-program', title_en='Ops Endpoint', status='active')

    def test_lead_to_contacted_stamps_last_contacted(self):
        reg = _reg(self.program)
        self.assertIsNone(reg.last_contacted_at)
        r = self.client.post(_op_url(reg.id), {'status': 'contacted'}, format='json')
        self.assertEqual(r.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.operational_status, 'contacted')
        self.assertIsNotNone(reg.last_contacted_at)
        self.assertEqual(r.data['old_status'], 'lead')

    def test_contacted_to_subscribed(self):
        reg = _reg(self.program, operational_status='contacted')
        r = self.client.post(_op_url(reg.id), {'status': 'subscribed'}, format='json')
        self.assertEqual(r.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.operational_status, 'subscribed')

    def test_cancellation_paths(self):
        for initial in ('lead', 'contacted', 'subscribed'):
            reg = _reg(self.program, operational_status=initial)
            r = self.client.post(_op_url(reg.id), {'status': 'cancelled'}, format='json')
            self.assertEqual(r.status_code, 200, initial)
            reg.refresh_from_db()
            self.assertEqual(reg.operational_status, 'cancelled')

    def test_cancel_with_note_appends_internal_notes(self):
        reg = _reg(self.program, operational_status='contacted', internal_notes='existing')
        r = self.client.post(_op_url(reg.id),
                             {'status': 'cancelled', 'note': 'customer declined'}, format='json')
        self.assertEqual(r.status_code, 200)
        reg.refresh_from_db()
        self.assertIn('existing', reg.internal_notes)
        self.assertIn('customer declined', reg.internal_notes)

    def test_subscribed_to_contacted_correction(self):
        reg = _reg(self.program, operational_status='subscribed')
        r = self.client.post(_op_url(reg.id), {'status': 'contacted'}, format='json')
        self.assertEqual(r.status_code, 200)

    def test_cancelled_to_contacted_reactivation(self):
        reg = _reg(self.program, operational_status='cancelled')
        r = self.client.post(_op_url(reg.id), {'status': 'contacted'}, format='json')
        self.assertEqual(r.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.operational_status, 'contacted')

    def test_invalid_transition_returns_400_with_allowed(self):
        reg = _reg(self.program)
        r = self.client.post(_op_url(reg.id), {'status': 'subscribed'}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertEqual(r.data['code'], 'invalid_transition')
        self.assertIn('contacted', r.data['allowed_transitions'])

    def test_transition_activity_logged(self):
        reg = _reg(self.program)
        self.client.post(_op_url(reg.id), {'status': 'contacted'}, format='json')
        log = ActivityLog.objects.filter(
            description='cms.training_registrations.operational_status_changed',
        ).latest('created_at')
        self.assertEqual(log.metadata['old_status'], 'lead')
        self.assertEqual(log.metadata['new_status'], 'contacted')
        self.assertEqual(log.user, self.admin)

    def test_operational_status_not_patchable_via_write_serializer(self):
        reg = _reg(self.program)
        r = self.client.patch(f'{LIST_URL}{reg.id}/',
                              {'operational_status': 'subscribed'}, format='json')
        self.assertEqual(r.status_code, 200)
        reg.refresh_from_db()
        # Not writable through PATCH — the field is absent from the write
        # serializer, so it is ignored and stays 'lead'.
        self.assertEqual(reg.operational_status, 'lead')

    def test_unauthenticated_and_low_role_rejected(self):
        reg = _reg(self.program)
        anon = APIClient()
        self.assertEqual(anon.post(_op_url(reg.id), {'status': 'contacted'}).status_code, 403)
        editor = User.objects.create_user('ops-editor', password='pass', role='editor')
        c = APIClient(); c.force_authenticate(editor)
        self.assertEqual(c.post(_op_url(reg.id), {'status': 'contacted'}).status_code, 403)

    def test_missing_status_and_not_found(self):
        reg = _reg(self.program)
        self.assertEqual(self.client.post(_op_url(reg.id), {}, format='json').status_code, 400)
        self.assertEqual(self.client.post(_op_url(999999), {'status': 'contacted'}).status_code, 404)


class OperationalStatusStatsFilterTests(TestCase):
    """KPI == filter parity: same queryset foundation must drive both."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user('ops-stats-admin', password='pass', role='admin')
        self.client.force_authenticate(self.admin)
        self.program = Program.objects.create(slug='ops-stats-program', title_en='Ops Stats', status='active')
        _reg(self.program, operational_status='lead')
        _reg(self.program, operational_status='lead')
        _reg(self.program, operational_status='contacted')
        _reg(self.program, operational_status='subscribed')
        _reg(self.program, operational_status='cancelled')

    def test_stats_by_operational_status(self):
        r = self.client.get(STATS_URL)
        self.assertEqual(r.status_code, 200)
        ops = r.data['by_operational_status']
        self.assertEqual(ops, {'lead': 2, 'contacted': 1, 'subscribed': 1, 'cancelled': 1})

    def test_kpi_equals_filtered_count(self):
        stats = self.client.get(STATS_URL).data['by_operational_status']
        for value in ('lead', 'contacted', 'subscribed', 'cancelled'):
            r = self.client.get(LIST_URL, {'operational_status': value})
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.data['count'], stats[value], value)

    def test_stats_respect_other_filters(self):
        r = self.client.get(STATS_URL, {'operational_status': 'lead'})
        self.assertEqual(r.data['by_operational_status']['lead'], 2)
        self.assertEqual(r.data['by_operational_status']['contacted'], 0)
        self.assertEqual(r.data['total'], 2)

    def test_paid_does_not_imply_subscribed(self):
        """A paid payment_status row must still count by operational_status only."""
        _reg(self.program, operational_status='contacted',
             payment_status=TrainingRegistration.PAYMENT_STATUS_PAID)
        stats = self.client.get(STATS_URL).data['by_operational_status']
        self.assertEqual(stats['contacted'], 2)
        self.assertEqual(stats['subscribed'], 1)


class OperationalStatusEntryPathTests(TestCase):
    """Every creation path must start at lead without staff intervention."""

    def setUp(self):
        self.program = Program.objects.create(
            slug='ops-entry-program', title_en='Ops Entry', status='active',
            registration_open=True, external_form_key='ops-entry-key',
        )

    def test_website_registration_is_lead(self):
        from apps.training.serializers import WebsiteRegistrationSerializer
        ser = WebsiteRegistrationSerializer(
            data={
                'full_name': 'Web User', 'phone': '01011112222',
                'privacy_policy_consent': True, 'website_field': '',
            },
            context={'program': self.program},
        )
        self.assertTrue(ser.is_valid(), ser.errors)
        reg = ser.save()
        self.assertEqual(reg.operational_status, 'lead')

    def test_google_form_submission_is_lead(self):
        from apps.training.serializers import GoogleFormRegistrationSerializer
        ser = GoogleFormRegistrationSerializer(
            data={
                'form_key': 'ops-entry-key', 'external_submission_id': 'g1',
                'full_name': 'Google User', 'phone': '01033334444',
            },
        )
        self.assertTrue(ser.is_valid(), ser.errors)
        reg = ser.save()
        self.assertEqual(reg.operational_status, 'lead')

    def test_cms_create_is_lead(self):
        client = APIClient()
        admin = User.objects.create_user('ops-cms-admin', password='pass', role='admin')
        client.force_authenticate(admin)
        r = client.post(LIST_URL, {
            'program': self.program.id, 'full_name': 'CMS Reg',
            'phone': '01055556666', 'email': 'cms@example.com',
        }, format='json')
        self.assertEqual(r.status_code, 201)
        reg = TrainingRegistration.objects.get(pk=r.data['id'])
        self.assertEqual(reg.operational_status, 'lead')


class OperationalStatusMigrationBaselineTests(TestCase):
    """Clean-baseline decision: migration 0022 sets EVERY existing
    registration to 'lead', regardless of legacy status, enrollment_stage,
    payment_status, WhatsApp, or follow-up fields. Historical fields are
    never modified."""

    def setUp(self):
        self.program = Program.objects.create(
            slug='ops-mig-program', title_en='Ops Mig', status='active')

    def _run_migration(self):
        import importlib
        from django.db import connection
        from django.apps import apps as real_apps
        mig = importlib.import_module(
            'apps.training.migrations.0022_starter_operational_status')
        mig.populate_operational_status(real_apps, connection.schema_editor())

    def test_all_existing_become_lead(self):
        combos = [
            dict(enrollment_stage='contacted', payment_status='paid',
                 status=TrainingRegistration.STATUS_COMPLETED,
                 last_contacted_at=timezone.now(), whatsapp_group_added=True),
            dict(enrollment_stage='confirmed', payment_status='paid',
                 status=TrainingRegistration.STATUS_ENROLLED),
            dict(enrollment_stage='cancelled',
                 status=TrainingRegistration.STATUS_CANCELLED),
            dict(enrollment_stage='unknown', payment_status='unknown'),
            dict(enrollment_stage='needs_contact', payment_status='unpaid'),
            dict(enrollment_stage='pending_payment', payment_status='pending'),
        ]
        regs = []
        for kw in combos:
            target_status = kw.pop('status', TrainingRegistration.STATUS_NEW)
            reg = TrainingRegistration.objects.create(
                program=self.program, full_name='Mig', **kw)
            # Legacy status transitions are validated on save(); use a
            # queryset update to simulate a historically completed row.
            TrainingRegistration.objects.filter(pk=reg.pk).update(
                status=target_status, operational_status='subscribed')
            reg.refresh_from_db()
            regs.append(reg)

        self._run_migration()

        for reg in regs:
            reg.refresh_from_db()
            self.assertEqual(reg.operational_status, 'lead')

        # Historical fields untouched: paid stayed paid, completed stayed
        # completed, contacted timestamp preserved.
        self.assertEqual(regs[0].payment_status, 'paid')
        self.assertEqual(regs[0].status, TrainingRegistration.STATUS_COMPLETED)
        self.assertIsNotNone(regs[0].last_contacted_at)
        self.assertTrue(regs[0].whatsapp_group_added)
        self.assertEqual(regs[1].enrollment_stage, 'confirmed')
        self.assertEqual(regs[2].enrollment_stage, 'cancelled')

