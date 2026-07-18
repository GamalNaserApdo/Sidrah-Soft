"""Focused tests for the Leads / Contact hardened flow."""
from unittest.mock import patch

from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.activity_logs.models import ActivityLog

from .models import ContactSubmission, InquiryType


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    CONTACT_NOTIFICATION_EMAIL='sidrahsoft@example.com',
    LEADS_DASHBOARD_BASE_URL='http://testserver',
)
class LeadHardeningTests(APITestCase):
    def setUp(self):
        self.inquiry_type = InquiryType.objects.create(
            slug='website-development',
            name_en='Website Development',
            name_ar='تطوير مواقع الويب',
            order=0,
            is_active=True,
        )
        self.second_type = InquiryType.objects.create(
            slug='training',
            name_en='Training',
            name_ar='تدريب',
            order=1,
            is_active=True,
        )
        self.payload = {
            'inquiry_type': self.inquiry_type.slug,
            'full_name': 'Jane Doe',
            'email': 'jane@example.com',
            'phone': '+1 555 123 4567',
            'company': 'Example Inc',
            'message': 'Need a new website for our company.',
            'privacy_consent': True,
            'language': 'en',
            'website': '',
        }
        self.support = User.objects.create_user(
            username='support',
            email='support@example.com',
            password='testpass123',
            role=User.ROLE_SUPPORT_AGENT,
            is_active=True,
        )
        self.admin = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password='testpass123',
            role=User.ROLE_ADMIN,
            is_active=True,
        )
        self.lms_admin = User.objects.create_user(
            username='lmsadmin',
            email='lms@example.com',
            password='testpass123',
            role=User.ROLE_LMS_ADMIN,
            is_active=True,
        )
        self.editor = User.objects.create_user(
            username='editor',
            email='editor@example.com',
            password='testpass123',
            role=User.ROLE_EDITOR,
            is_active=True,
        )

    def _create_lead(self, **kwargs):
        data = {
            'inquiry_type': self.inquiry_type,
            'full_name': 'Test User',
            'email': 'test@example.com',
            'message': 'A sample message for testing.',
            'privacy_consent': True,
        }
        data.update(kwargs)
        return ContactSubmission.objects.create(**data)

    def test_public_submission_creates_lead_and_sends_emails(self):
        response = self.client.post('/api/v1/contact/submissions/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

        lead = ContactSubmission.objects.get(email='jane@example.com')
        self.assertEqual(lead.status, ContactSubmission.STATUS_NEW)
        self.assertEqual(lead.email_delivery_status, ContactSubmission.DELIVERY_SENT)

        self.assertEqual(len(mail.outbox), 2)
        internal = mail.outbox[0]
        self.assertEqual(internal.to, ['sidrahsoft@example.com'])
        self.assertIn('New SidrahSoft Lead', internal.subject)
        self.assertIn('jane@example.com', internal.body)
        self.assertIn(f'http://testserver/leads/{lead.id}', internal.body)

        confirmation = mail.outbox[1]
        self.assertEqual(confirmation.to, ['jane@example.com'])
        self.assertIn('Thank you for contacting SidrahSoft', confirmation.subject)

        log = ActivityLog.objects.filter(action='lead_created').first()
        self.assertIsNotNone(log)
        self.assertEqual(log.module, 'leads')

    def test_honeypot_blocks_submission(self):
        payload = {**self.payload, 'website': 'http://spam.example.com'}
        response = self.client.post('/api/v1/contact/submissions/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('website', response.data)
        self.assertFalse(
            ContactSubmission.objects.filter(email='jane@example.com').exists()
        )

    def test_smtp_failure_still_creates_lead(self):
        with patch('django.core.mail.EmailMessage.send') as mock_send:
            mock_send.side_effect = Exception('SMTP connection refused')
            response = self.client.post(
                '/api/v1/contact/submissions/', self.payload, format='json'
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        lead = ContactSubmission.objects.get(email='jane@example.com')
        self.assertEqual(lead.email_delivery_status, ContactSubmission.DELIVERY_FAILED)
        self.assertIn('SMTP connection refused', lead.email_error_summary)

    def test_anonymous_cannot_access_leads_api(self):
        endpoints = [
            '/api/v1/cms/contact/submissions/',
            '/api/v1/cms/contact/submissions/1/',
            '/api/v1/cms/contact/submissions-stats/',
        ]
        for endpoint in endpoints:
            response = self.client.get(endpoint)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, endpoint)

    def test_unrelated_cms_user_cannot_access_leads(self):
        self.client.force_login(self.editor)
        response = self.client.get('/api/v1/cms/contact/submissions/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_lms_admin_cannot_access_leads(self):
        self.client.force_login(self.lms_admin)
        response = self.client.get('/api/v1/cms/contact/submissions/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_support_agent_can_access_leads_endpoints(self):
        self.client.force_login(self.support)
        list_response = self.client.get('/api/v1/cms/contact/submissions/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        stats_response = self.client.get('/api/v1/cms/contact/submissions-stats/')
        self.assertEqual(stats_response.status_code, status.HTTP_200_OK)

    def test_lead_detail_retrieval(self):
        lead = self._create_lead()
        self.client.force_login(self.support)
        response = self.client.get(f'/api/v1/cms/contact/submissions/{lead.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], lead.id)
        self.assertEqual(response.data['status'], lead.status)
        self.assertIn('internal_notes', response.data)

    def test_invalid_status_rejected(self):
        lead = self._create_lead()
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'status': 'invalid_status'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)

    def test_invalid_priority_rejected(self):
        lead = self._create_lead()
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'priority': 'extreme'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('priority', response.data)

    def test_archive_is_non_destructive(self):
        lead = self._create_lead()
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'status': ContactSubmission.STATUS_ARCHIVED},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.status, ContactSubmission.STATUS_ARCHIVED)
        self.assertTrue(
            ActivityLog.objects.filter(action='archived', module='leads').exists()
        )

    def test_spam_is_non_destructive(self):
        lead = self._create_lead()
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'status': ContactSubmission.STATUS_SPAM},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.status, ContactSubmission.STATUS_SPAM)
        self.assertTrue(
            ActivityLog.objects.filter(action='marked_spam', module='leads').exists()
        )

    def test_assign_to_active_cms_user_succeeds(self):
        lead = self._create_lead()
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'assigned_to': self.admin.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.assigned_to, self.admin)

    def test_assign_to_inactive_user_rejected(self):
        inactive_user = User.objects.create_user(
            username='inactive',
            email='inactive@example.com',
            password='testpass123',
            role=User.ROLE_ADMIN,
            is_active=False,
        )
        lead = self._create_lead()
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'assigned_to': inactive_user.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('assigned_to', response.data)

    def test_assign_to_non_cms_user_rejected(self):
        lead = self._create_lead()
        regular = User.objects.create_user(
            username='regular',
            email='regular@example.com',
            password='testpass123',
            role='web_visitor',
            is_active=True,
        )
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'assigned_to': regular.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('assigned_to', response.data)

    def test_unassign_lead_succeeds(self):
        lead = self._create_lead(assigned_to=self.admin)
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'assigned_to': None},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertIsNone(lead.assigned_to)

    def test_hard_delete_not_allowed(self):
        lead = self._create_lead()
        superuser = User.objects.create_superuser(
            username='super', email='super@example.com', password='testpass123'
        )
        self.client.force_login(superuser)
        response = self.client.delete(f'/api/v1/cms/contact/submissions/{lead.id}/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(ContactSubmission.objects.filter(pk=lead.pk).exists())

    def test_internal_notes_update_not_logged_in_metadata(self):
        lead = self._create_lead()
        secret_note = 'This is a confidential internal note.'
        self.client.force_login(self.support)
        response = self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'internal_notes': secret_note},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.internal_notes, secret_note)

        logs = ActivityLog.objects.filter(action='internal_note_updated', module='leads')
        self.assertTrue(logs.exists())
        for log in logs:
            self.assertNotIn(secret_note, str(log.metadata))
            self.assertNotIn(secret_note, log.description)

    def test_activity_logs_do_not_contain_email_or_phone(self):
        lead = self._create_lead(
            email='leaky@example.com',
            phone='+1 555 999 0000',
            message='Please contact me by phone or email.',
        )
        self.client.force_login(self.support)
        self.client.patch(
            f'/api/v1/cms/contact/submissions/{lead.id}/',
            {'priority': ContactSubmission.PRIORITY_HIGH},
            format='json',
        )
        logs = ActivityLog.objects.filter(module='leads')
        for log in logs:
            serialized = str(log.metadata)
            self.assertNotIn('leaky@example.com', serialized)
            self.assertNotIn('+1 555 999 0000', serialized)
            self.assertNotIn(lead.message, serialized)
            self.assertNotIn('leaky', log.object_repr)
            self.assertNotIn('+1 555', log.object_repr)

    def test_email_activity_log_masks_recipient(self):
        self.client.post('/api/v1/contact/submissions/', self.payload, format='json')
        log = ActivityLog.objects.filter(action='email_notification_sent').first()
        self.assertIsNotNone(log)
        self.assertIn('***', log.metadata.get('recipient', ''))

    def test_search_filter_and_pagination(self):
        self._create_lead(full_name='Alice Alpha', email='alice@example.com', status='new')
        self._create_lead(full_name='Bob Beta', email='bob@example.com', status='contacted')
        self._create_lead(
            full_name='Charlie Closed',
            email='charlie@example.com',
            status='closed',
            priority='urgent',
            inquiry_type=self.second_type,
        )

        self.client.force_login(self.support)

        search_response = self.client.get('/api/v1/cms/contact/submissions/?search=Alpha')
        self.assertEqual(search_response.data['count'], 1)
        self.assertEqual(search_response.data['results'][0]['full_name'], 'Alice Alpha')

        status_response = self.client.get('/api/v1/cms/contact/submissions/?status=closed')
        self.assertEqual(status_response.data['count'], 1)
        self.assertEqual(status_response.data['results'][0]['full_name'], 'Charlie Closed')

        priority_response = self.client.get('/api/v1/cms/contact/submissions/?priority=urgent')
        self.assertEqual(priority_response.data['count'], 1)
        self.assertEqual(priority_response.data['results'][0]['full_name'], 'Charlie Closed')

        type_response = self.client.get(
            f'/api/v1/cms/contact/submissions/?inquiry_type={self.second_type.id}'
        )
        self.assertEqual(type_response.data['count'], 1)

        page_response = self.client.get('/api/v1/cms/contact/submissions/?page_size=1')
        self.assertEqual(page_response.data['count'], 3)
        self.assertEqual(len(page_response.data['results']), 1)
        self.assertIsNotNone(page_response.data['next'])

    def test_stats_endpoint_counts_full_queryset(self):
        self._create_lead(status='new')
        self._create_lead(status='contacted', email='b@example.com')
        self._create_lead(status='closed', email='c@example.com')
        self._create_lead(status='spam', email='d@example.com')

        self.client.force_login(self.support)
        response = self.client.get('/api/v1/cms/contact/submissions-stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 4)
        self.assertEqual(response.data['new'], 1)
        self.assertEqual(response.data['contacted'], 1)
        self.assertEqual(response.data['closed'], 1)
        self.assertEqual(response.data['spam'], 1)

    def test_stats_endpoint_respects_filters(self):
        self._create_lead(status='new')
        self._create_lead(status='new', email='b@example.com')
        self._create_lead(status='closed', email='c@example.com')

        self.client.force_login(self.support)
        response = self.client.get('/api/v1/cms/contact/submissions-stats/?status=new')
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['new'], 2)
        self.assertEqual(response.data['closed'], 0)

    def test_unrelated_cms_api_rejected_for_leads_only_user(self):
        self.client.force_login(self.support)
        response = self.client.get('/api/v1/cms/services/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_lead_login_logout_activity_logged(self):
        user = User.objects.create_user(
            username='leadsuser',
            email='leads@example.com',
            password='testpass123',
            role=User.ROLE_SUPPORT_AGENT,
            is_active=True,
        )
        self.client.post('/api/v1/auth/login/', {
            'username': 'leadsuser',
            'password': 'testpass123',
        }, format='json')
        self.assertTrue(
            ActivityLog.objects.filter(action='lead_login', module='leads').exists()
        )
        self.client.post('/api/v1/auth/logout/')
        self.assertTrue(
            ActivityLog.objects.filter(action='lead_logout', module='leads').exists()
        )
