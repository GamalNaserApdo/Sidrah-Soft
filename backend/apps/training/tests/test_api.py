"""Targeted tests for training registration and certificate APIs."""
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.activity_logs.models import ActivityLog
from apps.media_library.models import MediaAsset
from apps.training.models import Certificate, Program, TrainingRegistration

User = get_user_model()


def complete(registration):
    for status in ('reviewed', 'accepted', 'enrolled', 'completed'):
        registration.status = status
        registration.save()
    return registration


class WorkflowModelTests(TestCase):
    def setUp(self):
        self.program = Program.objects.create(slug='workflow', title_en='Workflow', status='active')

    def test_normalization_and_fields(self):
        registration = TrainingRegistration.objects.create(
            program=self.program, full_name='  Test User ', email=' TEST@Example.COM ',
            phone='+966 50 123', college_or_school='Sidrah College', academic_year='2026',
        )
        self.assertEqual(registration.status, 'new')
        self.assertEqual(registration.email_normalized, 'test@example.com')
        self.assertEqual(registration.phone_normalized, '96650123')
        self.assertFalse(registration.certificate_eligible)

    def test_validated_transitions_and_completed_eligibility(self):
        registration = TrainingRegistration.objects.create(
            program=self.program, full_name='Test', email='test@example.com'
        )
        registration.status = 'accepted'
        with self.assertRaises(ValidationError):
            registration.save()
        complete(registration)
        self.assertTrue(registration.certificate_eligible)

    def test_complete_status_transition_matrix(self):
        statuses = [value for value, _ in TrainingRegistration.STATUS_CHOICES]
        for source in statuses:
            for target in statuses:
                with self.subTest(source=source, target=target):
                    registration = TrainingRegistration.objects.create(
                        program=self.program,
                        full_name=f'{source}-{target}',
                        email=f'{source}-{target}@example.com',
                    )
                    TrainingRegistration.objects.filter(pk=registration.pk).update(status=source)
                    registration.refresh_from_db()
                    registration.status = target
                    allowed = target == source or target in TrainingRegistration.ALLOWED_TRANSITIONS[source]
                    if allowed:
                        registration.save()
                    else:
                        with self.assertRaises(ValidationError):
                            registration.save()

    def test_terminal_statuses_cannot_shortcut_to_completed(self):
        for terminal in ('rejected', 'cancelled'):
            registration = TrainingRegistration.objects.create(
                program=self.program, full_name=terminal, email=f'{terminal}@example.com'
            )
            registration.status = 'reviewed' if terminal == 'rejected' else 'cancelled'
            registration.save()
            if terminal == 'rejected':
                registration.status = 'rejected'
                registration.save()
            registration.status = 'completed'
            with self.assertRaises(ValidationError):
                registration.save()

    def test_source_scoped_idempotency(self):
        kwargs = dict(program=self.program, full_name='Test', email='test@example.com', external_submission_id='r1')
        TrainingRegistration.objects.create(source='google_form', **kwargs)
        with self.assertRaises(IntegrityError), transaction.atomic():
            TrainingRegistration.objects.create(source='google_form', **kwargs)
        TrainingRegistration.objects.create(source='cms_manual', **kwargs)

    def test_reference_is_stable_nonsequential(self):
        registration = complete(TrainingRegistration.objects.create(
            program=self.program, full_name='Test', email='test@example.com'
        ))
        certificate = Certificate.objects.create(training_registration=registration)
        reference = certificate.reference
        certificate.grade = 'A'
        certificate.save()
        self.assertEqual(certificate.reference, reference)
        # Format: SDR-TRN-{year}-{6 alphanumeric chars}
        self.assertRegex(reference, r'^SDR-TRN-\d{4}-[A-Z0-9]{6}$')


