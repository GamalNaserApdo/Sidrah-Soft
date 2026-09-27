"""Tests for the Starter Landing Page Builder V1.

Covers: draft CRUD, publish flow, public/preview payload isolation,
section validation (types, props, HTML/JS safety, CTA targets, price
override, protected registration section), RBAC, optimistic concurrency,
and revision snapshots.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.roles import has_permission
from apps.training.landing_sections import default_sections, validate_sections
from apps.training.models import StarterLandingPage, StarterLandingRevision

User = get_user_model()

CMS_URL = '/api/v1/cms/training/starter-landing/'
PUBLISH_URL = '/api/v1/cms/training/starter-landing/publish/'
PREVIEW_TOKEN_URL = '/api/v1/cms/training/starter-landing/preview-token/'
PUBLIC_URL = '/api/v1/training/starter-page/'
PUBLIC_PREVIEW_URL = '/api/v1/training/starter-page/preview/'


def _hero(**overrides):
    props = {
        'badge_en': 'Badge EN', 'badge_ar': 'شارة',
        'title_en': 'Title EN', 'title_ar': 'عنوان',
        'price_display': 'shared',
    }
    props.update(overrides)
    return {'id': 'hero', 'type': 'hero', 'enabled': True, 'props': props}


def _register_section():
    return {'id': 'register', 'type': 'registration_form', 'enabled': True, 'props': {}}


def _valid_sections(**hero_overrides):
    return [_hero(**hero_overrides), _register_section()]


class StarterLandingDraftTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user('landing-admin', password='pass', role='admin')
        self.client.force_authenticate(self.admin)
        StarterLandingPage.objects.all().delete()
        self.page = StarterLandingPage.get_current()

    def test_retrieve_draft(self):
        response = self.client.get(CMS_URL)
        self.assertEqual(response.status_code, 200)
        self.assertIn('sections', response.data)
        self.assertIn('published_sections', response.data)
        self.assertIn('updated_at', response.data)
        self.assertEqual(len(response.data['sections']), 2)

    def test_update_draft(self):
        sections = _valid_sections()
        sections[0]['props']['title_en'] = 'Draft Title Change'
        response = self.client.put(CMS_URL, {
            'sections': sections,
            'expected_updated_at': self.page.updated_at.isoformat(),
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.page.refresh_from_db()
        self.assertEqual(self.page.draft_sections[0]['props']['title_en'], 'Draft Title Change')
        # Published must be untouched
        self.assertNotEqual(
            self.page.published_sections[0]['props']['title_en'], 'Draft Title Change',
        )

    def test_stale_edit_conflict(self):
        response = self.client.put(CMS_URL, {
            'sections': _valid_sections(),
            'expected_updated_at': '2000-01-01T00:00:00+00:00',
        }, format='json')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'conflict')

    def test_publish_flow(self):
        sections = _valid_sections(title_en='Publish Me')
        self.client.put(CMS_URL, {
            'sections': sections,
            'expected_updated_at': self.page.updated_at.isoformat(),
        }, format='json')
        response = self.client.post(PUBLISH_URL)
        self.assertEqual(response.status_code, 200)
        self.page.refresh_from_db()
        self.assertEqual(
            self.page.published_sections[0]['props']['title_en'], 'Publish Me',
        )
        self.assertIsNotNone(self.page.published_at)
        self.assertEqual(self.page.published_by, self.admin)
        self.assertFalse(self.page.has_unpublished_changes)

    def test_publish_creates_revision(self):
        count_before = StarterLandingRevision.objects.count()
        self.client.post(PUBLISH_URL)
        self.assertEqual(StarterLandingRevision.objects.count(), count_before + 1)
        rev = StarterLandingRevision.objects.latest('created_at')
        self.assertEqual(rev.page, self.page)
        self.assertEqual(rev.sections, self.page.published_sections)
        self.assertEqual(rev.published_by, self.admin)


class StarterLandingPublicIsolationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user('landing-admin2', password='pass', role='admin')
        StarterLandingPage.objects.all().delete()
        self.page = StarterLandingPage.get_current()

    def test_public_receives_published_only(self):
        response = self.client.get(PUBLIC_URL)
        self.assertEqual(response.status_code, 200)
        self.assertIn('sections', response.data)
        # Never exposes draft/metadata
        self.assertNotIn('draft_sections', response.data)
        self.assertNotIn('published_by', response.data)
        self.assertNotIn('revisions', response.data)

    def test_unpublished_draft_invisible_publicly(self):
        self.client.force_authenticate(self.admin)
        self.client.put(CMS_URL, {
            'sections': _valid_sections(title_en='UNPUBLISHED DRAFT'),
            'expected_updated_at': self.page.updated_at.isoformat(),
        }, format='json')
        self.client.force_authenticate()
        response = self.client.get(PUBLIC_URL)
        titles = [s['props'].get('title_en') for s in response.data['sections']]
        self.assertNotIn('UNPUBLISHED DRAFT', titles)

    def test_draft_visible_after_publish(self):
        self.client.force_authenticate(self.admin)
        self.client.put(CMS_URL, {
            'sections': _valid_sections(title_en='NOW LIVE'),
            'expected_updated_at': self.page.updated_at.isoformat(),
        }, format='json')
        self.client.post(PUBLISH_URL)
        response = self.client.get(PUBLIC_URL)
        titles = [s['props'].get('title_en') for s in response.data['sections']]
        self.assertIn('NOW LIVE', titles)

    def test_public_fallback_when_row_missing(self):
        StarterLandingPage.objects.all().delete()
        response = self.client.get(PUBLIC_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['sections']), 2)
        types = [s['type'] for s in response.data['sections']]
        self.assertIn('hero', types)
        self.assertIn('registration_form', types)


class StarterLandingPreviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user('landing-admin3', password='pass', role='admin')
        StarterLandingPage.objects.all().delete()
        self.page = StarterLandingPage.get_current()

    def test_preview_token_flow(self):
        self.client.force_authenticate(self.admin)
        token_resp = self.client.post(PREVIEW_TOKEN_URL)
        self.assertEqual(token_resp.status_code, 200)
        token = token_resp.data['token']

        # Change draft only
        self.page.draft_sections = _valid_sections(title_en='DRAFT PREVIEW TITLE')
        self.page.save(update_fields=['draft_sections'])

        response = self.client.get(f'{PUBLIC_PREVIEW_URL}?token={token}')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['preview'])
        titles = [s['props'].get('title_en') for s in response.data['sections']]
        self.assertIn('DRAFT PREVIEW TITLE', titles)

    def test_preview_rejects_missing_or_bad_token(self):
        self.assertEqual(self.client.get(PUBLIC_PREVIEW_URL).status_code, 403)
        self.assertEqual(
            self.client.get(f'{PUBLIC_PREVIEW_URL}?token=bogus').status_code, 403,
        )


class StarterLandingValidationTests(TestCase):
    """Section-schema validation (also exercised through the PUT endpoint)."""

    def test_valid_sections_pass(self):
        cleaned = validate_sections(_valid_sections())
        self.assertEqual(len(cleaned), 2)

    def test_unknown_section_type_rejected(self):
        from django.core.exceptions import ValidationError
        bad = _valid_sections()
        bad.append({'id': 'evil', 'type': 'custom_script', 'enabled': True, 'props': {}})
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_unknown_prop_rejected(self):
        from django.core.exceptions import ValidationError
        bad = _valid_sections()
        bad[0]['props']['script'] = 'alert(1)'
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_html_in_props_rejected(self):
        from django.core.exceptions import ValidationError
        bad = _valid_sections(title_en='<script>alert(1)</script>')
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_numeric_price_prop_rejected(self):
        """Sections must never store a price — unknown props are rejected."""
        from django.core.exceptions import ValidationError
        bad = _valid_sections()
        bad[0]['props']['price'] = 99
        with self.assertRaises(ValidationError):
            validate_sections(bad)
        bad[0]['props'] = {'title_en': 'x', 'price_egp': '499'}
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_price_display_must_be_enum(self):
        from django.core.exceptions import ValidationError
        bad = _valid_sections(price_display='499')
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_duplicate_registration_form_rejected(self):
        from django.core.exceptions import ValidationError
        bad = _valid_sections()
        bad.append({'id': 'reg2', 'type': 'registration_form', 'enabled': True, 'props': {}})
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_registration_form_cannot_be_removed(self):
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            validate_sections([_hero()])

    def test_registration_form_props_rejected(self):
        from django.core.exceptions import ValidationError
        bad = _valid_sections()
        bad[1]['props'] = {'form_title_en': 'duplicate copy'}
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_unsafe_cta_targets_rejected(self):
        from django.core.exceptions import ValidationError
        for target in ('javascript:alert(1)', 'https://evil.example.com',
                       '//evil.example.com/x', 'data:text/html;base64,xxx'):
            bad = _valid_sections()
            bad.append({
                'id': 'cta1', 'type': 'cta_banner', 'enabled': True,
                'props': {'button_en': 'Go', 'target': target},
            })
            with self.assertRaises(ValidationError, msg=target):
                validate_sections(bad)

    def test_safe_cta_targets_accepted(self):
        for target in ('#register', '/training/starter', '#faq'):
            secs = _valid_sections()
            secs.append({
                'id': 'cta1', 'type': 'cta_banner', 'enabled': True,
                'props': {'button_en': 'Go', 'target': target},
            })
            cleaned = validate_sections(secs)
            self.assertEqual(cleaned[2]['props']['target'], target)

    def test_section_count_and_duplicate_ids(self):
        from django.core.exceptions import ValidationError
        bad = _valid_sections()
        bad.append({'id': 'hero', 'type': 'rich_text', 'enabled': True, 'props': {}})
        with self.assertRaises(ValidationError):
            validate_sections(bad)

    def test_endpoint_rejects_invalid_sections(self):
        client = APIClient()
        admin = User.objects.create_user('landing-admin4', password='pass', role='admin')
        client.force_authenticate(admin)
        page = StarterLandingPage.get_current()
        bad = _valid_sections()
        bad[1]['type'] = 'not_a_type'
        response = client.put(CMS_URL, {
            'sections': bad,
            'expected_updated_at': page.updated_at.isoformat(),
        }, format='json')
        self.assertEqual(response.status_code, 400)


class StarterLandingRBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_publish_roles_are_high_trust_only(self):
        """training:publish is granted via CONTENT_CRUD to training admins."""
        self.assertTrue(has_permission('admin', 'training', 'publish'))
        self.assertTrue(has_permission('content_manager', 'training', 'publish'))
        self.assertTrue(has_permission('lms_admin', 'training', 'publish'))
        # Non-training roles must never publish.
        for role in ('editor', 'marketing_manager', 'recruiter',
                     'support_agent', 'finance_sales'):
            self.assertFalse(has_permission(role, 'training', 'update'), role)
            self.assertFalse(has_permission(role, 'training', 'publish'), role)

    def test_editor_cannot_update_or_publish(self):
        editor = User.objects.create_user('landing-editor', password='pass', role='editor')
        self.client.force_authenticate(editor)
        self.assertEqual(self.client.get(CMS_URL).status_code, 403)
        self.assertEqual(self.client.put(CMS_URL, {'sections': []}, format='json').status_code, 403)
        self.assertEqual(self.client.post(PUBLISH_URL).status_code, 403)

    def test_unauthenticated_rejected(self):
        self.assertEqual(self.client.get(CMS_URL).status_code, 403)


class StarterLandingDefaultContentTests(TestCase):
    def test_default_sections_match_current_page(self):
        secs = default_sections()
        self.assertEqual([s['type'] for s in secs], ['hero', 'registration_form'])
        hero = secs[0]['props']
        self.assertEqual(hero['price_display'], 'shared')
        self.assertTrue(hero['title_en'])
        self.assertTrue(hero['title_ar'])
        # No numeric price anywhere
        self.assertNotIn('price', {k for k in hero if k != 'price_display'})
