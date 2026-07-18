from django.core.files.base import ContentFile
from django.test import TestCase

from apps.media_library.models import MediaAsset

from ..models import Partner


class PartnerModelTests(TestCase):
    def test_create_partner(self):
        partner = Partner.objects.create(
            name_en='Test Partner',
            name_ar='شريك تجريبي',
            slug='test-partner',
            website_url='https://example.com',
            partner_type=Partner.PARTNER_TYPE_CLIENT,
        )
        self.assertEqual(str(partner), 'Test Partner')
        self.assertTrue(partner.is_active)
        self.assertFalse(partner.is_featured)
        self.assertEqual(partner.display_order, 0)
        self.assertTrue(partner.open_in_new_tab)

    def test_unique_slug(self):
        Partner.objects.create(name_en='First', slug='unique-slug')
        with self.assertRaises(Exception):
            Partner.objects.create(name_en='Second', slug='unique-slug')

    def test_default_ordering(self):
        Partner.objects.create(
            name_en='Beta',
            slug='beta',
            display_order=2,
        )
        Partner.objects.create(
            name_en='Alpha',
            slug='alpha',
            display_order=1,
        )
        Partner.objects.create(
            name_en='Gamma',
            slug='gamma',
            display_order=2,
        )
        names = list(
            Partner.objects.values_list('name_en', flat=True)
        )
        self.assertEqual(names, ['Alpha', 'Beta', 'Gamma'])

    def test_optional_website(self):
        partner = Partner.objects.create(
            name_en='No Website',
            slug='no-website',
        )
        self.assertEqual(partner.website_url, '')

    def test_optional_descriptions(self):
        partner = Partner.objects.create(
            name_en='No Description',
            slug='no-description',
        )
        self.assertEqual(partner.description_en, '')
        self.assertEqual(partner.description_ar, '')

    def test_media_asset_relationship(self):
        logo = MediaAsset.objects.create(
            title='Test Logo',
            file=ContentFile(b'fake-image-data', name='test-logo.png'),
            media_type=MediaAsset.MEDIA_TYPE_IMAGE,
        )
        partner = Partner.objects.create(
            name_en='Logo Partner',
            slug='logo-partner',
            logo=logo,
        )
        self.assertEqual(partner.logo, logo)
        logo.delete()
        partner.refresh_from_db()
        self.assertIsNone(partner.logo)

    def test_string_representation(self):
        partner = Partner.objects.create(
            name_en='Display Name',
            slug='display-name',
        )
        self.assertEqual(str(partner), 'Display Name')
