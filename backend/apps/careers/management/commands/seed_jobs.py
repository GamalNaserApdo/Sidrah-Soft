from django.core.management.base import BaseCommand

from ...models import Job


# The four role-area cards from src/components/sections/CareersSection.jsx.
# These represent evergreen career tracks rather than concrete live vacancies.
JOB_SEED_DATA = [
    {
        'slug': 'software-engineering',
        'title_en': 'Software Engineering',
        'title_ar': 'هندسة البرمجيات',
        'department_en': 'Software Engineering',
        'department_ar': 'هندسة البرمجيات',
        'short_description_en': (
            'Build scalable web platforms, enterprise applications, '
            'and next-generation digital products.'
        ),
        'short_description_ar': (
            'ابنِ منصات ويب قابلة للتوسع، وتطبيقات مؤسسية، '
            'ومنتجات رقمية من الجيل التالي.'
        ),
        'display_order': 1,
    },
    {
        'slug': 'ai-automation',
        'title_en': 'AI & Automation',
        'title_ar': 'الذكاء الاصطناعي والأتمتة',
        'department_en': 'AI & Automation',
        'department_ar': 'الذكاء الاصطناعي والأتمتة',
        'short_description_en': (
            'Design intelligent systems, automation workflows, '
            'and AI-powered solutions.'
        ),
        'short_description_ar': (
            'صمّم أنظمة ذكية، وسير عمل آلي، '
            'وحلول مدعومة بالذكاء الاصطناعي.'
        ),
        'display_order': 2,
    },
    {
        'slug': 'ui-ux-design',
        'title_en': 'UI/UX Design',
        'title_ar': 'تصميم تجربة وواجهة المستخدم',
        'department_en': 'UI/UX Design',
        'department_ar': 'تصميم تجربة وواجهة المستخدم',
        'short_description_en': (
            'Craft intuitive experiences, interfaces, and digital journeys '
            'that users love.'
        ),
        'short_description_ar': (
            'صمّم تجارب وواجهات ورحلات رقمية بديهية '
            'يحبها المستخدمون.'
        ),
        'display_order': 3,
    },
    {
        'slug': 'business-operations',
        'title_en': 'Business & Operations',
        'title_ar': 'الأعمال والعمليات',
        'department_en': 'Business & Operations',
        'department_ar': 'الأعمال والعمليات',
        'short_description_en': (
            'Support growth, partnerships, project delivery, '
            'and operational excellence.'
        ),
        'short_description_ar': (
            'ادعم النمو، والشراكات، وتسليم المشاريع، '
            'والتميز التشغيلي.'
        ),
        'display_order': 4,
    },
]


class Command(BaseCommand):
    help = (
        'Seed or update the four evergreen career tracks from the existing '
        'CareersSection fallback content.'
    )

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in JOB_SEED_DATA:
            defaults = {
                'title_en': item['title_en'],
                'title_ar': item['title_ar'],
                'department_en': item['department_en'],
                'department_ar': item['department_ar'],
                'short_description_en': item['short_description_en'],
                'short_description_ar': item['short_description_ar'],
                'employment_type': Job.EMPLOYMENT_TYPE_OTHER,
                'workplace_type': Job.WORKPLACE_TYPE_HYBRID,
                'experience_level': Job.EXPERIENCE_LEVEL_UNSPECIFIED,
                'application_method': Job.APPLICATION_METHOD_CONTACT_PAGE,
                'display_order': item['display_order'],
                'is_active': True,
                'is_featured': False,
                'show_on_homepage': True,
            }
            _, created = Job.objects.update_or_create(
                slug=item['slug'],
                defaults=defaults,
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded jobs: {created_count} created, {updated_count} updated.'
            )
        )