@override_settings(APPS_SCRIPT_SECRET='header-only-secret')
class GoogleFormIngestionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/v1/training/apps-script/submission/'
        self.program = Program.objects.create(
            slug='google-form', title_en='Google Form', status='active',
            registration_open=True, external_form_key='form-id',
        )
        self.payload = {
            'form_key': 'form-id', 'external_submission_id': 'response-1',
            'full_name': 'Applicant', 'email': 'applicant@example.com',
            'college_or_school': 'School', 'academic_year': 'Third', 'notes': 'Applicant note',
        }

    def post(self, payload=None, secret='header-only-secret'):
        return self.client.post(
            self.url, payload or self.payload, format='json', HTTP_X_APPS_SCRIPT_SECRET=secret
        )

    def test_secret_is_header_only(self):
        body = {**self.payload, 'secret': 'header-only-secret'}
        response = self.client.post(self.url, body, format='json')
        self.assertEqual(response.status_code, 401)

    def test_strict_serializer_rejects_invalid_payload(self):
        response = self.post({**self.payload, 'email': 'invalid'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(TrainingRegistration.objects.count(), 0)

    def test_unknown_form_key_has_safe_response(self):
        response = self.post({**self.payload, 'form_key': 'unknown'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['code'], 'invalid_form_configuration')

    def test_create_and_idempotent_retry(self):
        first = self.post()
        second = self.post()
        self.assertEqual(first.status_code, 201)
        self.assertEqual(first.data['status'], 'new')
        self.assertEqual(second.status_code, 200)
        self.assertFalse(second.data['is_new'])
        registration = TrainingRegistration.objects.get()
        self.assertEqual(registration.source, 'google_form')
        self.assertFalse(hasattr(registration, 'raw_responses'))
        self.assertNotIn(registration.full_name, str(registration))

    def test_retry_remains_idempotent_after_registration_closes(self):
        self.assertEqual(self.post().status_code, 201)
        self.program.registration_open = False
        self.program.maximum_capacity = 1
        self.program.save(update_fields=['registration_open', 'maximum_capacity'])
        retry = self.post()
        self.assertEqual(retry.status_code, 200)
        self.assertFalse(retry.data['is_new'])
        self.assertEqual(TrainingRegistration.objects.count(), 1)

    def test_blank_form_key_is_rejected(self):
        Program.objects.create(slug='blank-key', title_en='Blank', status='active', external_form_key='')
        response = self.post({**self.payload, 'form_key': ''})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['code'], 'invalid_form_configuration')

    def test_capacity_is_enforced(self):
        self.program.maximum_capacity = 1
        self.program.save(update_fields=['maximum_capacity'])
        self.assertEqual(self.post().status_code, 201)
        second = self.post({**self.payload, 'external_submission_id': 'response-2'})
        self.assertEqual(second.status_code, 400)
        self.assertEqual(TrainingRegistration.objects.count(), 1)

    def test_blank_email_accepted(self):
        """Canonical rule: email is optional on all registration paths."""
        response = self.post({**self.payload, 'email': ''})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.get().email, '')

    def test_omitted_email_accepted(self):
        payload = {k: v for k, v in self.payload.items() if k != 'email'}
        response = self.post(payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.get().email, '')

    def test_arbitrary_payload_is_not_persisted(self):
        response = self.post({**self.payload, 'unexpected_pii': 'do not store'})
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('unexpected_pii', vars(TrainingRegistration.objects.get()))


class CMSRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'pass')
        self.client.force_authenticate(self.admin)
        self.p1 = Program.objects.create(slug='course-1', title_en='Course 1', status='active')
        self.p2 = Program.objects.create(slug='course-2', title_en='Course 2', status='active')
        self.registration = TrainingRegistration.objects.create(
            program=self.p1, full_name='Person', email='person@example.com'
        )

    def test_manual_create_uses_cms_source(self):
        response = self.client.post('/api/v1/cms/training/registrations/', {
            'program': self.p2.id, 'full_name': 'Manual', 'email': 'manual@example.com'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.get(full_name='Manual').source, 'cms_manual')

    def test_manual_create_cannot_claim_google_form_source(self):
        response = self.client.post('/api/v1/cms/training/registrations/', {
            'program': self.p2.id, 'full_name': 'Manual Source', 'email': 'source@example.com',
            'source': 'google_form', 'external_submission_id': 'forged',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        registration = TrainingRegistration.objects.get(full_name='Manual Source')
        self.assertEqual(registration.source, 'cms_manual')
        self.assertEqual(registration.external_submission_id, '')

    def test_manual_create_enforces_capacity_but_allows_closed_program_history(self):
        self.p2.maximum_capacity = 1
        self.p2.registration_open = False
        self.p2.save(update_fields=['maximum_capacity', 'registration_open'])
        first = self.client.post('/api/v1/cms/training/registrations/', {
            'program': self.p2.id, 'full_name': 'First', 'email': 'first@example.com'
        }, format='json')
        second = self.client.post('/api/v1/cms/training/registrations/', {
            'program': self.p2.id, 'full_name': 'Second', 'email': 'second@example.com'
        }, format='json')
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)

    def test_invalid_status_transition_rejected(self):
        response = self.client.patch(
            f'/api/v1/cms/training/registrations/{self.registration.id}/',
            {'status': 'completed'}, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_stats_include_total_course_and_status(self):
        TrainingRegistration.objects.create(program=self.p2, full_name='Other', email='other@example.com')
        response = self.client.get('/api/v1/cms/training/registrations/stats/?source=cms_manual')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['by_status']['new'], 2)
        self.assertEqual(len(response.data['by_course']), 2)

    def test_list_and_export_filters(self):
        self.client.patch(
            f'/api/v1/cms/training/registrations/{self.registration.id}/',
            {'status': 'reviewed'}, format='json'
        )
        listed = self.client.get(f'/api/v1/cms/training/registrations/?program={self.p1.id}&status=reviewed')
        exported = self.client.get(f'/api/v1/cms/training/registrations/export/?program={self.p1.id}&status=reviewed')
        self.assertEqual(listed.data['count'], 1)
        self.assertEqual(exported.status_code, 200)
        self.assertTrue(exported.content.startswith(b'\xef\xbb\xbf'))
        self.assertIn('Person', exported.content.decode('utf-8-sig'))

    def test_export_requires_export_permission(self):
        editor = User.objects.create_user('editor', password='pass', role='editor')
        self.client.force_authenticate(editor)
        self.assertEqual(self.client.get('/api/v1/cms/training/registrations/export/').status_code, 403)

    def test_date_from_filter_restricts_list_and_stats(self):
        from django.utils import timezone
        old = TrainingRegistration.objects.create(
            program=self.p1, full_name='Old', email='old@example.com',
        )
        TrainingRegistration.objects.filter(pk=old.pk).update(
            submitted_at=timezone.now() - timezone.timedelta(days=10),
        )
        today = timezone.localdate().isoformat()
        listed = self.client.get(f'/api/v1/cms/training/registrations/?date_from={today}')
        self.assertEqual(listed.data['count'], 1)
        self.assertEqual(listed.data['results'][0]['full_name'], 'Person')
        stats = self.client.get(f'/api/v1/cms/training/registrations/stats/?date_from={today}')
        self.assertEqual(stats.data['total'], 1)
        self.assertEqual(stats.data['by_status']['new'], 1)
        self.assertEqual(len(stats.data['by_course']), 1)

    def test_date_to_filter_restricts_list_and_stats(self):
        from django.utils import timezone
        old = TrainingRegistration.objects.create(
            program=self.p1, full_name='Old', email='old@example.com',
        )
        TrainingRegistration.objects.filter(pk=old.pk).update(
            submitted_at=timezone.now() - timezone.timedelta(days=10),
        )
        past = (timezone.localdate() - timezone.timedelta(days=5)).isoformat()
        listed = self.client.get(f'/api/v1/cms/training/registrations/?date_to={past}')
        self.assertEqual(listed.data['count'], 1)
        self.assertEqual(listed.data['results'][0]['full_name'], 'Old')
        stats = self.client.get(f'/api/v1/cms/training/registrations/stats/?date_to={past}')
        self.assertEqual(stats.data['total'], 1)

    def test_same_day_date_range_returns_matching_records(self):
        from django.utils import timezone
        today = timezone.localdate().isoformat()
        listed = self.client.get(
            f'/api/v1/cms/training/registrations/?date_from={today}&date_to={today}'
        )
        self.assertEqual(listed.data['count'], 1)
        stats = self.client.get(
            f'/api/v1/cms/training/registrations/stats/?date_from={today}&date_to={today}'
        )
        self.assertEqual(stats.data['total'], 1)

    def test_date_range_with_status_combines_filters(self):
        from django.utils import timezone
        old = TrainingRegistration.objects.create(
            program=self.p1, full_name='Old', email='old@example.com',
        )
        TrainingRegistration.objects.filter(pk=old.pk).update(
            submitted_at=timezone.now() - timezone.timedelta(days=10),
        )
        self.client.patch(
            f'/api/v1/cms/training/registrations/{self.registration.id}/',
            {'status': 'reviewed'}, format='json',
        )
        today = timezone.localdate().isoformat()
        listed = self.client.get(
            f'/api/v1/cms/training/registrations/?date_from={today}&status=reviewed'
        )
        self.assertEqual(listed.data['count'], 1)
        self.assertEqual(listed.data['results'][0]['full_name'], 'Person')
        stats = self.client.get(
            f'/api/v1/cms/training/registrations/stats/?date_from={today}&status=reviewed'
        )
        self.assertEqual(stats.data['total'], 1)
        self.assertEqual(stats.data['by_status']['reviewed'], 1)

    def test_date_filter_course_stats_respect_range(self):
        from django.utils import timezone
        old_p2 = TrainingRegistration.objects.create(
            program=self.p2, full_name='Old P2', email='oldp2@example.com',
        )
        TrainingRegistration.objects.filter(pk=old_p2.pk).update(
            submitted_at=timezone.now() - timezone.timedelta(days=10),
        )
        today = timezone.localdate().isoformat()
        stats = self.client.get(f'/api/v1/cms/training/registrations/stats/?date_from={today}')
        course_ids = {c['program_id'] for c in stats.data['by_course']}
        self.assertIn(self.p1.id, course_ids)
        self.assertNotIn(self.p2.id, course_ids)


class CMSEmailOptionalTests(TestCase):
    """Canonical rule: email is optional on CMS registration create/update.

    Covers: CMS create with email / blank / omitted / malformed, operational
    PATCH without email, email preservation on unrelated PATCH, and
    confirmation-email safety for no-email registrations.
    """

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'pass')
        self.client.force_authenticate(self.admin)
        self.program = Program.objects.create(slug='email-opt', title_en='Email Opt', status='active')
        self.url = '/api/v1/cms/training/registrations/'

    def _create(self, **overrides):
        payload = {'program': self.program.id, 'full_name': 'Email User', 'phone': '01000000001'}
        payload.update(overrides)
        return self.client.post(self.url, payload, format='json')

    # --- CMS CREATE ---

    def test_create_with_valid_email(self):
        response = self._create(email='valid@example.com')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.get(full_name='Email User').email, 'valid@example.com')

    def test_create_with_blank_email(self):
        response = self._create(email='')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.get(full_name='Email User').email, '')

    def test_create_with_omitted_email(self):
        response = self._create()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.get(full_name='Email User').email, '')

    def test_create_with_malformed_email_rejected(self):
        response = self._create(email='not-an-email')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
        self.assertFalse(TrainingRegistration.objects.filter(full_name='Email User').exists())

    # --- CMS UPDATE without email ---

    def test_operational_patch_without_email(self):
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='No Email', email='', phone='01000000002',
        )
        url = f'{self.url}{reg.id}/'
        for payload in (
            {'enrollment_stage': 'contacted'},
            {'enrollment_stage': 'follow_up', 'next_follow_up_at': '2026-10-01'},
            {'payment_status': 'pending'},
            {'payment_status': 'paid', 'paid_amount': 1000},
            {'whatsapp_group_added': True},
        ):
            response = self.client.patch(url, payload, format='json')
            self.assertEqual(response.status_code, 200, msg=f'payload={payload}: {response.data}')
        reg.refresh_from_db()
        self.assertEqual(reg.enrollment_stage, 'follow_up')
        self.assertEqual(reg.payment_status, 'paid')
        self.assertTrue(reg.whatsapp_group_added)
        self.assertEqual(reg.email, '')

    def test_patch_preserves_existing_email(self):
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Has Email', email='keep@example.com',
        )
        response = self.client.patch(
            f'{self.url}{reg.id}/', {'enrollment_stage': 'contacted'}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.email, 'keep@example.com')

    def test_patch_can_clear_then_keep_empty_email(self):
        """PATCH email='' is accepted and stores blank (staff-side correction)."""
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Clear Email', email='clear@example.com',
        )
        response = self.client.patch(
            f'{self.url}{reg.id}/', {'email': ''}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.email, '')

    # --- Confirmation email safety ---

    def test_no_email_registration_skips_confirmation(self):
        from apps.training.services import send_registration_confirmation
        reg = TrainingRegistration.objects.create(
            program=self.program, full_name='Skip Confirm', email='', phone='01000000003',
        )
        result = send_registration_confirmation(reg)
        self.assertFalse(result)
        reg.refresh_from_db()
        self.assertEqual(
            reg.confirmation_email_status,
            TrainingRegistration.CONFIRMATION_NOT_ATTEMPTED,
        )
        self.assertEqual(reg.confirmation_email_error_summary, '')


