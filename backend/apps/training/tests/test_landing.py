"""Tests for landing page models, APIs, and CMS workflows."""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from apps.training.models import (
    Instructor,
    ModuleTopic,
    Program,
    ProgramFAQ,
    ProgramInstructor,
    ProgramLanding,
    ProgramModule,
    ProgramTestimonial,
)

User = get_user_model()


def _admin_user():
    return User.objects.create_user(
        username='admin_test', email='admin@test.com',
        password='testpass123', role='admin', is_active=True,
    )


def _create_program(slug='test-course', status='active'):
    return Program.objects.create(
        slug=slug, title_en='Test Course', title_ar='كورس تجريبي',
        branch='professional', status=status,
        registration_open=True,
        registration_url='https://forms.gle/tjHRqBZrkNYtrWNL7',
    )


class ProgramLandingModelTests(TestCase):
    def setUp(self):
        self.program = _create_program()

    def test_landing_no_persistent_preview_token(self):
        """Preview tokens are NOT stored in the database — they are short-lived signed tokens."""
        landing = ProgramLanding.objects.create(program=self.program)
        self.assertFalse(hasattr(landing, 'preview_token'))

    def test_price_validation_negative(self):
        landing = ProgramLanding(program=self.program, current_price=Decimal('-100'))
        with self.assertRaises(ValidationError):
            landing.full_clean()

    def test_price_validation_original_must_be_greater(self):
        landing = ProgramLanding(
            program=self.program,
            current_price=Decimal('6000'),
            original_price=Decimal('5000'),
        )
        with self.assertRaises(ValidationError):
            landing.full_clean()

    def test_discount_percentage(self):
        landing = ProgramLanding(
            program=self.program,
            current_price=Decimal('6000'),
            original_price=Decimal('10000'),
        )
        self.assertEqual(landing.discount_percentage, 40)

    def test_discount_percentage_no_original(self):
        landing = ProgramLanding(
            program=self.program,
            current_price=Decimal('6000'),
        )
        self.assertIsNone(landing.discount_percentage)

    def test_video_youtube_requires_url(self):
        landing = ProgramLanding(
            program=self.program,
            intro_video_type='youtube',
        )
        with self.assertRaises(ValidationError):
            landing.full_clean()

    def test_video_uploaded_requires_file(self):
        landing = ProgramLanding(
            program=self.program,
            intro_video_type='uploaded',
        )
        with self.assertRaises(ValidationError):
            landing.full_clean()


class ProgramModuleModelTests(TestCase):
    def setUp(self):
        self.program = _create_program()

    def test_module_ordering(self):
        m1 = ProgramModule.objects.create(program=self.program, title_en='Module 1', display_order=2)
        m2 = ProgramModule.objects.create(program=self.program, title_en='Module 2', display_order=1)
        modules = list(self.program.curriculum_modules.all())
        self.assertEqual(modules[0], m2)
        self.assertEqual(modules[1], m1)

    def test_topic_ordering(self):
        module = ProgramModule.objects.create(program=self.program, title_en='Module 1')
        t1 = ModuleTopic.objects.create(module=module, title_en='Topic 1', display_order=2)
        t2 = ModuleTopic.objects.create(module=module, title_en='Topic 2', display_order=1)
        topics = list(module.topics.all())
        self.assertEqual(topics[0], t2)
        self.assertEqual(topics[1], t1)


class InstructorModelTests(TestCase):
    def setUp(self):
        self.program = _create_program()

    def test_instructor_reuse_across_programs(self):
        instructor = Instructor.objects.create(name_en='John Doe')
        program2 = _create_program(slug='test-course-2')
        ProgramInstructor.objects.create(program=self.program, instructor=instructor, display_order=0)
        ProgramInstructor.objects.create(program=program2, instructor=instructor, display_order=0)
        self.assertEqual(instructor.program_instructors.count(), 2)

    def test_unique_program_instructor(self):
        instructor = Instructor.objects.create(name_en='Jane Doe')
        ProgramInstructor.objects.create(program=self.program, instructor=instructor)
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            ProgramInstructor.objects.create(program=self.program, instructor=instructor)


class ProgramTestimonialModelTests(TestCase):
    def setUp(self):
        self.program = _create_program()

    def test_default_not_approved(self):
        t = ProgramTestimonial.objects.create(
            program=self.program, student_name_en='Student 1', rating=5
        )
        self.assertFalse(t.is_approved)

    def test_rating_validation(self):
        t = ProgramTestimonial(program=self.program, student_name_en='Student 2', rating=6)
        with self.assertRaises(ValidationError):
            t.full_clean()

    def test_rating_min_validation(self):
        t = ProgramTestimonial(program=self.program, student_name_en='Student 3', rating=0)
        with self.assertRaises(ValidationError):
            t.full_clean()


