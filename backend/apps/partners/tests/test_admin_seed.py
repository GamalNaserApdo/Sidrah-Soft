import os
import tempfile
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from django.contrib import admin
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.test import TestCase, override_settings

from apps.media_library.models import MediaAsset

from ..admin import PartnerAdmin
from ..management.commands import seed_partners
from ..models import Partner


class PartnerAdminTests(TestCase):
    def test_partner_registered_in_admin(self):
        self.assertIn(Partner, admin.site._registry)
        self.assertIsInstance(admin.site._registry[Partner], PartnerAdmin)

    def test_bulk_actions_defined(self):
        action_names = {action.__name__ for action in PartnerAdmin.actions}
        self.assertIn('activate_partners', action_names)
        self.assertIn('deactivate_partners', action_names)
        self.assertIn('mark_featured', action_names)
        self.assertIn('remove_featured', action_names)


class PartnerSeedTests(TestCase):
    def test_seed_command_creates_expected_records(self):
        out = StringIO()
        with tempfile.TemporaryDirectory() as tmp_dir:
            backend_dir = Path(tmp_dir) / 'backend'
            backend_dir.mkdir()
            assets_dir = Path(tmp_dir) / 'src' / 'assets' / 'partiners'
            self._write_test_logo(assets_dir, 'test-logo.png')
            seed_data = [
                {
                    'slug': 'seeded-partner',
                    'name_en': 'Seeded Partner',
                    'name_ar': '',
                    'filename': 'test-logo.png',
                    'website_url': 'https://seeded.example.com/',
                    'partner_type': Partner.PARTNER_TYPE_CLIENT,
                    'display_order': 1,
                    'is_featured': False,
                },
            ]
            with patch.object(seed_partners, 'PARTNER_SEED_DATA', seed_data):
                with override_settings(BASE_DIR=backend_dir):
                    call_command('seed_partners', stdout=out)

        self.assertEqual(Partner.objects.count(), 1)
        partner = Partner.objects.first()
        self.assertEqual(partner.name_en, 'Seeded Partner')
        self.assertEqual(partner.slug, 'seeded-partner')
        self.assertTrue(partner.is_active)
        self.assertIsNotNone(partner.logo)
        self.assertIn('1 created', out.getvalue())

    def test_seed_command_idempotent(self):
        out = StringIO()
        with tempfile.TemporaryDirectory() as tmp_dir:
            backend_dir = Path(tmp_dir) / 'backend'
            backend_dir.mkdir()
            assets_dir = Path(tmp_dir) / 'src' / 'assets' / 'partiners'
            self._write_test_logo(assets_dir, 'test-logo.png')
            seed_data = [
                {
                    'slug': 'idempotent-partner',
                    'name_en': 'Idempotent Partner',
                    'name_ar': '',
                    'filename': 'test-logo.png',
                    'website_url': 'https://example.com/',
                    'partner_type': Partner.PARTNER_TYPE_CLIENT,
                    'display_order': 1,
                    'is_featured': False,
                },
            ]
            with patch.object(seed_partners, 'PARTNER_SEED_DATA', seed_data):
                with override_settings(BASE_DIR=backend_dir):
                    call_command('seed_partners', stdout=out)
                    first_count = Partner.objects.count()
                    call_command('seed_partners', stdout=out)
                    second_count = Partner.objects.count()

        self.assertEqual(first_count, 1)
        self.assertEqual(second_count, 1)
        output = out.getvalue()
        self.assertIn('1 created', output)
        self.assertIn('1 updated', output)

    def test_seed_updates_existing_records(self):
        out = StringIO()
        with tempfile.TemporaryDirectory() as tmp_dir:
            backend_dir = Path(tmp_dir) / 'backend'
            backend_dir.mkdir()
            assets_dir = Path(tmp_dir) / 'src' / 'assets' / 'partiners'
            self._write_test_logo(assets_dir, 'test-logo.png')
            Partner.objects.create(
                name_en='Old Name',
                slug='update-partner',
                is_active=False,
                display_order=99,
            )
            seed_data = [
                {
                    'slug': 'update-partner',
                    'name_en': 'Updated Name',
                    'name_ar': '',
                    'filename': 'test-logo.png',
                    'website_url': 'https://updated.example.com/',
                    'partner_type': Partner.PARTNER_TYPE_ACADEMIC,
                    'display_order': 2,
                    'is_featured': True,
                },
            ]
            with patch.object(seed_partners, 'PARTNER_SEED_DATA', seed_data):
                with override_settings(BASE_DIR=backend_dir):
                    call_command('seed_partners', stdout=out)

        partner = Partner.objects.get(slug='update-partner')
        self.assertEqual(partner.name_en, 'Updated Name')
        self.assertEqual(partner.display_order, 2)
        self.assertTrue(partner.is_active)
        self.assertTrue(partner.is_featured)

    @staticmethod
    def _write_test_logo(assets_dir, filename):
        assets_dir.mkdir(parents=True, exist_ok=True)
        file_path = assets_dir / filename
        file_path.write_bytes(b'fake-logo-data')
        return file_path
