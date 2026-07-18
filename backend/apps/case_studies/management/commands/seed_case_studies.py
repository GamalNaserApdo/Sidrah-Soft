"""Seed the five case studies currently shown on the public website.

This command mirrors the static list in
``src/data/caseStudies/caseStudiesData.js``. It preserves the existing English
titles, summaries, ordering, and industries. No client claims, metrics, or
outcomes are invented; the values are taken directly from the frontend source.
"""
from django.core.management.base import BaseCommand

from apps.services.models import Service

from ...models import CaseStudy


SEED_CASE_STUDIES = [
    {
        'slug': 'enterprise-erp-transformation',
        'title_en': 'Enterprise ERP Transformation',
        'client_name_en': 'Confidential Enterprise Client',
        'short_description_en': (
            'Unified disconnected processes into a centralized ERP and workflow automation platform.'
        ),
        'problem_en': 'Disconnected processes and fragmented data.',
        'solution_en': 'Centralized ERP and workflow automation.',
        'technology_en': 'ERP, Integrations, Automation',
        'outcome_en': 'Improved visibility and faster operational decisions.',
        'industry_en': 'Enterprise Operations',
        'industry_ar': 'عمليات المؤسسات',
        'display_order': 1,
        'is_featured': True,
        'show_on_homepage': True,
        'service_slugs': ['erp-solutions'],
        'project_year': 2026,
    },
    {
        'slug': 'education-learning-platform',
        'title_en': 'Education Learning Platform',
        'client_name_en': 'Vision & AlQalam Education Network',
        'short_description_en': (
            'Unified learning and student management platform for modern academic institutions.'
        ),
        'problem_en': 'Manual academic workflows and limited digital access.',
        'solution_en': 'Unified learning and student management platform.',
        'technology_en': 'Web Platform, Student Systems, Cloud',
        'outcome_en': 'Better accessibility and streamlined academic operations.',
        'industry_en': 'Education Technology',
        'industry_ar': 'تقنية التعليم',
        'display_order': 2,
        'is_featured': True,
        'show_on_homepage': True,
        'service_slugs': ['web-applications'],
        'project_year': 2026,
    },
    {
        'slug': 'ai-assisted-workflows',
        'title_en': 'AI-Assisted Workflow Automation',
        'client_name_en': 'Confidential Operations Client',
        'short_description_en': (
            'Automated repetitive manual tasks using AI-assisted workflows and process intelligence.'
        ),
        'problem_en': 'Repetitive manual tasks consuming team resources.',
        'solution_en': 'AI-assisted workflows and automated processes.',
        'technology_en': 'AI, Automation, Analytics',
        'outcome_en': 'Reduced operational overhead and improved efficiency.',
        'industry_en': 'AI & Automation',
        'industry_ar': 'الذكاء الاصطناعي والأتمتة',
        'display_order': 3,
        'is_featured': True,
        'show_on_homepage': True,
        'service_slugs': ['ai-solutions'],
        'project_year': 2026,
    },
    {
        'slug': 'healthcare-appointment-system',
        'title_en': 'Healthcare Appointment & Records System',
        'client_name_en': 'Regional Healthcare Provider',
        'short_description_en': (
            'Modernized patient scheduling and records access for a regional healthcare provider.'
        ),
        'problem_en': 'Manual appointment scheduling and fragmented patient records.',
        'solution_en': 'Integrated appointment and electronic records system.',
        'technology_en': 'Web Platform, HIPAA-ready Cloud, Integrations',
        'outcome_en': 'Shorter wait times and more reliable record access.',
        'industry_en': 'Healthcare',
        'industry_ar': 'الرعاية الصحية',
        'display_order': 4,
        'is_featured': False,
        'show_on_homepage': False,
        'service_slugs': ['web-applications'],
        'project_year': 2026,
    },
    {
        'slug': 'logistics-tracking-platform',
        'title_en': 'Logistics Tracking Platform',
        'client_name_en': 'Regional Logistics Operator',
        'short_description_en': (
            'Real-time shipment tracking and fleet coordination platform for a logistics operator.'
        ),
        'problem_en': 'Limited visibility into shipment status and fleet coordination.',
        'solution_en': 'Real-time tracking platform with fleet dashboards.',
        'technology_en': 'Mobile Apps, Maps API, Cloud',
        'outcome_en': 'Improved delivery reliability and fleet utilization.',
        'industry_en': 'Logistics',
        'industry_ar': 'الخدمات اللوجستية',
        'display_order': 5,
        'is_featured': False,
        'show_on_homepage': False,
        'service_slugs': ['mobile-applications'],
        'project_year': 2026,
    },
]


def _service_map():
    """Return a slug-to-Service mapping for confident service relationships."""
    return {
        service.slug: service
        for service in Service.objects.filter(is_active=True)
    }


class Command(BaseCommand):
    help = 'Seed the five case studies defined in frontend caseStudiesData.js.'

    def handle(self, *args, **options):
        services = _service_map()
        created_count = 0
        updated_count = 0

        for data in SEED_CASE_STUDIES:
            service_slugs = data.pop('service_slugs', [])
            case_study, created = CaseStudy.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'is_active': True,
                    **data,
                },
            )

            related_services = [
                services[slug]
                for slug in service_slugs
                if slug in services
            ]
            if related_services:
                case_study.services.set(related_services)
            else:
                case_study.services.clear()

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded case studies: {created_count} created, {updated_count} updated.'
            )
        )
