"""Tests for the navigation CMS app."""
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.navigation.models import NavigationItem, NavigationMenu


class NavigationModelTests(TestCase):
    """Unit tests for NavigationMenu and NavigationItem models."""

    def setUp(self):
        self.menu = NavigationMenu.objects.create(
            name='Header',
            slug='header',
            location=NavigationMenu.LOCATION_HEADER,
        )

    def test_href_internal_url(self):
        item = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Home',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/',
        )
        self.assertEqual(item.href, '/')

    def test_href_internal_route_name(self):
        item = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Training',
            link_type=NavigationItem.LINK_INTERNAL,
            route_name='training',
        )
        self.assertEqual(item.href, '/training')

    def test_href_external(self):
        item = NavigationItem.objects.create(
            menu=self.menu,
            label_en='External',
            link_type=NavigationItem.LINK_EXTERNAL,
            url='https://example.com',
        )
        self.assertEqual(item.href, 'https://example.com')

    def test_href_anchor(self):
        item = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Contact',
            link_type=NavigationItem.LINK_ANCHOR,
            anchor='contact',
        )
        self.assertEqual(item.href, '#contact')

    def test_href_email(self):
        item = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Email',
            link_type=NavigationItem.LINK_EMAIL,
            email='info@sidrahsoft.com',
        )
        self.assertEqual(item.href, 'mailto:info@sidrahsoft.com')

    def test_href_phone(self):
        item = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Phone',
            link_type=NavigationItem.LINK_PHONE,
            phone='+201234567890',
        )
        self.assertEqual(item.href, 'tel:+201234567890')

    def test_parent_must_be_same_menu(self):
        other_menu = NavigationMenu.objects.create(
            name='Footer',
            slug='footer',
            location=NavigationMenu.LOCATION_FOOTER,
        )
        parent = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Parent',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/',
        )
        child = NavigationItem(
            menu=other_menu,
            label_en='Child',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/child',
            parent=parent,
        )
        with self.assertRaises(Exception):
            child.save()

    def test_parent_cannot_have_parent(self):
        grandparent = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Grandparent',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/',
        )
        parent = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Parent',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/parent',
            parent=grandparent,
        )
        child = NavigationItem(
            menu=self.menu,
            label_en='Child',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/child',
            parent=parent,
        )
        with self.assertRaises(Exception):
            child.save()

    def test_self_parenting_rejected(self):
        item = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Item',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/',
        )
        item.parent = item
        with self.assertRaises(Exception):
            item.save()


class NavigationAPITests(TestCase):
    """Integration tests for the public navigation API."""

    def setUp(self):
        self.client = APIClient()
        self.menu = NavigationMenu.objects.create(
            name='Header',
            slug='header',
            location=NavigationMenu.LOCATION_HEADER,
            order=1,
        )
        self.parent = NavigationItem.objects.create(
            menu=self.menu,
            label_en='Services',
            label_ar='الخدمات',
            link_type=NavigationItem.LINK_ANCHOR,
            anchor='services',
            order=1,
        )
        self.child = NavigationItem.objects.create(
            menu=self.menu,
            parent=self.parent,
            label_en='Training',
            label_ar='التدريب',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/training',
            order=1,
        )
        NavigationItem.objects.create(
            menu=self.menu,
            label_en='Hidden',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/hidden',
            is_visible=False,
        )
        NavigationItem.objects.create(
            menu=self.menu,
            label_en='Inactive',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/inactive',
            is_visible=False,
        )

    def test_list_endpoint(self):
        response = self.client.get(reverse('navigation:menu-list'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['slug'], 'header')

    def test_location_filter(self):
        NavigationMenu.objects.create(
            name='Footer',
            slug='footer',
            location=NavigationMenu.LOCATION_FOOTER,
        )
        response = self.client.get(
            reverse('navigation:menu-list'),
            {'location': 'footer'},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['slug'], 'footer')

    def test_detail_endpoint(self):
        response = self.client.get(
            reverse('navigation:menu-detail', kwargs={'slug': 'header'})
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['slug'], 'header')
        self.assertEqual(data['location'], 'header')

    def test_nested_children(self):
        response = self.client.get(
            reverse('navigation:menu-detail', kwargs={'slug': 'header'})
        )
        data = response.json()
        self.assertEqual(len(data['items']), 1)
        parent_item = data['items'][0]
        self.assertEqual(parent_item['label']['en'], 'Services')
        self.assertEqual(len(parent_item['children']), 1)
        self.assertEqual(parent_item['children'][0]['label']['en'], 'Training')

    def test_hidden_items_excluded(self):
        response = self.client.get(
            reverse('navigation:menu-detail', kwargs={'slug': 'header'})
        )
        data = response.json()
        labels = [item['label']['en'] for item in data['items']]
        self.assertNotIn('Hidden', labels)

    def test_inactive_menu_excluded(self):
        self.menu.is_active = False
        self.menu.save()
        response = self.client.get(
            reverse('navigation:menu-detail', kwargs={'slug': 'header'})
        )
        self.assertEqual(response.status_code, 404)

    def test_bilingual_labels(self):
        response = self.client.get(
            reverse('navigation:menu-detail', kwargs={'slug': 'header'})
        )
        data = response.json()
        parent_item = data['items'][0]
        self.assertEqual(parent_item['label']['en'], 'Services')
        self.assertEqual(parent_item['label']['ar'], 'الخدمات')

    def test_child_ordering(self):
        second = NavigationItem.objects.create(
            menu=self.menu,
            parent=self.parent,
            label_en='Second',
            link_type=NavigationItem.LINK_INTERNAL,
            url='/second',
            order=2,
        )
        response = self.client.get(
            reverse('navigation:menu-detail', kwargs={'slug': 'header'})
        )
        data = response.json()
        children = data['items'][0]['children']
        self.assertEqual(children[0]['label']['en'], 'Training')
        self.assertEqual(children[1]['label']['en'], 'Second')


class SeedCommandTests(TestCase):
    """Tests for the seed_navigation management command."""

    def test_seed_creates_menus(self):
        call_command('seed_navigation')
        self.assertTrue(NavigationMenu.objects.filter(slug='main-header').exists())
        self.assertTrue(NavigationMenu.objects.filter(slug='legal-links').exists())

    def test_seed_is_idempotent(self):
        call_command('seed_navigation')
        first_count = NavigationItem.objects.count()
        call_command('seed_navigation')
        second_count = NavigationItem.objects.count()
        self.assertEqual(first_count, second_count)
