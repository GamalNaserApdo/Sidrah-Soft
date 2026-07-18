"""Seed the Insights database with the five original articles.

This command is idempotent: running it twice creates zero duplicates.
It uses the article slug as the stable key and calls update_or_create.
"""
import re
from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.insights.models import STATUS_PUBLISHED, Article


SEED_ARTICLES = [
    {
        'title_en': 'Building systems that scale beyond the first launch',
        'slug': 'building-systems-that-scale',
        'excerpt_en': (
            'Why successful digital products need architecture, operations, '
            'and long-term maintainability from day one.'
        ),
        'category_en': 'Software Development',
        'read_time_minutes': 5,
        'published_at': '2026-01-15T00:00:00+00:00',
        'is_featured': True,
        'show_on_homepage': True,
        'display_order': 0,
        'seo_title_en': 'Building systems that scale beyond the first launch | Sidrah Soft',
        'seo_description_en': (
            'Why successful digital products need architecture, operations, '
            'and long-term maintainability from day one.'
        ),
    },
    {
        'title_en': 'Where automation creates real business value',
        'slug': 'where-automation-creates-real-business-value',
        'excerpt_en': (
            'How organizations can identify repeatable workflows and turn them '
            'into measurable operational efficiency.'
        ),
        'category_en': 'Automation',
        'read_time_minutes': 4,
        'published_at': '2026-02-03T00:00:00+00:00',
        'is_featured': True,
        'show_on_homepage': True,
        'display_order': 1,
        'seo_title_en': 'Where automation creates real business value | Sidrah Soft',
        'seo_description_en': (
            'How organizations can identify repeatable workflows and turn them '
            'into measurable operational efficiency.'
        ),
    },
    {
        'title_en': 'Designing digital foundations for modern learning',
        'slug': 'designing-digital-foundations-for-modern-learning',
        'excerpt_en': (
            'How academic institutions can prepare platforms, student systems, '
            'and future learning experiences.'
        ),
        'category_en': 'Education Technology',
        'read_time_minutes': 6,
        'published_at': '2026-02-20T00:00:00+00:00',
        'is_featured': True,
        'show_on_homepage': True,
        'display_order': 2,
        'seo_title_en': 'Designing digital foundations for modern learning | Sidrah Soft',
        'seo_description_en': (
            'How academic institutions can prepare platforms, student systems, '
            'and future learning experiences.'
        ),
    },
    {
        'title_en': 'Moving AI from experiment to production',
        'slug': 'ai-from-experiment-to-production',
        'excerpt_en': (
            'Practical steps for taking machine-learning prototypes into '
            'reliable, maintainable production systems.'
        ),
        'category_en': 'AI',
        'read_time_minutes': 7,
        'published_at': '2026-03-05T00:00:00+00:00',
        'is_featured': False,
        'show_on_homepage': False,
        'display_order': 3,
        'seo_title_en': 'Moving AI from experiment to production | Sidrah Soft',
        'seo_description_en': (
            'Practical steps for taking machine-learning prototypes into '
            'reliable, maintainable production systems.'
        ),
    },
    {
        'title_en': 'Mobile apps that enterprises actually use',
        'slug': 'mobile-apps-that-enterprises-actually-use',
        'excerpt_en': (
            'What makes internal and customer-facing mobile applications '
            'succeed inside large organizations.'
        ),
        'category_en': 'Mobile Apps',
        'read_time_minutes': 5,
        'published_at': '2026-03-18T00:00:00+00:00',
        'is_featured': False,
        'show_on_homepage': False,
        'display_order': 4,
        'seo_title_en': 'Mobile apps that enterprises actually use | Sidrah Soft',
        'seo_description_en': (
            'What makes internal and customer-facing mobile applications '
            'succeed inside large organizations.'
        ),
    },
]

PLACEHOLDER_BODY = (
    'This article body is a placeholder seeded from the original frontend '
    'data. Replace it with the full article content through the Django Admin '
    'or a future CMS dashboard.'
)


def parse_read_time(value):
    """Extract the first integer from a reading-time string."""
    if value is None:
        return None
    match = re.search(r'\d+', str(value))
    return int(match.group()) if match else None


def parse_published_at(value):
    """Parse an ISO datetime string into a timezone-aware datetime."""
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value)
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt, timezone=timezone.utc)
        return dt
    except ValueError:
        return None


class Command(BaseCommand):
    help = 'Seed Insights articles from the original frontend dataset.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing seeded articles before recreating them.',
        )

    def handle(self, *args, **options):
        reset = options['reset']
        if reset:
            deleted, _ = Article.objects.filter(
                slug__in=[item['slug'] for item in SEED_ARTICLES],
            ).delete()
            self.stdout.write(self.style.WARNING(f'Deleted {deleted} articles.'))

        created_count = 0
        updated_count = 0

        for item in SEED_ARTICLES:
            read_time = parse_read_time(item.get('read_time_minutes'))
            published_at = parse_published_at(item.get('published_at'))

            defaults = {
                'title_en': item['title_en'],
                'excerpt_en': item['excerpt_en'],
                'category_en': item['category_en'],
                'read_time_minutes': read_time,
                'published_at': published_at,
                'status': STATUS_PUBLISHED,
                'is_featured': item.get('is_featured', False),
                'show_on_homepage': item.get('show_on_homepage', False),
                'display_order': item.get('display_order', 0),
                'seo_title_en': item.get('seo_title_en', ''),
                'seo_description_en': item.get('seo_description_en', ''),
                'body_en': PLACEHOLDER_BODY,
            }

            article, created = Article.objects.update_or_create(
                slug=item['slug'],
                defaults=defaults,
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created article: {article.title_en}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.NOTICE(f'Updated article: {article.title_en}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Seed complete. Created: {created_count}, Updated: {updated_count}.'
            )
        )
