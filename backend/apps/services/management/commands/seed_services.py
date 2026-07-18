"""Seed the services currently shown on the public homepage.

This command mirrors the static list in
``src/components/sections/ServicesSection.jsx``. It does not import inline SVG
icons; those remain a frontend concern until the integration phase.
"""
from django.core.management.base import BaseCommand

from apps.services.models import Service


SEED_SERVICES = [
    {
        'name_en': 'Web Applications',
        'name_ar': 'تطبيقات الويب',
        'slug': 'web-applications',
        'short_description_en': 'Custom web platforms built for scale, performance, and long-term growth.',
        'short_description_ar': 'منصات ويب مخصصة مبنية للتوسع والأداء والنمو طويل المدى.',
        'display_order': 1,
        'is_featured': True,
    },
    {
        'name_en': 'Mobile Applications',
        'name_ar': 'تطبيقات الجوال',
        'slug': 'mobile-applications',
        'short_description_en': 'Native and cross-platform apps for iOS and Android.',
        'short_description_ar': 'تطبيقات native ومتعددة المنصات لنظامي iOS وAndroid.',
        'display_order': 2,
        'is_featured': True,
    },
    {
        'name_en': 'ERP Solutions',
        'name_ar': 'حلول تخطيط موارد المؤسسات',
        'slug': 'erp-solutions',
        'short_description_en': 'Integrated systems that connect operations, finance, and data.',
        'short_description_ar': 'أنظمة متكاملة تربط العمليات والمالية والبيانات.',
        'display_order': 3,
        'is_featured': True,
    },
    {
        'name_en': 'AI Solutions',
        'name_ar': 'حلول الذكاء الاصطناعي',
        'slug': 'ai-solutions',
        'short_description_en': 'Intelligent systems that automate decisions and surface insights.',
        'short_description_ar': 'أنظمة ذكية تؤتمت اتخاذ القرارات وتكشف الرؤى.',
        'display_order': 4,
        'is_featured': False,
    },
    {
        'name_en': 'Automation Solutions',
        'name_ar': 'حلول الأتمتة',
        'slug': 'automation-solutions',
        'short_description_en': 'Workflow automation that reduces cost and increases speed.',
        'short_description_ar': 'أتمتة سير العمل التي تقلل التكاليف وتزيد السرعة.',
        'display_order': 5,
        'is_featured': False,
    },
]

DEFAULT_CTA = {
    'cta_label_en': 'Learn More',
    'cta_label_ar': 'اعرف المزيد',
    'cta_url': '#contact',
}


class Command(BaseCommand):
    help = 'Seed the five services defined in the frontend ServicesSection.'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for data in SEED_SERVICES:
            defaults = {
                'is_active': True,
                'show_on_homepage': True,
                **DEFAULT_CTA,
                **data,
            }
            _, created = Service.objects.update_or_create(
                slug=data['slug'],
                defaults=defaults,
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded services: {created_count} created, {updated_count} updated.'
            )
        )