class PublicAPITests(TestCase):
    def setUp(self):
        self.program = _create_program()
        self.landing = ProgramLanding.objects.create(
            program=self.program,
            headline_en='Test Headline',
            current_price=Decimal('6000'),
            currency='EGP',
        )
        self.client = APIClient()

    def test_program_detail_includes_landing(self):
        response = self.client.get(f'/api/v1/training/programs/{self.program.slug}/')
        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertIn('landing', data)
        self.assertEqual(data['landing']['headline_en'], 'Test Headline')
        self.assertEqual(data['landing']['current_price'], '6000.00')
        self.assertEqual(data['landing']['currency'], 'EGP')

    def test_draft_not_visible_publicly(self):
        self.program.status = 'draft'
        self.program.save()
        response = self.client.get(f'/api/v1/training/programs/{self.program.slug}/')
        self.assertEqual(response.status_code, 404)

    def test_archived_not_visible_publicly(self):
        self.program.status = 'archived'
        self.program.save()
        response = self.client.get(f'/api/v1/training/programs/{self.program.slug}/')
        self.assertEqual(response.status_code, 404)

    def test_preview_requires_token(self):
        response = self.client.get(f'/api/v1/training/programs/{self.program.slug}/preview/')
        self.assertEqual(response.status_code, 403)

    def test_preview_with_valid_signed_token(self):
        from apps.training.preview_service import generate_preview_token
        self.program.status = 'draft'
        self.program.save()
        token = generate_preview_token(self.program.slug)
        response = self.client.get(
            f'/api/v1/training/programs/{self.program.slug}/preview/?token={token}'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'], self.program.slug)

    def test_preview_with_invalid_token(self):
        response = self.client.get(
            f'/api/v1/training/programs/{self.program.slug}/preview/?token=invalid'
        )
        self.assertEqual(response.status_code, 403)

    def test_preview_token_bound_to_program_slug(self):
        """A token generated for one program should not work for another."""
        from apps.training.preview_service import generate_preview_token
        token = generate_preview_token('other-program-slug')
        response = self.client.get(
            f'/api/v1/training/programs/{self.program.slug}/preview/?token={token}'
        )
        self.assertEqual(response.status_code, 403)

    def test_preview_token_expiry(self):
        """An expired token should be rejected."""
        from apps.training.preview_service import generate_preview_token, is_preview_token_valid
        token = generate_preview_token(self.program.slug)
        # Verify it's valid now
        self.assertTrue(is_preview_token_valid(token, self.program.slug))
        # Now verify with max_age=0 (effectively expired)
        import time
        time.sleep(1)
        self.assertFalse(is_preview_token_valid(token, self.program.slug, max_age=0))

    def test_only_approved_testimonials_visible(self):
        ProgramTestimonial.objects.create(
            program=self.program, student_name_en='Approved', rating=5, is_approved=True
        )
        ProgramTestimonial.objects.create(
            program=self.program, student_name_en='Not Approved', rating=4, is_approved=False
        )
        response = self.client.get(f'/api/v1/training/programs/{self.program.slug}/')
        testimonials = response.data['testimonials']
        self.assertEqual(len(testimonials), 1)
        self.assertEqual(testimonials[0]['student_name_en'], 'Approved')

    def test_only_published_modules_visible(self):
        m1 = ProgramModule.objects.create(program=self.program, title_en='Published', is_published=True)
        m2 = ProgramModule.objects.create(program=self.program, title_en='Unpublished', is_published=False)
        response = self.client.get(f'/api/v1/training/programs/{self.program.slug}/')
        modules = response.data['curriculum_modules']
        self.assertEqual(len(modules), 1)
        self.assertEqual(modules[0]['title_en'], 'Published')


class CMSAPITests(TestCase):
    def setUp(self):
        self.user = _admin_user()
        self.program = _create_program()
        self.landing = ProgramLanding.objects.create(program=self.program)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_cms_program_detail_includes_landing(self):
        response = self.client.get(f'/api/v1/cms/training/{self.program.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('landing', response.data)
        self.assertIn('curriculum_modules', response.data)
        self.assertIn('faqs', response.data)
        self.assertIn('testimonials', response.data)
        self.assertIn('instructors', response.data)

    def test_cms_update_with_landing(self):
        response = self.client.patch(f'/api/v1/cms/training/{self.program.id}/', {
            'landing': {
                'headline_en': 'Updated Headline',
                'current_price': '7000',
                'currency': 'EGP',
            }
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.landing.refresh_from_db()
        self.assertEqual(self.landing.headline_en, 'Updated Headline')
        self.assertEqual(self.landing.current_price, Decimal('7000'))

    def test_cms_publish(self):
        self.program.status = 'draft'
        self.program.save()
        response = self.client.post(f'/api/v1/cms/training/{self.program.id}/publish/')
        self.assertEqual(response.status_code, 200)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, 'active')

    def test_cms_unpublish(self):
        response = self.client.post(f'/api/v1/cms/training/{self.program.id}/unpublish/')
        self.assertEqual(response.status_code, 200)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, 'draft')

    def test_cms_archive(self):
        response = self.client.post(f'/api/v1/cms/training/{self.program.id}/archive/')
        self.assertEqual(response.status_code, 200)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, 'archived')

    def test_cms_create_module(self):
        response = self.client.post(f'/api/v1/cms/training/{self.program.id}/modules/', {
            'title_en': 'New Module',
            'title_ar': 'وحدة جديدة',
            'display_order': 0,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ProgramModule.objects.filter(program=self.program, title_en='New Module').exists())

    def test_cms_create_faq(self):
        response = self.client.post(f'/api/v1/cms/training/{self.program.id}/faqs/', {
            'question_en': 'Is this course online?',
            'answer_en': 'Yes, it is fully online.',
            'display_order': 0,
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_cms_create_testimonial(self):
        response = self.client.post(f'/api/v1/cms/training/{self.program.id}/testimonials/', {
            'student_name_en': 'Test Student',
            'content_en': 'Great course!',
            'rating': 5,
            'is_approved': False,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        t = ProgramTestimonial.objects.get(student_name_en='Test Student')
        self.assertFalse(t.is_approved)

    def test_cms_approve_testimonial(self):
        t = ProgramTestimonial.objects.create(
            program=self.program, student_name_en='Test', rating=5, is_approved=False
        )
        response = self.client.post(f'/api/v1/cms/training/testimonials/{t.id}/approve/')
        self.assertEqual(response.status_code, 200)
        t.refresh_from_db()
        self.assertTrue(t.is_approved)

    def test_cms_create_instructor(self):
        response = self.client.post('/api/v1/cms/training/instructors/', {
            'name_en': 'John Instructor',
            'title_en': 'Senior Developer',
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_cms_assign_instructor(self):
        instructor = Instructor.objects.create(name_en='Jane Teacher')
        response = self.client.post(f'/api/v1/cms/training/{self.program.id}/instructors/', {
            'instructor': instructor.id,
            'display_order': 0,
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_cms_nested_reorder(self):
        m1 = ProgramModule.objects.create(program=self.program, title_en='M1', display_order=0)
        m2 = ProgramModule.objects.create(program=self.program, title_en='M2', display_order=1)
        response = self.client.post('/api/v1/cms/training/reorder/modules/', {
            'items': [
                {'id': m2.id, 'order': 0},
                {'id': m1.id, 'order': 1},
            ]
        }, format='json')
        self.assertEqual(response.status_code, 200)
        m1.refresh_from_db()
        m2.refresh_from_db()
        self.assertEqual(m1.display_order, 1)
        self.assertEqual(m2.display_order, 0)

    def test_cms_price_validation(self):
        response = self.client.patch(f'/api/v1/cms/training/{self.program.id}/', {
            'landing': {
                'current_price': '-100',
            }
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_cms_unauthenticated_denied(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(f'/api/v1/cms/training/{self.program.id}/')
        self.assertIn(response.status_code, (401, 403))


class DataMigrationTests(TestCase):
    """Verify the data migration seeded the 7 professional programs correctly."""
    EXPECTED_SLUGS = [
        'frontend-development',
        'backend-development',
        'flutter-development',
        'basic-python',
        'cpp-programming',
        'problem-solving-data-structures',
        'devops-engineering',
    ]

    def test_all_programs_seeded(self):
        for slug in self.EXPECTED_SLUGS:
            self.assertTrue(Program.objects.filter(slug=slug).exists(), f'Missing: {slug}')

    def test_all_programs_have_landing(self):
        for slug in self.EXPECTED_SLUGS:
            program = Program.objects.get(slug=slug)
            self.assertTrue(hasattr(program, 'landing'), f'No landing for: {slug}')

    def test_all_programs_price_6000(self):
        for slug in self.EXPECTED_SLUGS:
            program = Program.objects.get(slug=slug)
            self.assertEqual(program.landing.current_price, Decimal('6000.00'))
            self.assertEqual(program.landing.currency, 'EGP')

    def test_all_programs_registration_open(self):
        for slug in self.EXPECTED_SLUGS:
            program = Program.objects.get(slug=slug)
            self.assertTrue(program.registration_open)
            self.assertEqual(program.registration_url, 'https://forms.gle/tjHRqBZrkNYtrWNL7')

    def test_all_programs_have_curriculum(self):
        for slug in self.EXPECTED_SLUGS:
            program = Program.objects.get(slug=slug)
            self.assertGreater(program.curriculum_modules.count(), 0, f'No modules for: {slug}')

    def test_all_programs_have_faqs(self):
        for slug in self.EXPECTED_SLUGS:
            program = Program.objects.get(slug=slug)
            self.assertGreater(program.program_faqs.count(), 0, f'No FAQs for: {slug}')
