"""Seed the Secondary/Baccalaureate education inquiry type."""
from django.core.management.base import BaseCommand

from apps.contact.models import InquiryType


class Command(BaseCommand):
    help = 'Create the Secondary/Baccalaureate Program Inquiry type (idempotent).'

    def handle(self, *args, **options):
        obj, created = InquiryType.objects.get_or_create(
            slug='secondary-program-inquiry',
            defaults={
                'name_en': 'Secondary / Baccalaureate Program Inquiry',
                'name_ar': 'استفسار برنامج الثانوية / البكالوريا',
                'description_en': 'Inquiries about our secondary school and baccalaureate education programs.',
                'description_ar': 'استفسارات حول برامج التعليم الثانوي والبكالوريا.',
                'order': 50,
                'is_active': True,
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created inquiry type: {obj.name_en}'))
        else:
            self.stdout.write(self.style.WARNING(f'Inquiry type already exists: {obj.name_en}'))
