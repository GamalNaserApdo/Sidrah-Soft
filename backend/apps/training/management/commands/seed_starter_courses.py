"""
Idempotent seed/update command for Sidrah Starter Courses + Summer Training.

Seeds the five Starter Courses (branch='starter') and the Summer Training
intake program (branch='summer') with full CMS-editable content: program
fields, landing fields, curriculum modules/topics, FAQs, and image links.

Reuses the shared `seed_program` logic from seed_training_content — it does
NOT touch the nine existing professional programs or any other product line.

Safety:
- Idempotent: re-running updates existing records without duplicating.
- Preserves existing Program/ProgramLanding IDs and relations.
- Does NOT delete existing modules/topics/FAQs of OTHER programs — only
  replaces modules/topics/FAQs belonging to the slugs in this file.
- Does NOT touch certificates or MediaAssets of other programs.
- Local development only.

Usage:
    python manage.py seed_starter_courses
    python manage.py seed_starter_courses --program starter-python-programming
    python manage.py seed_starter_courses --program summer-training
    python manage.py seed_starter_courses --dry-run
"""
import sys

from django.core.management.base import BaseCommand

from apps.training.management.commands.seed_training_content import seed_program
from apps.training.data.seed_starter_content import (
    STARTER_PROGRAM_CONTENT,
    SUMMER_PROGRAM_CONTENT,
)

ALL_PROGRAMS = STARTER_PROGRAM_CONTENT + SUMMER_PROGRAM_CONTENT


class Command(BaseCommand):
    help = (
        'Seed or update the Sidrah Starter Courses and the Summer Training '
        'program with approved content (does not touch professional programs).'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--program',
            type=str,
            default=None,
            help='Only seed/update a specific program slug.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would be done without making changes.',
        )

    def handle(self, *args, **options):
        sys.stdout.reconfigure(encoding='utf-8')
        slug_filter = options.get('program')
        dry_run = options.get('dry_run')

        programs = ALL_PROGRAMS
        if slug_filter:
            programs = [p for p in programs if p['slug'] == slug_filter]
            if not programs:
                self.stderr.write(f'No program found with slug: {slug_filter}')
                return

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'Seeding {len(programs)} starter/summer programs (dry_run={dry_run})...'
        ))

        results = []
        for pc in programs:
            results.append(seed_program(pc, dry_run))

        self.stdout.write('')
        self.stdout.write(self.style.MIGRATE_HEADING('=== Summary ==='))
        for r in results:
            self.stdout.write(
                f"  {r['slug']:40s} prog={'CREATED' if r['program_created'] else 'UPDATED'} "
                f"landing={'CREATED' if r['landing_created'] else 'UPDATED'} "
                f"mods={r['modules']} topics={r['topics']} faqs={r['faqs']} "
                f"image={'YES' if r['image_linked'] else 'NO'}"
            )