class CMSRegistrationDeleteTests(TestCase):
    """CMS registration deletion: permission, audit logging, certificate guard."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user('admin', password='pass', role='admin')
        self.client.force_authenticate(self.admin)
        self.program = Program.objects.create(slug='del-course', title_en='Del Course', status='active')
        self.registration = TrainingRegistration.objects.create(
            program=self.program, full_name='Delete Me', email='delete@example.com',
            source='cms_manual',
        )
        self.url = f'/api/v1/cms/training/registrations/{self.registration.id}/'

    def test_admin_delete_returns_204_and_removes_row(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(TrainingRegistration.objects.filter(id=self.registration.id).exists())
        self.assertEqual(self.client.get(self.url).status_code, 404)

    def test_delete_writes_activity_log_with_identity_metadata(self):
        reg_id = self.registration.id
        self.client.delete(self.url)
        log = ActivityLog.objects.filter(
            action='delete', module='training_registrations', object_id=str(reg_id),
        ).latest('created_at')
        self.assertEqual(log.description, 'cms.training_registrations.deleted')
        self.assertEqual(log.metadata['id'], reg_id)
        self.assertEqual(log.metadata['full_name'], 'Delete Me')
        self.assertEqual(log.metadata['email'], 'delete@example.com')
        self.assertEqual(log.metadata['program_id'], self.program.id)
        self.assertEqual(log.metadata['program_slug'], 'del-course')
        self.assertEqual(log.metadata['status'], 'new')
        self.assertEqual(log.user, self.admin)

    def test_delete_requires_delete_permission(self):
        lms_admin = User.objects.create_user('lms', password='pass', role='lms_admin')
        self.client.force_authenticate(lms_admin)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 403)
        self.assertTrue(TrainingRegistration.objects.filter(id=self.registration.id).exists())

    def test_delete_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertIn(response.status_code, (401, 403))
        self.assertTrue(TrainingRegistration.objects.filter(id=self.registration.id).exists())

    def test_certificate_linked_registration_cannot_be_deleted(self):
        Certificate.objects.create(
            certificate_type='completion', training_registration=self.registration,
        )
        log_count = ActivityLog.objects.filter(
            action='delete', module='training_registrations',
        ).count()
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'registration_has_certificate')
        self.assertTrue(TrainingRegistration.objects.filter(id=self.registration.id).exists())
        self.assertEqual(Certificate.objects.count(), 1)
        self.assertEqual(
            ActivityLog.objects.filter(action='delete', module='training_registrations').count(),
            log_count,
        )

    def test_delete_missing_registration_returns_404(self):
        response = self.client.delete('/api/v1/cms/training/registrations/99999/')
        self.assertEqual(response.status_code, 404)


class CertificateAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('cert-admin', 'cert@example.com', 'pass')
        self.client.force_authenticate(self.admin)
        self.program = Program.objects.create(slug='certificate', title_en='Certificate Course', status='active')
        self.registration = TrainingRegistration.objects.create(
            program=self.program, full_name='Graduate', email='graduate@example.com'
        )

    def test_certificate_action_rbac(self):
        complete(self.registration)
        certificate = Certificate.objects.create(training_registration=self.registration)
        content_manager = User.objects.create_user(
            'content-manager', password='pass', role='content_manager'
        )
        self.client.force_authenticate(content_manager)
        self.assertEqual(
            self.client.get(f'/api/v1/cms/training/certificates/{certificate.id}/').status_code,
            200,
        )
        self.assertEqual(
            self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/issue/').status_code,
            403,
        )
        lms_admin = User.objects.create_user('lms-admin', password='pass', role='lms_admin')
        self.client.force_authenticate(lms_admin)
        self.assertEqual(
            self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/issue/').status_code,
            200,
        )
        self.assertEqual(
            self.client.post(
                f'/api/v1/cms/training/certificates/{certificate.id}/revoke/',
                {'revoked_reason': 'Administrative correction'}, format='json',
            ).status_code,
            200,
        )

    def test_create_requires_completed_registration(self):
        response = self.client.post('/api/v1/cms/training/certificates/', {
            'training_registration': self.registration.id
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_issue_requires_completed_registration(self):
        certificate = Certificate.objects.create(training_registration=self.registration)
        response = self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/issue/')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['code'], 'not_completed')

    def test_completed_registration_can_be_issued(self):
        complete(self.registration)
        certificate = Certificate.objects.create(training_registration=self.registration)
        response = self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/issue/')
        self.assertEqual(response.status_code, 200)

    def test_reference_and_registration_are_immutable(self):
        complete(self.registration)
        certificate = Certificate.objects.create(training_registration=self.registration)
        certificate.reference = 'SDR-CHANGED'
        with self.assertRaises(ValidationError):
            certificate.save()
        other = complete(TrainingRegistration.objects.create(
            program=self.program, full_name='Other', email='other@example.com'
        ))
        response = self.client.patch(
            f'/api/v1/cms/training/certificates/{certificate.id}/',
            {'training_registration': other.id}, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_cms_can_update_recognition_certificate_identity(self):
        certificate = Certificate.objects.create(
            certificate_type='recognition',
            recipient_name='Original Recipient',
            certificate_title='Original Title',
            status='issued',
        )
        original_reference = certificate.reference
        original_status = certificate.status

        response = self.client.patch(
            f'/api/v1/cms/training/certificates/{certificate.id}/',
            {
                'recipient_name': 'Corrected Recipient',
                'certificate_title': 'Corrected Track Title',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)

        certificate.refresh_from_db()
        self.assertEqual(certificate.recipient_name, 'Corrected Recipient')
        self.assertEqual(certificate.certificate_title, 'Corrected Track Title')
        self.assertEqual(certificate.reference, original_reference)
        self.assertEqual(certificate.status, original_status)

        detail = self.client.get(f'/api/v1/cms/training/certificates/{certificate.id}/')
        self.assertEqual(detail.data['recipient_name'], 'Corrected Recipient')
        self.assertEqual(detail.data['certificate_title'], 'Corrected Track Title')

        verified = self.client.get(
            f'/api/v1/training/certificates/{certificate.reference}/verify/'
        )
        self.assertEqual(verified.status_code, 200)
        self.assertEqual(verified.data['recipient_name'], 'Corrected Recipient')
        self.assertEqual(verified.data['certificate_title'], 'Corrected Track Title')
        self.assertTrue(verified.data['is_valid'])

    def test_completion_certificate_recipient_name_can_override_registration_snapshot(self):
        complete(self.registration)
        certificate = Certificate.objects.create(
            training_registration=self.registration,
            certificate_title='Certificate Course',
            status='issued',
        )

        response = self.client.patch(
            f'/api/v1/cms/training/certificates/{certificate.id}/',
            {'recipient_name': 'Corrected Graduate'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)

        verified = self.client.get(
            f'/api/v1/training/certificates/{certificate.reference}/verify/'
        )
        self.assertEqual(verified.status_code, 200)
        self.assertEqual(verified.data['recipient_name'], 'Corrected Graduate')

    def test_unauthorized_role_cannot_update_certificate_identity(self):
        certificate = Certificate.objects.create(
            certificate_type='recognition',
            recipient_name='Protected Recipient',
            certificate_title='Protected Title',
            status='issued',
        )
        editor = User.objects.create_user('certificate-editor', password='pass', role='editor')
        self.client.force_authenticate(editor)

        response = self.client.patch(
            f'/api/v1/cms/training/certificates/{certificate.id}/',
            {'recipient_name': 'Unauthorized Change', 'certificate_title': 'Unauthorized Title'},
            format='json',
        )
        self.assertEqual(response.status_code, 403)

        certificate.refresh_from_db()
        self.assertEqual(certificate.recipient_name, 'Protected Recipient')
        self.assertEqual(certificate.certificate_title, 'Protected Title')

    def test_revoked_certificate_cannot_be_reissued(self):
        complete(self.registration)
        certificate = Certificate.objects.create(training_registration=self.registration)
        self.assertEqual(self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/issue/').status_code, 200)
        self.assertEqual(self.client.post(
            f'/api/v1/cms/training/certificates/{certificate.id}/revoke/',
            {'revoked_reason': 'Superseded'}, format='json'
        ).status_code, 200)
        response = self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/issue/')
        self.assertEqual(response.status_code, 400)
        certificate.refresh_from_db()
        self.assertEqual(certificate.status, 'revoked')
        self.assertIsNotNone(certificate.revoked_at)

    def test_draft_certificate_is_not_public(self):
        complete(self.registration)
        certificate = Certificate.objects.create(training_registration=self.registration)
        response = self.client.get(f'/api/v1/training/certificates/{certificate.reference}/verify/')
        self.assertEqual(response.status_code, 404)

    def test_public_verify_dates_and_issued_file_then_revocation(self):
        complete(self.registration)
        asset = MediaAsset.objects.create(title='Certificate', file=ContentFile(b'pdf', name='certificate.pdf'))
        certificate = Certificate.objects.create(
            training_registration=self.registration, certificate_number='CERT-2026-1',
            training_start_date='2026-01-01', training_end_date='2026-02-01',
            grade='A', result='Passed', media_asset=asset,
        )
        issue = self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/issue/')
        self.assertEqual(issue.status_code, 200)
        verify_url = f'/api/v1/training/certificates/{certificate.reference}/verify/'
        verified = self.client.get(verify_url)
        self.assertTrue(verified.data['is_valid'])
        self.assertEqual(str(verified.data['training_start_date']), '2026-01-01')
        self.assertNotIn('email', verified.data)
        self.assertNotIn('phone', verified.data)
        self.assertNotIn('internal_notes', verified.data)
        self.assertNotIn('national_id', verified.data)
        self.assertNotIn('grade', verified.data)
        self.assertNotIn('result', verified.data)
        self.client.post(f'/api/v1/cms/training/certificates/{certificate.id}/revoke/', {'revoked_reason': 'Invalid'}, format='json')
        certificate.refresh_from_db()
        self.assertEqual(certificate.revoked_reason, 'Invalid')
        revoked = self.client.get(verify_url)
        self.assertFalse(revoked.data['is_valid'])
        # Revoked certificates must not expose file_url
        self.assertIsNone(revoked.data.get('file_url'))

    def test_instructor_certificate_type_persists_across_reload(self):
        """Instructor type must survive create → reload → edit → issue → verify."""
        # Create (Generate Credential)
        response = self.client.post('/api/v1/cms/training/certificates/', {
            'certificate_type': 'instructor',
            'recipient_name': 'Ahmed Hisham Hassan',
            'certificate_title': 'Cyber Security Instructor',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        cert_id = response.data['id']
        original_reference = response.data['reference']
        self.assertEqual(response.data['certificate_type'], 'instructor')
        self.assertEqual(response.data['status'], 'draft')

        # Reload
        reloaded = self.client.get(f'/api/v1/cms/training/certificates/{cert_id}/')
        self.assertEqual(reloaded.data['certificate_type'], 'instructor')

        # Edit (save name change)
        updated = self.client.patch(
            f'/api/v1/cms/training/certificates/{cert_id}/',
            {'recipient_name': 'Ahmed Hisham Hassan [CORRECTED]'},
            format='json',
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data['certificate_type'], 'instructor')

        # Reload again
        reloaded2 = self.client.get(f'/api/v1/cms/training/certificates/{cert_id}/')
        self.assertEqual(reloaded2.data['certificate_type'], 'instructor')

        # Issue
        issued = self.client.post(f'/api/v1/cms/training/certificates/{cert_id}/issue/')
        self.assertEqual(issued.status_code, 200)
        self.assertEqual(issued.data['status'], 'issued')
        self.assertEqual(issued.data['certificate_type'], 'instructor')

        # Public verification
        verified = self.client.get(f'/api/v1/training/certificates/{original_reference}/verify/')
        self.assertEqual(verified.status_code, 200)
        self.assertEqual(verified.data['certificate_type'], 'instructor')
        self.assertEqual(verified.data['recipient_name'], 'Ahmed Hisham Hassan [CORRECTED]')
        self.assertEqual(verified.data['certificate_title'], 'Cyber Security Instructor')
        self.assertTrue(verified.data['is_valid'])

        # Reference unchanged
        certificate = Certificate.objects.get(id=cert_id)
        self.assertEqual(certificate.reference, original_reference)
        self.assertEqual(certificate.certificate_type, 'instructor')

    def test_instructor_certificate_requires_recipient_name(self):
        """Instructor certificates must require recipient_name (like recognition)."""
        response = self.client.post('/api/v1/cms/training/certificates/', {
            'certificate_type': 'instructor',
            'certificate_title': 'Cyber Security Instructor',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('recipient_name', response.data)

    def test_instructor_certificate_does_not_require_registration(self):
        """Instructor certificates must NOT require a training_registration."""
        response = self.client.post('/api/v1/cms/training/certificates/', {
            'certificate_type': 'instructor',
            'recipient_name': 'Test Instructor',
            'certificate_title': 'Test Instructor Title',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.data.get('training_registration'))


class StarterCampaignConfigTests(TestCase):
    """Tests for the StarterCampaignConfig singleton and its endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('cfgadmin', 'cfgadmin@example.com', 'pass')
        self.client.force_authenticate(self.admin)

    def tearDown(self):
        """Clean up any config created during tests."""
        from apps.training.models import StarterCampaignConfig
        StarterCampaignConfig.objects.all().delete()

    def test_get_current_creates_singleton_with_defaults(self):
        from apps.training.models import StarterCampaignConfig
        self.assertEqual(StarterCampaignConfig.objects.count(), 0)
        config = StarterCampaignConfig.get_current()
        self.assertIsNotNone(config)
        self.assertTrue(config.show_registration_form)
        self.assertEqual(config.form_title_en, 'Register for a Starter Course')
        self.assertEqual(config.form_title_ar, 'سجّل في كورس Starter')
        self.assertEqual(config.form_button_en, 'Register Now')
        self.assertTrue(config.is_active)
        # Singleton: calling again returns the same record
        config2 = StarterCampaignConfig.get_current()
        self.assertEqual(config.pk, config2.pk)
        self.assertEqual(StarterCampaignConfig.objects.count(), 1)

    def test_public_endpoint_returns_defaults(self):
        response = self.client.get('/api/v1/training/starter-form-config/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['show_registration_form'])
        self.assertEqual(response.data['form_title_en'], 'Register for a Starter Course')
        self.assertEqual(response.data['form_title_ar'], 'سجّل في كورس Starter')
        self.assertEqual(response.data['form_button_en'], 'Register Now')
        # Internal fields must NOT be exposed publicly
        self.assertNotIn('id', response.data)
        self.assertNotIn('is_active', response.data)
        self.assertNotIn('created_at', response.data)

    def test_cms_get_returns_config(self):
        response = self.client.get('/api/v1/cms/training/starter-form-config/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['show_registration_form'])
        self.assertEqual(response.data['form_title_en'], 'Register for a Starter Course')
        # CMS serializer includes internal fields
        self.assertIn('id', response.data)
        self.assertIn('is_active', response.data)

    def test_cms_put_updates_config(self):
        response = self.client.put(
            '/api/v1/cms/training/starter-form-config/',
            {'form_title_en': 'Custom Starter Title', 'show_registration_form': False},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['form_title_en'], 'Custom Starter Title')
        self.assertFalse(response.data['show_registration_form'])
        # Verify persistence
        response = self.client.get('/api/v1/cms/training/starter-form-config/')
        self.assertEqual(response.data['form_title_en'], 'Custom Starter Title')
        self.assertFalse(response.data['show_registration_form'])

    def test_cms_patch_partial_update(self):
        response = self.client.patch(
            '/api/v1/cms/training/starter-form-config/',
            {'form_button_ar': 'سجّل الآن'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['form_button_ar'], 'سجّل الآن')
        # Other fields unchanged
        self.assertEqual(response.data['form_title_en'], 'Register for a Starter Course')

    def test_public_endpoint_reflects_cms_changes(self):
        self.client.put(
            '/api/v1/cms/training/starter-form-config/',
            {'form_title_en': 'Public Sees This', 'success_message_en': 'You did it!'},
            format='json',
        )
        response = self.client.get('/api/v1/training/starter-form-config/')
        self.assertEqual(response.data['form_title_en'], 'Public Sees This')
        self.assertEqual(response.data['success_message_en'], 'You did it!')

    def test_unauthenticated_cms_access_blocked(self):
        from rest_framework.test import APIClient
        anon = APIClient()
        response = anon.get('/api/v1/cms/training/starter-form-config/')
        self.assertIn(response.status_code, (401, 403))
        response = anon.put(
            '/api/v1/cms/training/starter-form-config/',
            {'form_title_en': 'Hacked'},
            format='json',
        )
        self.assertIn(response.status_code, (401, 403))

    def test_public_endpoint_allows_anonymous(self):
        from rest_framework.test import APIClient
        anon = APIClient()
        response = anon.get('/api/v1/training/starter-form-config/')
        self.assertEqual(response.status_code, 200)

    def test_singleton_only_one_active(self):
        from apps.training.models import StarterCampaignConfig
        config1 = StarterCampaignConfig.get_current()
        config2 = StarterCampaignConfig.objects.create(is_active=True, form_title_en='Second')
        # Activating config2 should deactivate config1
        config1.refresh_from_db()
        self.assertFalse(config1.is_active)
        self.assertTrue(config2.is_active)
        # get_current returns the active one
        current = StarterCampaignConfig.get_current()
        self.assertEqual(current.pk, config2.pk)
