"""Regression tests for the Starter 499 EGP pricing implementation.

Covers the canonical pricing decision:
- ``ProgramLanding.current_price`` is the single source of truth.
- Seed data converges to 499 and can never revert a course to 99.
- The public Programs API returns the real price.
- Public campaign copy cannot contradict ``current_price``.
"""
import importlib
from decimal import Decimal
from pathlib import Path

from django.apps import apps as global_apps
from django.conf import settings
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.training.models import (
    Program,
    ProgramLanding,
    StarterCampaignConfig,
    TrainingRegistration,
)

STARTER_SLUGS = [
    'starter-python-programming',
    'starter-frontend-development',
    'starter-data-analysis',
    'starter-flutter-development',
    'starter-icdl-digital-skills',
]

EXPECTED_PRICE = Decimal('499.00')
LEGACY_PRICE = Decimal('99.00')

REPO_ROOT = Path(settings.BASE_DIR).resolve().parent
CAMPAIGN_PAGE = (
    REPO_ROOT / 'src' / 'components' / 'starterCampaign' / 'StarterCampaignRenderer.jsx'
)
PREVIEW_MODAL = (
    REPO_ROOT / 'src' / 'components' / 'cms' / 'training' / 'StarterFormPreviewModal.jsx'
)


def _seed_starter_courses():
    call_command('seed_starter_courses', verbosity=0)


class StarterSeedPricingTests(TestCase):
    """Seed data must converge Starter landings to 499 EGP."""

    def test_five_starter_programs_seed_at_499(self):
        _seed_starter_courses()
        landings = ProgramLanding.objects.filter(program__slug__in=STARTER_SLUGS)
        self.assertEqual(landings.count(), len(STARTER_SLUGS))
        for landing in landings:
            self.assertEqual(landing.current_price, EXPECTED_PRICE, landing.program.slug)
            self.assertEqual(landing.currency, 'EGP', landing.program.slug)

    def test_seed_rerun_never_restores_99(self):
        """Re-seeding must converge to 499 even if the price was changed."""
        _seed_starter_courses()
        landing = ProgramLanding.objects.get(program__slug='starter-python-programming')
        landing.current_price = Decimal('750.00')
        landing.save(update_fields=['current_price'])

        _seed_starter_courses()
        landing.refresh_from_db()
        self.assertEqual(landing.current_price, EXPECTED_PRICE)
        self.assertNotEqual(landing.current_price, LEGACY_PRICE)

    def test_programs_api_returns_499_for_starters(self):
        _seed_starter_courses()
        client = APIClient()
        response = client.get('/api/v1/training/programs/?branch=starter')
        self.assertEqual(response.status_code, 200)
        payload = response.data
        programs = payload if isinstance(payload, list) else payload.get('results', [])
        starter = {p['slug']: p for p in programs if p['slug'] in STARTER_SLUGS}
        self.assertEqual(len(starter), len(STARTER_SLUGS))
        for slug, program in starter.items():
            self.assertEqual(Decimal(str(program['current_price'])), EXPECTED_PRICE, slug)
            self.assertEqual(program['currency'], 'EGP', slug)


