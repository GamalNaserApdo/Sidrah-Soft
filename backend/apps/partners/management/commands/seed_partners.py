from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from apps.media_library.models import MediaAsset

from ...models import Partner


PARTNER_SEED_DATA = [
    {
        'slug': 'eurofins',
        'name_en': 'Eurofins',
        'name_ar': '',
        'filename': 'eurofins.png',
        'website_url': 'https://www.eurofins.com/',
        'partner_type': Partner.PARTNER_TYPE_CLIENT,
        'display_order': 1,
        'is_featured': False,
    },
    {
        'slug': 'orangetheory-fitness-ksa',
        'name_en': 'Orangetheory Fitness KSA',
        'name_ar': '',
        'filename': 'Orangetheory-Fitness-Logo.png',
        'website_url': 'https://join.otfksa.com/',
        'partner_type': Partner.PARTNER_TYPE_CLIENT,
        'display_order': 2,
        'is_featured': False,
    },
    {
        'slug': 'club-pilates-saudi-arabia',
        'name_en': 'Club Pilates Saudi Arabia',
        'name_ar': '',
        'filename': 'club-pilates-logo-g2gsvcvaj31u80ap.png',
        'website_url': 'https://clubpilates.sa/',
        'partner_type': Partner.PARTNER_TYPE_CLIENT,
        'display_order': 3,
        'is_featured': False,
    },
    {
        'slug': 'safa-invest',
        'name_en': 'Safa Invest',
        'name_ar': '',
        'filename': 'safa.webp',
        'website_url': 'https://safainvest.com/',
        'partner_type': Partner.PARTNER_TYPE_CLIENT,
        'display_order': 4,
        'is_featured': False,
    },
    {
        'slug': 'vision',
        'name_en': 'Vision',
        'name_ar': '',
        'filename': 'vision.png',
        'website_url': 'https://vision.edu.sa/',
        'partner_type': Partner.PARTNER_TYPE_ACADEMIC,
        'display_order': 5,
        'is_featured': False,
    },
    {
        'slug': 'alqalam-schools',
        'name_en': 'AlQalam Schools',
        'name_ar': '',
        'filename': 'alqalam.png',
        'website_url': 'https://alqalamschools.com/',
        'partner_type': Partner.PARTNER_TYPE_ACADEMIC,
        'display_order': 6,
        'is_featured': False,
    },
]


class Command(BaseCommand):
    help = 'Seed or update the six current partners from existing frontend assets.'

    def handle(self, *args, **options):
        assets_dir = Path(settings.BASE_DIR).parent / 'src' / 'assets' / 'partiners'
        created_count = 0
        updated_count = 0

        for item in PARTNER_SEED_DATA:
            partner, was_created = self._create_or_update_partner(
                item,
                assets_dir,
            )
            if was_created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded partners: {created_count} created, {updated_count} updated.'
            )
        )

    def _create_or_update_partner(self, item, assets_dir):
        file_path = assets_dir / item['filename']
        if not file_path.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Logo not found for {item['name_en']}: {file_path}"
                )
            )
            logo = None
        else:
            logo = self._get_or_create_logo_asset(item, file_path)

        partner, created = Partner.objects.update_or_create(
            slug=item['slug'],
            defaults={
                'name_en': item['name_en'],
                'name_ar': item['name_ar'],
                'website_url': item['website_url'],
                'partner_type': item['partner_type'],
                'display_order': item['display_order'],
                'is_featured': item['is_featured'],
                'is_active': True,
                'open_in_new_tab': True,
                'logo': logo,
            },
        )
        return partner, created

    def _get_or_create_logo_asset(self, item, file_path):
        title = f"Partner Logo: {item['name_en']}"
        media_asset = MediaAsset.objects.filter(title=title).first()
        if media_asset:
            return media_asset

        with open(file_path, 'rb') as f:
            media_asset = MediaAsset.objects.create(
                title=title,
                alt_text=title,
                media_type=MediaAsset.MEDIA_TYPE_IMAGE,
                usage_context='partner logo',
                is_active=True,
                file=File(f, name=file_path.name),
            )

        return media_asset
