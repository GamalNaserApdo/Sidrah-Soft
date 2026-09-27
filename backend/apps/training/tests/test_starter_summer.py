"""
Tests for Sidrah Starter Courses + Summer Training product lines.

Covers:
- Product classification (starter/summer branch choices)
- Public listing filtered by branch
- Starter detail (curriculum, price, registration form settings)
- Starter/summer native registration + UTM persistence
- Professional pricing regression (numeric price preserved in API/DB)
- CMS RBAC + branch filtering + starter CRUD
- Certificate workflow regression on a starter registration
"""
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.training.models import (
    Certificate,
    ModuleTopic,
    Program,
    ProgramLanding,
    ProgramModule,
    TrainingRegistration,
)

User = get_user_model()

PROGRAMS_URL = '/api/v1/training/programs/'
CMS_PROGRAMS_URL = '/api/v1/cms/training/'

# Disable rate limiting for registration tests (the shared suite fires many
# registration POSTs in one process and would otherwise trip the 5/m throttle).
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


def make_program(slug, branch, **kwargs):
    program = Program.objects.create(
        slug=slug,
        title_en=kwargs.pop('title_en', slug.title()),
        title_ar=kwargs.pop('title_ar', ''),
        short_description_en='desc',
        short_description_ar='desc',
        branch=branch,
        status='active',
        registration_open=True,
        **kwargs,
    )
    return program


def make_landing(program, price=None, show_pricing=True):
    return ProgramLanding.objects.create(
        program=program,
        current_price=price,
        currency='EGP',
        show_pricing=show_pricing,
        show_registration_form=True,
    )


def complete(registration):
    for status in ('reviewed', 'accepted', 'enrolled', 'completed'):
        registration.status = status
        registration.save()
    return registration


class BranchChoiceTests(TestCase):
    def test_starter_and_summer_are_valid_branches(self):
        choices = dict(Program.BRANCH_CHOICES)
        self.assertIn('starter', choices)
        self.assertIn('summer', choices)
        self.assertIn('professional', choices)
        self.assertIn('secondary', choices)


class StarterListingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.starter = make_program('starter-python', 'starter')
        make_landing(self.starter, price=99)
        self.prof = make_program('pro-python', 'professional')
        make_landing(self.prof, price=6000)
        self.summer = make_program('summer-training', 'summer')
        make_landing(self.summer, price=None, show_pricing=False)

    def test_branch_filter_returns_only_starter(self):
        response = self.client.get(PROGRAMS_URL, {'branch': 'starter'})
        self.assertEqual(response.status_code, 200)
        slugs = [p['slug'] for p in response.data]
        self.assertIn('starter-python', slugs)
        self.assertNotIn('pro-python', slugs)
        self.assertNotIn('summer-training', slugs)

    def test_branch_filter_returns_only_summer(self):
        response = self.client.get(PROGRAMS_URL, {'branch': 'summer'})
        self.assertEqual(response.status_code, 200)
        slugs = [p['slug'] for p in response.data]
        self.assertEqual(slugs, ['summer-training'])

    def test_branch_filter_returns_only_professional(self):
        # The test DB is pre-seeded with professional programs via a data
        # migration, so assert classification correctness rather than an
        # exact single-item list.
        response = self.client.get(PROGRAMS_URL, {'branch': 'professional'})
        slugs = [p['slug'] for p in response.data]
        self.assertIn('pro-python', slugs)
        self.assertNotIn('starter-python', slugs)
        self.assertNotIn('summer-training', slugs)
        self.assertTrue(all(p['branch'] == 'professional' for p in response.data))

    def test_starter_list_exposes_price_and_currency(self):
        response = self.client.get(PROGRAMS_URL, {'branch': 'starter'})
        starter = next(p for p in response.data if p['slug'] == 'starter-python')
        self.assertEqual(float(starter['current_price']), 99.0)
        self.assertEqual(starter['currency'], 'EGP')

    def test_starter_list_exposes_branch(self):
        response = self.client.get(PROGRAMS_URL, {'branch': 'starter'})
        self.assertEqual(response.data[0]['branch'], 'starter')


class StarterDetailTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.program = make_program('starter-data-analysis', 'starter', title_en='Data Analysis')
        make_landing(self.program, price=99)
        module = ProgramModule.objects.create(
            program=self.program, title_en='Week 1 — Excel', is_published=True, display_order=0
        )
        ModuleTopic.objects.create(module=module, title_en='Formulas', display_order=0)
        ModuleTopic.objects.create(module=module, title_en='Pivot tables', display_order=1)

    def test_starter_detail_returns_branch(self):
        response = self.client.get(f'{PROGRAMS_URL}starter-data-analysis/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['branch'], 'starter')

    def test_starter_detail_returns_price(self):
        response = self.client.get(f'{PROGRAMS_URL}starter-data-analysis/')
        self.assertEqual(float(response.data['landing']['current_price']), 99.0)
        self.assertTrue(response.data['landing']['show_pricing'])

    def test_starter_detail_returns_curriculum(self):
        response = self.client.get(f'{PROGRAMS_URL}starter-data-analysis/')
        modules = response.data['curriculum_modules']
        self.assertEqual(len(modules), 1)
        self.assertEqual(modules[0]['title_en'], 'Week 1 — Excel')
        self.assertEqual(len(modules[0]['topics']), 2)

    def test_starter_detail_has_registration_form_settings(self):
        response = self.client.get(f'{PROGRAMS_URL}starter-data-analysis/')
        self.assertTrue(response.data['landing']['show_registration_form'])
        self.assertTrue(response.data['registration_open'])
        self.assertTrue(response.data['registration_available'])


@override_settings(REST_FRAMEWORK=THROTTLE_OVERRIDE)
class StarterRegistrationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.program = make_program('starter-flutter', 'starter')
        make_landing(self.program, price=99)

    def _payload(self, **over):
        data = {
            'full_name': 'Starter Student',
            'email': 'starter@example.com',
            'phone': '01012345678',
            'privacy_policy_consent': True,
            'preferred_language': 'en',
        }
        data.update(over)
        return data

    def test_starter_registration_creates_record(self):
        response = self.client.post(
            f'{PROGRAMS_URL}starter-flutter/register/', self._payload(), format='json'
        )
        self.assertEqual(response.status_code, 201)
        reg = TrainingRegistration.objects.get(email='starter@example.com')
        self.assertEqual(reg.program.slug, 'starter-flutter')
        self.assertEqual(reg.program.branch, 'starter')

    def test_starter_registration_persists_utm(self):
        payload = self._payload(
            utm_source='ads', utm_medium='cpc', utm_campaign='starter_launch',
            utm_content='ad1', utm_term='flutter',
            referrer='https://google.com', landing_page_url='/training/starter-flutter',
        )
        response = self.client.post(
            f'{PROGRAMS_URL}starter-flutter/register/', payload, format='json'
        )
        self.assertEqual(response.status_code, 201)
        reg = TrainingRegistration.objects.get(email='starter@example.com')
        self.assertEqual(reg.utm_source, 'ads')
        self.assertEqual(reg.utm_campaign, 'starter_launch')
        self.assertEqual(reg.utm_medium, 'cpc')
        self.assertEqual(reg.utm_content, 'ad1')
        self.assertEqual(reg.utm_term, 'flutter')
        self.assertEqual(reg.landing_page_url, '/training/starter-flutter')

    def test_starter_registration_requires_consent(self):
        payload = self._payload(privacy_policy_consent=False)
        response = self.client.post(
            f'{PROGRAMS_URL}starter-flutter/register/', payload, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_honeypot_submission_is_rejected(self):
        # Backend rejects a filled honeypot field (bot) with 400 and no record.
        # (The frontend separately short-circuits honeypots before submitting.)
        payload = self._payload(website_field='bot')
        response = self.client.post(
            f'{PROGRAMS_URL}starter-flutter/register/', payload, format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(TrainingRegistration.objects.count(), 0)


@override_settings(REST_FRAMEWORK=THROTTLE_OVERRIDE)
class SummerRegistrationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.program = make_program('summer-training', 'summer')
        make_landing(self.program, price=None, show_pricing=False)

    def test_summer_registration_creates_record(self):
        response = self.client.post(
            f'{PROGRAMS_URL}summer-training/register/',
            {
                'full_name': 'Summer Student',
                'email': 'summer@example.com',
                'phone': '01099998888',
                'privacy_policy_consent': True,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        reg = TrainingRegistration.objects.get(email='summer@example.com')
        self.assertEqual(reg.program.branch, 'summer')


class ProfessionalPricingRegressionTests(TestCase):
    """
    Campaign pricing suppression is enforced at the public API boundary.

    When SiteSetting.campaign_pricing_mode is True (the default), professional
    course prices MUST NOT appear in public API responses. Starter prices
    (99 EGP) remain public. CMS/admin endpoints continue to expose the full
    internal price for management.
    """

    def setUp(self):
        self.client = APIClient()
        self.prof = make_program('pro-frontend', 'professional')
        make_landing(self.prof, price=6000)
        self.starter = make_program('starter-price-check', 'starter')
        make_landing(self.starter, price=99)
        # Ensure a SiteSetting exists with campaign pricing mode enabled.
        from apps.site_settings.models import SiteSetting
        SiteSetting.objects.all().delete()
        self.setting = SiteSetting.objects.create(
            site_name='Test',
            is_active=True,
            campaign_pricing_mode=True,
        )

    def test_professional_price_suppressed_in_api(self):
        response = self.client.get(f'{PROGRAMS_URL}pro-frontend/')
        self.assertIsNone(response.data['landing']['current_price'])
        self.assertIsNone(response.data['landing']['original_price'])
        self.assertIsNone(response.data['landing']['currency'])
        self.assertFalse(response.data['landing']['show_pricing'])

    def test_professional_price_suppressed_in_list(self):
        response = self.client.get(PROGRAMS_URL, {'branch': 'professional'})
        prog = next(p for p in response.data if p['slug'] == 'pro-frontend')
        self.assertIsNone(prog['current_price'])
        self.assertIsNone(prog['currency'])

    def test_starter_price_still_public_in_api(self):
        response = self.client.get(f'{PROGRAMS_URL}starter-price-check/')
        self.assertEqual(float(response.data['landing']['current_price']), 99.0)
        self.assertEqual(response.data['landing']['currency'], 'EGP')
        self.assertTrue(response.data['landing']['show_pricing'])

    def test_starter_price_still_public_in_list(self):
        response = self.client.get(PROGRAMS_URL, {'branch': 'starter'})
        prog = next(p for p in response.data if p['slug'] == 'starter-price-check')
        self.assertEqual(float(prog['current_price']), 99.0)
        self.assertEqual(prog['currency'], 'EGP')

    def test_professional_price_exposed_when_campaign_mode_disabled(self):
        self.setting.campaign_pricing_mode = False
        self.setting.save()
        response = self.client.get(f'{PROGRAMS_URL}pro-frontend/')
        self.assertEqual(float(response.data['landing']['current_price']), 6000.0)

    def test_cms_still_sees_professional_price(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.create_user('cms-pricing', password='pass', role='content_manager')
        self.client.force_authenticate(user)
        response = self.client.get(f'/api/v1/cms/training/{self.prof.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(float(response.data['landing']['current_price']), 6000.0)


class CMSStarterRBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.starter = make_program('starter-icdl', 'starter')
        make_landing(self.starter, price=99)

    def _as(self, role):
        user = User.objects.create_user(f'user-{role}', password='pass', role=role)
        self.client.force_authenticate(user)
        return user

    def test_content_manager_can_list_starter_programs(self):
        self._as('content_manager')
        response = self.client.get(CMS_PROGRAMS_URL, {'branch': 'starter'})
        self.assertEqual(response.status_code, 200)

    def test_content_manager_can_create_starter_program(self):
        self._as('content_manager')
        response = self.client.post(CMS_PROGRAMS_URL, {
            'slug': 'starter-new-course',
            'title_en': 'New Starter',
            'branch': 'starter',
            'status': 'draft',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Program.objects.get(slug='starter-new-course').branch, 'starter')

    def test_content_manager_can_update_starter_program(self):
        self._as('content_manager')
        response = self.client.patch(
            f'{CMS_PROGRAMS_URL}{self.starter.id}/',
            {'title_en': 'Updated Starter'}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.starter.refresh_from_db()
        self.assertEqual(self.starter.title_en, 'Updated Starter')

    def test_lms_admin_can_manage_starter_program(self):
        self._as('lms_admin')
        response = self.client.patch(
            f'{CMS_PROGRAMS_URL}{self.starter.id}/',
            {'short_description_en': 'LMS update'}, format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_editor_cannot_access_training_programs(self):
        self._as('editor')
        self.assertEqual(self.client.get(CMS_PROGRAMS_URL).status_code, 403)
        self.assertEqual(self.client.post(CMS_PROGRAMS_URL, {
            'slug': 'x', 'title_en': 'X', 'branch': 'starter'
        }, format='json').status_code, 403)
        self.assertEqual(self.client.patch(
            f'{CMS_PROGRAMS_URL}{self.starter.id}/', {'title_en': 'Hack'}, format='json'
        ).status_code, 403)

    def test_unauthenticated_cannot_access_cms_programs(self):
        response = self.client.get(CMS_PROGRAMS_URL)
        self.assertIn(response.status_code, (401, 403))


class StarterCertificateRegressionTests(TestCase):
    def test_starter_registration_supports_certificate_workflow(self):
        program = make_program('starter-cert', 'starter')
        make_landing(program, price=99)
        registration = TrainingRegistration.objects.create(
            program=program, full_name='Grad', email='grad@example.com'
        )
        self.assertFalse(registration.certificate_eligible)
        complete(registration)
        self.assertTrue(registration.certificate_eligible)
        cert = Certificate.objects.create(training_registration=registration)
        self.assertRegex(cert.reference, r'^SDR-TRN-\d{4}-[A-Z0-9]{6}$')
