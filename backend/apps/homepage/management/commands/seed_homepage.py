"""Seed default homepage data — idempotent."""
from django.core.management.base import BaseCommand

from apps.homepage.models import (
    HomepageSettings, MarqueeItem, Industry, HomepageSectionConfig,
    HOMEPAGE_SECTION_KEYS,
)


class Command(BaseCommand):
    help = 'Seed default homepage configuration data (idempotent).'

    def handle(self, *args, **options):
        # HomepageSettings
        settings, created = HomepageSettings.objects.get_or_create(
            is_active=True,
            defaults={
                'hero_enabled': True,
                'hero_headline_en': '',
                'hero_show_location_card': True,
                'foundation_enabled': True,
                'foundation_eyebrow_en': '',
                'foundation_heading_en': 'Technology partner for institutions and enterprises.',
                'foundation_description_en': 'We build custom software, ERP, AI, and automation systems that scale into future digital ecosystems.',
                'foundation_proof_points_en': [
                    'Academic & Enterprise Focus',
                    'Custom Software & ERP',
                    'AI, Automation & Future-Ready Architecture',
                ],
                'foundation_cta_label_en': 'Explore Services',
                'foundation_cta_target': '#services',
                'marquee_heading_en': 'What We Build',
                'industries_heading_en': 'Solutions for institutions, enterprises, and growing organizations.',
                'industries_description_en': 'SidrahSoft builds systems for organizations that need reliable digital infrastructure, connected operations, and scalable technology foundations.',
                'partners_heading_en': 'Trusted by partners across education, enterprise, and global business.',
                'partners_description_en': 'SidrahSoft builds digital systems for organizations that value reliable technology, scalable architecture, and long-term partnerships.',
                'case_studies_heading_en': 'Selected Digital Transformation Initiatives',
                'case_studies_description_en': 'Examples of how modern software, ERP, AI, and automation solutions solve operational challenges and create measurable business outcomes.',
                'insights_heading_en': 'Insights for digital growth',
                'insights_description_en': 'Perspectives on software, automation, AI, and scalable digital systems for organizations preparing for the future.',
                'careers_heading_en': 'Build the future with SidrahSoft',
                'careers_description_en': 'We are building digital systems, learning platforms, and automation solutions for organizations preparing for the future.',
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created HomepageSettings'))
        else:
            self.stdout.write('HomepageSettings already exists')

        # Marquee items
        marquee_defaults = [
            ('Business Automation', 'Automate repetitive workflows and business processes.'),
            ('ERP Systems', 'Centralized management for operations, finance, HR, and inventory.'),
            ('AI Solutions', 'Intelligent assistants, automation, and decision support.'),
            ('Web Development', 'Modern scalable web platforms.'),
            ('Mobile Applications', 'Cross-platform mobile experiences.'),
            ('System Integration', 'Connect multiple systems into one ecosystem.'),
            ('Data & Analytics', 'Business intelligence and reporting.'),
            ('Digital Transformation', 'Modernization of business operations.'),
            ('Training Programs', 'Professional technical education and workforce development.'),
            ('Custom Software Development', 'Tailored software solutions for unique business requirements.'),
        ]
        for idx, (title, desc) in enumerate(marquee_defaults):
            _, created = MarqueeItem.objects.get_or_create(
                title_en=title,
                defaults={
                    'description_en': desc,
                    'display_order': idx,
                    'is_visible': True,
                },
            )
            if created:
                self.stdout.write(f'  Created marquee item: {title}')

        # Industries
        industry_defaults = [
            ('Education', 'Learning platforms, student systems, academic portals, and institutional digital operations.',
             ['Learning platforms', 'Student management', 'Academic workflows']),
            ('Enterprise', 'ERP, integrations, internal platforms, automation, and data-driven business systems.',
             ['ERP systems', 'Business automation', 'Data integration']),
            ('SMEs', 'Growth-focused systems that help teams manage customers, operations, services, and digital channels.',
             ['Customer platforms', 'Operations tools', 'Scalable web/mobile apps']),
            ('Government & Public Sector', 'Digital service delivery, workflow systems, data management, and citizen-facing platforms.',
             ['Service portals', 'Workflow digitization', 'Data management']),
        ]
        for idx, (title, desc, focus) in enumerate(industry_defaults):
            _, created = Industry.objects.get_or_create(
                title_en=title,
                defaults={
                    'description_en': desc,
                    'focus_areas_en': focus,
                    'display_order': idx,
                    'is_visible': True,
                },
            )
            if created:
                self.stdout.write(f'  Created industry: {title}')

        # Section configs
        for idx, (key, label) in enumerate(HOMEPAGE_SECTION_KEYS):
            _, created = HomepageSectionConfig.objects.get_or_create(
                section_key=key,
                defaults={
                    'display_order': idx,
                    'is_visible': True,
                },
            )
            if created:
                self.stdout.write(f'  Created section config: {key}')

        self.stdout.write(self.style.SUCCESS('Seed complete.'))
