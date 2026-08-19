"""Tests for Training & Education API endpoints."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.training.models import Program

User = get_user_model()


class PublicProgramAPITests(TestCase):
    """Test public (unauthenticated) training program endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.active_program = Program.objects.create(
            slug='intro-programming',
            title_en='Introduction to Programming',
            title_ar='مقدمة في البرمجة',
            short_description_en='Learn the basics of programming.',
            short_description_ar='تعلم أساسيات البرمجة.',
            branch=Program.BRANCH_SECONDARY,
            status=Program.STATUS_ACTIVE,
            audience_levels=['first_secondary', 'second_secondary'],
            display_order=1,
        )
        self.draft_program = Program.objects.create(
            slug='advanced-algorithms',
            title_en='Advanced Algorithms',
            title_ar='خوارزميات متقدمة',
            branch=Program.BRANCH_SECONDARY,
            status=Program.STATUS_DRAFT,
            display_order=2,
        )
        self.professional_program = Program.objects.create(
            slug='devops-mastery',
            title_en='DevOps Mastery',
            title_ar='إتقان DevOps',
            branch=Program.BRANCH_PROFESSIONAL,
            status=Program.STATUS_ACTIVE,
            display_order=3,
        )

    def test_list_active_programs(self):
        """Public listing returns only active programs."""
        resp = self.client.get('/api/v1/training/programs/')
        self.assertEqual(resp.status_code, 200)
        slugs = [p['slug'] for p in resp.data]
        self.assertIn('intro-programming', slugs)
        self.assertIn('devops-mastery', slugs)
        self.assertNotIn('advanced-algorithms', slugs)

    def test_filter_by_branch(self):
        """Filtering by branch returns only matching programs."""
        resp = self.client.get('/api/v1/training/programs/?branch=secondary')
        self.assertEqual(resp.status_code, 200)
        slugs = [p['slug'] for p in resp.data]
        self.assertIn('intro-programming', slugs)
        self.assertNotIn('devops-mastery', slugs)

    def test_detail_by_slug(self):
        """Detail endpoint returns full program data by slug."""
        resp = self.client.get('/api/v1/training/programs/intro-programming/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['title_en'], 'Introduction to Programming')
        self.assertEqual(resp.data['audience_levels'], ['first_secondary', 'second_secondary'])

    def test_detail_draft_not_found(self):
        """Draft programs are not exposed via public detail."""
        resp = self.client.get('/api/v1/training/programs/advanced-algorithms/')
        self.assertEqual(resp.status_code, 404)

    def test_detail_nonexistent_slug(self):
        """Nonexistent slug returns 404."""
        resp = self.client.get('/api/v1/training/programs/nonexistent/')
        self.assertEqual(resp.status_code, 404)


class CMSProgramAPITests(TestCase):
    """Test CMS (authenticated) training program endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.superuser = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='testpass123',
        )
        self.regular_user = User.objects.create_user(
            username='regular_test',
            email='regular@test.com',
            password='testpass123',
        )
        self.program = Program.objects.create(
            slug='test-program',
            title_en='Test Program',
            title_ar='برنامج تجريبي',
            branch=Program.BRANCH_SECONDARY,
            status=Program.STATUS_DRAFT,
            display_order=0,
        )

    def test_cms_requires_auth(self):
        """CMS endpoints require authentication."""
        resp = self.client.get('/api/v1/cms/training/')
        self.assertEqual(resp.status_code, 403)

    def test_cms_list_as_superuser(self):
        """Superuser can list all programs including drafts."""
        self.client.force_authenticate(self.superuser)
        resp = self.client.get('/api/v1/cms/training/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['count'], 1)

    def test_cms_create(self):
        """Superuser can create a program."""
        self.client.force_authenticate(self.superuser)
        data = {
            'slug': 'new-program',
            'title_en': 'New Program',
            'title_ar': 'برنامج جديد',
            'branch': 'secondary',
            'status': 'draft',
            'audience_levels': ['baccalaureate'],
            'display_order': 5,
        }
        resp = self.client.post('/api/v1/cms/training/', data, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Program.objects.filter(slug='new-program').exists())

    def test_cms_update(self):
        """Superuser can update a program."""
        self.client.force_authenticate(self.superuser)
        data = {'title_en': 'Updated Title', 'status': 'active'}
        resp = self.client.patch(f'/api/v1/cms/training/{self.program.id}/', data, format='json')
        self.assertEqual(resp.status_code, 200)
        self.program.refresh_from_db()
        self.assertEqual(self.program.title_en, 'Updated Title')
        self.assertEqual(self.program.status, 'active')

    def test_cms_delete(self):
        """Superuser can delete a program."""
        self.client.force_authenticate(self.superuser)
        resp = self.client.delete(f'/api/v1/cms/training/{self.program.id}/')
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(Program.objects.filter(id=self.program.id).exists())

    def test_cms_validation(self):
        """Create without required slug fails."""
        self.client.force_authenticate(self.superuser)
        data = {'title_en': 'No Slug Program', 'branch': 'secondary'}
        resp = self.client.post('/api/v1/cms/training/', data, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_cms_search(self):
        """CMS search filters by title."""
        self.client.force_authenticate(self.superuser)
        resp = self.client.get('/api/v1/cms/training/?search=Test')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['count'], 1)

    def test_cms_filter_branch(self):
        """CMS branch filter works."""
        self.client.force_authenticate(self.superuser)
        resp = self.client.get('/api/v1/cms/training/?branch=professional')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['count'], 0)


class ActivityLogTests(TestCase):
    """Test that CMS mutations create activity logs."""

    def setUp(self):
        self.client = APIClient()
        self.superuser = User.objects.create_superuser(
            username='log_admin',
            email='log@test.com',
            password='testpass123',
        )
        self.client.force_authenticate(self.superuser)

    def test_create_logs_activity(self):
        """Creating a program logs a 'create' activity."""
        from apps.activity_logs.models import ActivityLog

        data = {
            'slug': 'logged-program',
            'title_en': 'Logged Program',
            'branch': 'secondary',
            'status': 'draft',
            'display_order': 0,
        }
        self.client.post('/api/v1/cms/training/', data, format='json')

        log = ActivityLog.objects.filter(module='training', action='create').first()
        self.assertIsNotNone(log)
        self.assertEqual(log.metadata.get('slug'), 'logged-program')
