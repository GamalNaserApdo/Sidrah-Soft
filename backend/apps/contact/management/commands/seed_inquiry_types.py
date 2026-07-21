"""Idempotent seed command for default contact inquiry types."""
from django.core.management.base import BaseCommand

from apps.contact.models import InquiryType


# Inquiry types required by the public contact form frontend fallback.
# These match the slugs and bilingual labels used in
# src/components/sections/ContactSection.jsx.
DEFAULT_INQUIRY_TYPES = [
    {
        'slug': 'website-development',
        'name_en': 'Website Development',
        'name_ar': 'تطوير مواقع الويب',
        'order': 0,
    },
    {
        'slug': 'mobile-applications',
        'name_en': 'Mobile Application',
        'name_ar': 'تطبيق جوال',
        'order': 1,
    },
    {
        'slug': 'erp-business-system',
        'name_en': 'ERP / Business System',
        'name_ar': 'نظام تخطيط الموارد / نظام أعمال',
        'order': 2,
    },
    {
        'slug': 'consultation',
        'name_en': 'Consultation',
        'name_ar': 'استشارة',
        'order': 3,
    },
    {
        'slug': 'training',
        'name_en': 'Training',
        'name_ar': 'تدريب',
        'order': 4,
    },
    {
        'slug': 'technical-support',
        'name_en': 'Technical Support',
        'name_ar': 'الدعم الفني',
        'order': 5,
    },
    {
        'slug': 'other',
        'name_en': 'Other',
        'name_ar': 'أخرى',
        'order': 6,
    },
]


class Command(BaseCommand):
    """Seed default inquiry types for the public contact form."""

    help = 'Seed or update default contact inquiry types in an idempotent way.'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for data in DEFAULT_INQUIRY_TYPES:
            slug = data['slug']
            defaults = {
                'name_en': data['name_en'],
                'name_ar': data['name_ar'],
                'order': data['order'],
                'is_active': True,
            }

            inquiry_type, created = InquiryType.objects.update_or_create(
                slug=slug,
                defaults=defaults,
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created inquiry type: {slug}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.NOTICE(f'Updated inquiry type: {slug}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded inquiry types: {created_count} created, '
                f'{updated_count} updated.'
            )
        )