class StarterRegistrationAfterPricingTests(TestCase):
    """Registration behavior must be unchanged by the price update."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        _seed_starter_courses()
        self.slug = 'starter-python-programming'
        self.url = reverse('website-registration', args=[self.slug])

    def tearDown(self):
        TrainingRegistration.objects.filter(program__slug__in=STARTER_SLUGS).delete()

    def test_registration_with_email_still_works(self):
        response = self.client.post(self.url, {
            'full_name': 'Pricing QA User',
            'email': 'pricing.qa@example.com',
            'phone': '+20 100 999 0001',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertIn(response.status_code, (200, 201))
        self.assertTrue(response.data['is_new'])

    def test_registration_without_email_still_works(self):
        response = self.client.post(self.url, {
            'full_name': 'Pricing QA NoMail',
            'email': '',
            'phone': '+20 100 999 0002',
            'privacy_policy_consent': True,
        }, format='json')
        self.assertIn(response.status_code, (200, 201))


class StarterCampaignCopyTests(TestCase):
    """The public campaign page must never advertise a stale price."""

    def _source(self, path):
        self.assertTrue(path.exists(), f'Missing source file: {path}')
        return path.read_text(encoding='utf-8')

    def test_campaign_page_has_no_legacy_99_price(self):
        source = self._source(CAMPAIGN_PAGE)
        for token in ('99 جنيه', '99 EGP', 'Start for 99', '99 فقط'):
            self.assertNotIn(token, source)

    def test_campaign_page_uses_shared_price_guard(self):
        """Hero price must derive from loaded programs, not a constant."""
        source = self._source(CAMPAIGN_PAGE)
        # Uniform-price guard: only shows a hero price when all loaded
        # programs share one price and one currency.
        self.assertIn('parsedPrices', source)
        self.assertIn('new Set(parsedPrices).size === 1', source)
        self.assertIn('sharedPrice', source)
        # Dropdown keeps using each program's own current_price.
        self.assertIn('c.current_price', source)

    def test_preview_modal_has_no_legacy_99_fallback(self):
        source = self._source(PREVIEW_MODAL)
        self.assertNotIn('99', source)

    def test_config_button_defaults_are_price_neutral(self):
        StarterCampaignConfig.objects.all().delete()
        config = StarterCampaignConfig.get_current()
        self.assertEqual(config.form_button_en, 'Register Now')
        self.assertEqual(config.form_button_ar, 'سجّل الآن')
        self.assertNotIn('99', config.form_button_en)
        self.assertNotIn('99', config.form_button_ar)


class StarterPricingMigrationTests(TestCase):
    """Migration 0020 data functions: safe forward + safe reverse."""

    def setUp(self):
        _seed_starter_courses()
        self.migration = importlib.import_module(
            'apps.training.migrations.0020_starter_pricing_499'
        )

    def test_forward_is_idempotent_and_scoped(self):
        """Forward only rewrites the legacy 99 rows, never other values."""
        custom = ProgramLanding.objects.get(program__slug='starter-data-analysis')
        custom.current_price = Decimal('600.00')
        custom.save(update_fields=['current_price'])

        self.migration.forwards(global_apps, None)

        custom.refresh_from_db()
        self.assertEqual(custom.current_price, Decimal('600.00'))
        others = ProgramLanding.objects.filter(
            program__slug__in=STARTER_SLUGS,
        ).exclude(program__slug='starter-data-analysis')
        self.assertTrue(all(l.current_price == EXPECTED_PRICE for l in others))

    def test_reverse_never_clobbers_a_manual_price(self):
        custom = ProgramLanding.objects.get(program__slug='starter-flutter-development')
        custom.current_price = Decimal('800.00')
        custom.save(update_fields=['current_price'])

        self.migration.backwards(global_apps, None)

        custom.refresh_from_db()
        self.assertEqual(custom.current_price, Decimal('800.00'))
        restored = ProgramLanding.objects.filter(
            program__slug__in=STARTER_SLUGS,
        ).exclude(program__slug='starter-flutter-development')
        self.assertTrue(all(l.current_price == LEGACY_PRICE for l in restored))

    def test_forward_normalizes_only_default_button_copy(self):
        StarterCampaignConfig.objects.all().delete()
        config = StarterCampaignConfig.get_current()
        config.form_button_en = 'Register Now — Start for 99 EGP Only'
        config.form_button_ar = 'سجّل الآن — ابدأ بـ99 جنيه فقط'
        config.save()
        custom = StarterCampaignConfig.objects.create(
            is_active=False,
            form_button_en='Grab Your Seat!',
        )

        self.migration.forwards(global_apps, None)

        config.refresh_from_db()
        custom.refresh_from_db()
        self.assertEqual(config.form_button_en, 'Register Now')
        self.assertEqual(config.form_button_ar, 'سجّل الآن')
        self.assertEqual(custom.form_button_en, 'Grab Your Seat!')


class HomepagePathCopyMigrationTests(TestCase):
    """Homepage 0005 normalizes only the stored 'starter' path copy."""

    def setUp(self):
        self.migration = importlib.import_module(
            'apps.homepage.migrations.0005_starter_price_copy_499'
        )

    def test_forward_normalizes_starter_path_only(self):
        from apps.homepage.models import HomepageSettings
        settings_obj = HomepageSettings.objects.create(
            training_paths=[
                {
                    'key': 'starter',
                    'description_en': self.migration.OLD_EN,
                    'description_ar': 'نص عربي بسعر 99 جنيه للكورس.',
                },
                {'key': 'professional', 'description_en': 'Keep me. 99 EGP stays.'},
            ],
        )
        self.migration.forwards(global_apps, None)
        settings_obj.refresh_from_db()
        starter, professional = settings_obj.training_paths
        self.assertEqual(starter['description_en'], self.migration.NEW_EN)
        self.assertIn('499 جنيه', starter['description_ar'])
        # Other path entries are never touched.
        self.assertEqual(professional['description_en'], 'Keep me. 99 EGP stays.')

    def test_reverse_only_restores_normalized_text(self):
        from apps.homepage.models import HomepageSettings
        settings_obj = HomepageSettings.objects.create(
            training_paths=[
                {'key': 'starter', 'description_en': self.migration.NEW_EN},
                {'key': 'starter', 'description_en': 'Custom CMS edit — do not revert.'},
            ],
        )
        self.migration.backwards(global_apps, None)
        settings_obj.refresh_from_db()
        self.assertEqual(
            settings_obj.training_paths[0]['description_en'],
            self.migration.OLD_EN,
        )
        self.assertEqual(
            settings_obj.training_paths[1]['description_en'],
            'Custom CMS edit — do not revert.',
        )
