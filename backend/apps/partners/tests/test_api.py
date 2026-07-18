from django.core.files.base import ContentFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.media_library.models import MediaAsset

from ..models import Partner


class PartnerAPITests(APITestCase):
    def setUp(self):
        self.logo = MediaAsset.objects.create(
            title='Test Logo',
            file=ContentFile(b'fake-image-data', name='test-logo.png'),
            media_type=MediaAsset.MEDIA_TYPE_IMAGE,
            alt_text='Test Logo Alt',
        )

    def tearDown(self):
        self.logo.delete()

    def _create_partner(self, **kwargs):
        defaults = {
            'name_en': 'Partner',
            'slug': 'partner',
            'is_active': True,
            'display_order': 0,
            'partner_type': Partner.PARTNER_TYPE_CLIENT,
            'logo': self.logo,
        }
        defaults.update(kwargs)
        return Partner.objects.create(**defaults)

    def test_list_returns_200(self):
        url = reverse('partners:partner-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_list_returns_only_active_partners(self):
        active = self._create_partner(
            name_en='Active Partner',
            slug='active-partner',
        )
        inactive = self._create_partner(
            name_en='Inactive Partner',
            slug='inactive-partner',
            is_active=False,
        )
        url = reverse('partners:partner-list')
        response = self.client.get(url)
        slugs = [item['slug'] for item in response.data]
        self.assertIn(active.slug, slugs)
        self.assertNotIn(inactive.slug, slugs)

    def test_list_ordering(self):
        self._create_partner(
            name_en='Zebra',
            slug='zebra',
            display_order=2,
        )
        self._create_partner(
            name_en='Apple',
            slug='apple',
            display_order=1,
        )
        url = reverse('partners:partner-list')
        response = self.client.get(url)
        names = [item['name']['en'] for item in response.data]
        self.assertEqual(names, ['Apple', 'Zebra'])

    def test_filter_by_partner_type(self):
        client_partner = self._create_partner(
            name_en='Client Partner',
            slug='client-partner',
            partner_type=Partner.PARTNER_TYPE_CLIENT,
        )
        academic_partner = self._create_partner(
            name_en='Academic Partner',
            slug='academic-partner',
            partner_type=Partner.PARTNER_TYPE_ACADEMIC,
        )
        url = reverse('partners:partner-list')
        response = self.client.get(url, {'partner_type': 'academic_partner'})
        slugs = [item['slug'] for item in response.data]
        self.assertIn(academic_partner.slug, slugs)
        self.assertNotIn(client_partner.slug, slugs)

    def test_filter_by_featured(self):
        featured = self._create_partner(
            name_en='Featured Partner',
            slug='featured-partner',
            is_featured=True,
        )
        regular = self._create_partner(
            name_en='Regular Partner',
            slug='regular-partner',
            is_featured=False,
        )
        url = reverse('partners:partner-list')
        response = self.client.get(url, {'is_featured': 'true'})
        slugs = [item['slug'] for item in response.data]
        self.assertIn(featured.slug, slugs)
        self.assertNotIn(regular.slug, slugs)

    def test_detail_lookup_by_slug(self):
        partner = self._create_partner(
            name_en='Detail Partner',
            slug='detail-partner',
        )
        url = reverse('partners:partner-detail', kwargs={'slug': partner.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['slug'], partner.slug)

    def test_inactive_detail_returns_404(self):
        partner = self._create_partner(
            name_en='Inactive Detail',
            slug='inactive-detail',
            is_active=False,
        )
        url = reverse('partners:partner-detail', kwargs={'slug': partner.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_slug_returns_404(self):
        url = reverse('partners:partner-detail', kwargs={'slug': 'no-such-slug'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_bilingual_fields_returned(self):
        partner = self._create_partner(
            name_en='English Name',
            name_ar='اسم عربي',
            description_en='English description',
            description_ar='وصف عربي',
            slug='bilingual-partner',
        )
        url = reverse('partners:partner-detail', kwargs={'slug': partner.slug})
        response = self.client.get(url)
        self.assertEqual(response.data['name']['en'], 'English Name')
        self.assertEqual(response.data['name']['ar'], 'اسم عربي')
        self.assertEqual(response.data['description']['en'], 'English description')
        self.assertEqual(response.data['description']['ar'], 'وصف عربي')

    def test_logo_payload_returned(self):
        partner = self._create_partner(
            name_en='Logo Partner',
            slug='logo-partner-api',
        )
        url = reverse('partners:partner-list')
        response = self.client.get(url)
        item = response.data[0]
        self.assertIn('logo', item)
        self.assertIsNotNone(item['logo'])
        self.assertIn('id', item['logo'])
        self.assertIn('url', item['logo'])
        self.assertIn('alt_text', item['logo'])
        self.assertEqual(item['logo']['alt_text']['en'], 'Test Logo Alt')
