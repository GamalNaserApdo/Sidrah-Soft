"""Tests for Courses Offers: models, public API, CMS management, and registration
conversion eligibility (OfferCampaign -> OfferItem -> Program).
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.training.models import OfferCampaign, OfferItem, Program, TrainingRegistration

User = get_user_model()

NOW = timezone.now()

# Disable rate limiting for registration tests (the shared suite fires many
# registration POSTs in one process and would otherwise trip the 5/m throttle).
THROTTLE_OVERRIDE = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'website_registration': '1000/m',
        'certificate_verify': '1000/m',
    },
}


class OfferCampaignModelTests(TestCase):
    """Campaign scheduling, lifecycle status, and constraints."""

    def setUp(self):
        self.program = Program.objects.create(
            slug='offer-model-program', title_en='Model Program', status='active'
        )

    def _campaign(self, **kwargs):
        defaults = dict(
            slug='test-campaign',
            title_en='Test Campaign',
            start_date=NOW - timedelta(days=1),
            is_active=True,
        )
        defaults.update(kwargs)
        return OfferCampaign.objects.create(**defaults)

    def test_active_now_includes_active_campaign_in_window(self):
        campaign = self._campaign()
        self.assertTrue(campaign.is_active_now)
        self.assertIn(campaign, OfferCampaign.objects.active_now())
        self.assertEqual(campaign.status, 'active')

    def test_open_ended_campaign_is_active_now(self):
        campaign = self._campaign(slug='open-ended', end_date=None)
        self.assertTrue(campaign.is_active_now)

    def test_scheduled_campaign_excluded_from_active_now(self):
        campaign = self._campaign(
            slug='scheduled', start_date=NOW + timedelta(days=2)
        )
        self.assertFalse(campaign.is_active_now)
        self.assertNotIn(campaign, OfferCampaign.objects.active_now())
        self.assertEqual(campaign.status, 'scheduled')
        self.assertIn(campaign, OfferCampaign.objects.scheduled())

    def test_expired_campaign_excluded_from_active_now(self):
        campaign = self._campaign(
            slug='expired', start_date=NOW - timedelta(days=10),
            end_date=NOW - timedelta(days=1),
        )
        self.assertFalse(campaign.is_active_now)
        self.assertEqual(campaign.status, 'expired')
        self.assertIn(campaign, OfferCampaign.objects.expired())

    def test_inactive_campaign_excluded_from_active_now(self):
        campaign = self._campaign(slug='inactive', is_active=False)
        self.assertFalse(campaign.is_active_now)
        self.assertEqual(campaign.status, 'inactive')

    def test_future_window_within_active_bounds(self):
        """A campaign starting exactly now is active (start_date <= now)."""
        campaign = self._campaign(slug='starting-now', start_date=NOW)
        self.assertTrue(campaign.is_active_now)

    def test_end_before_start_rejected_by_clean(self):
        campaign = OfferCampaign(
            slug='invalid-dates',
            title_en='Invalid',
            start_date=NOW + timedelta(days=5),
            end_date=NOW + timedelta(days=1),
        )
        with self.assertRaises(ValidationError):
            campaign.full_clean()

    def test_expired_campaigns_are_never_deleted(self):
        """Expiry removes campaigns from public surfaces but keeps history."""
        campaign = self._campaign(
            slug='history',
            start_date=NOW - timedelta(days=30),
            end_date=NOW - timedelta(days=10),
        )
        self.assertFalse(campaign.is_active_now)
        self.assertTrue(OfferCampaign.objects.filter(pk=campaign.pk).exists())


class OfferItemModelTests(TestCase):
    """Item constraints, price policy, and effective-value fallbacks."""

    def setUp(self):
        self.program = Program.objects.create(
            slug='offer-item-program', title_en='Item Program', status='active'
        )
        self.campaign = OfferCampaign.objects.create(
            slug='item-campaign',
            title_en='Item Campaign',
            start_date=NOW - timedelta(days=1),
            is_active=True,
        )

    def test_duplicate_program_in_same_campaign_rejected(self):
        OfferItem.objects.create(campaign=self.campaign, program=self.program)
        with self.assertRaises(IntegrityError):
            OfferItem.objects.create(campaign=self.campaign, program=self.program)

    def test_same_program_allowed_in_different_campaigns(self):
        other = OfferCampaign.objects.create(
            slug='other-campaign', title_en='Other', start_date=NOW, is_active=True
        )
        OfferItem.objects.create(campaign=self.campaign, program=self.program)
        OfferItem.objects.create(campaign=other, program=self.program)
        self.assertEqual(OfferItem.objects.count(), 2)

    def test_negative_promo_price_rejected(self):
        item = OfferItem(
            campaign=self.campaign, program=self.program,
            promo_price=-10, show_promo_price_publicly=True,
        )
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_dangerous_cta_url_rejected(self):
        for url in ('javascript:alert(1)', 'data:text/html,x', 'vbscript:x', 'file:///etc', 'about:blank', '//evil.com'):
            with self.subTest(url=url):
                item = OfferItem(campaign=self.campaign, program=self.program, cta_url=url)
                with self.assertRaises(ValidationError):
                    item.full_clean()

    def test_safe_cta_urls_accepted(self):
        for url in ('/training/python', '#offers', 'https://example.com/x'):
            with self.subTest(url=url):
                item = OfferItem(campaign=self.campaign, program=self.program, cta_url=url)
                item.full_clean()  # Should not raise

    def test_price_visibility_defaults_to_false(self):
        """New items default to hiding promo price (Professional protection)."""
        item = OfferItem.objects.create(campaign=self.campaign, program=self.program)
        self.assertFalse(item.show_promo_price_publicly)

    def test_effective_badge_falls_back_to_campaign(self):
        item = OfferItem.objects.create(
            campaign=self.campaign, program=self.program,
        )
        self.campaign.badge_en = 'Limited-Time Offer'
        self.campaign.save()
        self.assertEqual(item.effective_badge['en'], 'Limited-Time Offer')
        item.badge_en = 'Item Override'
        item.save()
        self.assertEqual(item.effective_badge['en'], 'Item Override')

    def test_effective_copy_falls_back_to_campaign(self):
        self.campaign.description_en = 'Campaign copy'
        self.campaign.save()
        item = OfferItem.objects.create(campaign=self.campaign, program=self.program)
        self.assertEqual(item.effective_promotional_copy['en'], 'Campaign copy')


class PublicOffersAPITests(TestCase):
    """GET /api/v1/training/offers/ — visibility and price-leakage protection."""

    OFFERS_URL = '/api/v1/training/offers/'

    def setUp(self):
        self.client = APIClient()
        self.program = Program.objects.create(
            slug='api-program', title_en='API Program',
            title_ar='برنامج', status='active',
        )
        self.campaign = OfferCampaign.objects.create(
            slug='api-campaign',
            title_en='API Campaign',
            title_ar='حملة',
            description_en='API campaign description',
            badge_en='Special Offer',
            start_date=NOW - timedelta(days=1),
            is_active=True,
        )

    def _add_item(self, **kwargs):
        defaults = dict(campaign=self.campaign, program=self.program)
        defaults.update(kwargs)
        return OfferItem.objects.create(**defaults)

    def test_active_campaign_returned_with_items(self):
        self._add_item()
        response = self.client.get(self.OFFERS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['slug'], 'api-campaign')
        self.assertEqual(len(data[0]['items']), 1)

    def test_expired_campaign_hidden(self):
        self.campaign.end_date = NOW - timedelta(hours=1)
        self.campaign.save()
        self._add_item()
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(len(data), 0)

    def test_inactive_campaign_hidden(self):
        self.campaign.is_active = False
        self.campaign.save()
        self._add_item()
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(len(data), 0)

    def test_scheduled_campaign_hidden(self):
        self.campaign.start_date = NOW + timedelta(days=1)
        self.campaign.save()
        self._add_item()
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(len(data), 0)

    def test_inactive_item_hidden(self):
        self._add_item(is_active=False)
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(len(data[0]['items']), 0)

    def test_draft_program_item_hidden(self):
        self.program.status = 'draft'
        self.program.save()
        self._add_item()
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(len(data[0]['items']), 0)

    def test_hidden_promo_price_not_serialized(self):
        """CRITICAL: promo_price must be absent when visibility is False."""
        self._add_item(promo_price=1500, show_promo_price_publicly=False)
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        item = data[0]['items'][0]
        self.assertIsNone(item['promo_price'])
        self.assertIsNone(item['promo_currency'])

    def test_visible_promo_price_serialized(self):
        self._add_item(promo_price=99, promo_currency='EGP', show_promo_price_publicly=True)
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        item = data[0]['items'][0]
        self.assertEqual(item['promo_price'], '99.00')
        self.assertEqual(item['promo_currency'], 'EGP')

    def test_bilingual_fields_present(self):
        self._add_item(badge_ar='عرض خاص')
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        item = data[0]['items'][0]
        self.assertEqual(item['program_title_en'], 'API Program')
        self.assertEqual(item['program_title_ar'], 'برنامج')
        self.assertEqual(item['badge_en'], 'Special Offer')
        self.assertEqual(item['badge_ar'], 'عرض خاص')

    def test_item_cta_defaults_to_course_landing(self):
        self._add_item()
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        item = data[0]['items'][0]
        self.assertEqual(item['cta_url'], '/training/api-program')

    def test_item_cta_override_respected(self):
        self._add_item(cta_url='/training/starter')
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        item = data[0]['items'][0]
        self.assertEqual(item['cta_url'], '/training/starter')

    def test_empty_response_when_no_campaigns(self):
        self.campaign.delete()
        response = self.client.get(self.OFFERS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(data, [])

    def test_campaign_priority_ordering(self):
        second = OfferCampaign.objects.create(
            slug='priority-campaign', title_en='Second',
            start_date=NOW, is_active=True, priority=5,
        )
        self.campaign.priority = 10
        self.campaign.save()
        response = self.client.get(self.OFFERS_URL)
        data = response.json() if hasattr(response, 'json') else response.data
        self.assertEqual(data[0]['slug'], 'priority-campaign')


class CMSOffersAPITests(TestCase):
    """CMS campaign/item management: RBAC, CRUD, and validation."""

    LIST_URL = '/api/v1/cms/training/offers/'

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='offers-admin', password='pass12345',
            role='admin', is_active=True,
        )
        self.admin.is_staff = True
        self.admin.save()
        self.regular_user = User.objects.create_user(
            username='offers-regular', password='pass12345',
            role='support_agent', is_active=True,
        )
        self.program = Program.objects.create(
            slug='cms-program', title_en='CMS Program', status='active'
        )
        self.campaign = OfferCampaign.objects.create(
            slug='cms-campaign', title_en='CMS Campaign',
            start_date=NOW - timedelta(days=1), is_active=True,
        )
        self.client.force_authenticate(user=self.admin)

    def _campaign_payload(self, **overrides):
        payload = dict(
            slug='new-campaign',
            title_en='New Campaign',
            start_date=(NOW + timedelta(days=1)).isoformat(),
            is_active=False,
            priority=0,
        )
        payload.update(overrides)
        return payload

    # ── RBAC ──

    def test_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.LIST_URL)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.LIST_URL)
        self.assertIn(response.status_code, (401, 403))

    # ── Campaign CRUD ──

    def test_list_campaigns(self):
        response = self.client.get(self.LIST_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['slug'], 'cms-campaign')
        self.assertIn('status', results[0])
        self.assertIn('item_count', results[0])

    def test_create_campaign(self):
        response = self.client.post(self.LIST_URL, self._campaign_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(OfferCampaign.objects.filter(slug='new-campaign').exists())

    def test_update_campaign(self):
        response = self.client.patch(
            f'{self.LIST_URL}{self.campaign.id}/',
            {'title_en': 'Updated Title'}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.title_en, 'Updated Title')

    def test_delete_campaign(self):
        response = self.client.delete(f'{self.LIST_URL}{self.campaign.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(OfferCampaign.objects.filter(pk=self.campaign.pk).exists())

    def test_end_before_start_rejected(self):
        payload = self._campaign_payload(
            end_date=(NOW - timedelta(days=5)).isoformat(),
        )
        response = self.client.post(self.LIST_URL, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('end_date', response.data)

    def test_status_filter_active(self):
        response = self.client.get(f'{self.LIST_URL}?status=active')
        results = response.data.get('results', response.data)
        self.assertTrue(all(r['status'] == 'active' for r in results))

    # ── Offer item management ──

    def test_add_item_to_campaign(self):
        response = self.client.post(
            f'{self.LIST_URL}{self.campaign.id}/items/',
            {'program': self.program.id}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(self.campaign.items.count(), 1)

    def test_duplicate_program_in_campaign_rejected(self):
        OfferItem.objects.create(campaign=self.campaign, program=self.program)
        response = self.client.post(
            f'{self.LIST_URL}{self.campaign.id}/items/',
            {'program': self.program.id}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('program', response.data)

    def test_dangerous_cta_url_rejected(self):
        response = self.client.post(
            f'{self.LIST_URL}{self.campaign.id}/items/',
            {'program': self.program.id, 'cta_url': 'javascript:alert(1)'}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cta_url', response.data)

    def test_negative_promo_price_rejected(self):
        response = self.client.post(
            f'{self.LIST_URL}{self.campaign.id}/items/',
            {'program': self.program.id, 'promo_price': -5}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('promo_price', response.data)

    def test_draft_program_rejected_for_item(self):
        draft = Program.objects.create(slug='draft-prog', title_en='Draft', status='draft')
        response = self.client.post(
            f'{self.LIST_URL}{self.campaign.id}/items/',
            {'program': draft.id}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('program', response.data)

    def test_update_item(self):
        item = OfferItem.objects.create(
            campaign=self.campaign, program=self.program,
            promo_price=100, show_promo_price_publicly=False,
        )
        response = self.client.patch(
            f'/api/v1/cms/training/offer-items/{item.id}/',
            {'show_promo_price_publicly': True}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        item.refresh_from_db()
        self.assertTrue(item.show_promo_price_publicly)

    def test_delete_item(self):
        item = OfferItem.objects.create(campaign=self.campaign, program=self.program)
        response = self.client.delete(f'/api/v1/cms/training/offer-items/{item.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(OfferItem.objects.filter(pk=item.pk).exists())

    def test_reorder_items(self):
        p2 = Program.objects.create(slug='reorder-prog', title_en='P2', status='active')
        item1 = OfferItem.objects.create(
            campaign=self.campaign, program=self.program, display_order=0
        )
        item2 = OfferItem.objects.create(campaign=self.campaign, program=p2, display_order=1)
        response = self.client.post(
            f'{self.LIST_URL}{self.campaign.id}/items/reorder/',
            {'items': [{'id': item2.id, 'order': 0}, {'id': item1.id, 'order': 1}]},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        item1.refresh_from_db()
        item2.refresh_from_db()
        self.assertEqual(item1.display_order, 1)
        self.assertEqual(item2.display_order, 0)

    def test_campaign_detail_includes_items(self):
        OfferItem.objects.create(campaign=self.campaign, program=self.program)
        response = self.client.get(f'{self.LIST_URL}{self.campaign.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('items', response.data)
        self.assertEqual(len(response.data['items']), 1)
        self.assertIn('program_slug', response.data['items'][0])


@override_settings(**THROTTLE_OVERRIDE)
class RegistrationConversionEligibilityTests(TestCase):
    """Verify the API signals used by the frontend conversion event.

    The frontend fires the explicit conversion event ONLY when the backend
    confirms a NEW registration (is_new === true). These tests pin that
    contract: duplicates and validation failures must never look like new
    registrations.
    """

    REGISTER_URL = '/api/v1/training/programs/{slug}/register/'

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.program = Program.objects.create(
            slug='conversion-program', title_en='Conversion Program',
            status='active', registration_open=True,
        )

    def tearDown(self):
        # Clear throttle cache so subsequent test classes (e.g. rate-limiting)
        # start with a clean cache and don't see residual counters.
        cache.clear()

    def _payload(self, **overrides):
        payload = dict(
            full_name='Test Learner',
            email='learner@example.com',
            phone='01000000000',
            privacy_policy_consent=True,
        )
        payload.update(overrides)
        return payload

    def test_successful_registration_returns_is_new_true(self):
        response = self.client.post(
            self.REGISTER_URL.format(slug='conversion-program'),
            self._payload(), format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data['is_new'])

    def test_duplicate_registration_returns_is_new_false(self):
        first = self.client.post(
            self.REGISTER_URL.format(slug='conversion-program'),
            self._payload(), format='json',
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.client.post(
            self.REGISTER_URL.format(slug='conversion-program'),
            self._payload(), format='json',
        )
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertFalse(second.data['is_new'])

    def test_validation_failure_returns_400_not_new(self):
        response = self.client.post(
            self.REGISTER_URL.format(slug='conversion-program'),
            self._payload(email='not-an-email'), format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('is_new', response.data)

    def test_registration_closed_returns_400_not_new(self):
        self.program.registration_open = False
        self.program.save()
        response = self.client.post(
            self.REGISTER_URL.format(slug='conversion-program'),
            self._payload(), format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('is_new', response.data)

    def test_utm_campaign_attribution_persisted(self):
        """Offer attribution flows through utm_campaign/utm_content."""
        response = self.client.post(
            self.REGISTER_URL.format(slug='conversion-program'),
            self._payload(
                utm_campaign='september-offers',
                utm_content='offer_5',
                utm_source='training_offers',
                utm_medium='internal',
            ),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        registration = TrainingRegistration.objects.get(email='learner@example.com')
        self.assertEqual(registration.utm_campaign, 'september-offers')
        self.assertEqual(registration.utm_content, 'offer_5')
        self.assertEqual(registration.utm_source, 'training_offers')
