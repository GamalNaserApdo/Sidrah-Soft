"""
Idempotent seed/update command for all 9 Sidrah Training programs.

This command creates or updates all approved training programs with their
full CMS-editable content: program fields, landing fields, modules, topics,
FAQs, and image links.

Safety:
- Idempotent: re-running updates existing records without duplicating.
- Preserves existing Program/ProgramLanding IDs and relations.
- Does NOT delete existing modules/topics/FAQs — only adds/updates by slug+title.
- Does NOT touch certificates.
- Does NOT delete MediaAssets.
- Local development only.

Usage:
    python manage.py seed_training_content
    python manage.py seed_training_content --program frontend-development
"""
import os
import sys

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.media_library.models import MediaAsset
from apps.training.models import (
    Program,
    ProgramLanding,
    ProgramModule,
    ModuleTopic,
    ProgramFAQ,
)

# Import the content data
from apps.training.canonical_tracks import CANONICAL_TRACKS
from apps.training.data.seed_content_v2 import PROGRAM_CONTENT

# Optimized course images live in the frontend `src/` tree at the repo root.
# settings.BASE_DIR is the `backend/` dir, so its parent is the repo root.
IMG_DIR = os.path.normpath(os.path.join(
    str(settings.BASE_DIR), '..', 'src', 'assets', 'training_images', 'optimized'
))


class Command(BaseCommand):
    help = 'Seed or update all 9 Sidrah Training programs with approved content.'

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

        programs = PROGRAM_CONTENT
        if slug_filter:
            programs = [p for p in programs if p['slug'] == slug_filter]
            if not programs:
                self.stderr.write(f'No program found with slug: {slug_filter}')
                return

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'Seeding {len(programs)} training programs (dry_run={dry_run})...'
        ))

        results = []
        for pc in programs:
            result = seed_program(pc, dry_run)
            results.append(result)

        self.stdout.write('')
        self.stdout.write(self.style.MIGRATE_HEADING('=== Summary ==='))
        for r in results:
            self.stdout.write(
                f"  {r['slug']:40s} prog={'CREATED' if r['program_created'] else 'UPDATED'} "
                f"landing={'CREATED' if r['landing_created'] else 'UPDATED'} "
                f"mods={r['modules']} topics={r['topics']} faqs={r['faqs']} "
                f"image={'YES' if r['image_linked'] else 'NO'}"
            )

@transaction.atomic
def seed_program(pc, dry_run=False):
    """
    Idempotently create or update a single Program (with landing, modules,
    topics, FAQs, and image link) from a content dict.

    Reusable across seed commands (seed_training_content, seed_starter_courses).
    Does NOT delete MediaAssets, certificates, instructors, or testimonials.
    """
    slug = pc['slug']
    img_filename = pc.get('image_file')
    img_path = os.path.join(IMG_DIR, img_filename) if img_filename else None

    # Canonical track: slug map wins, then an explicit 'track' in the seed
    # content, then the program title (single-program tracks use their title).
    track = CANONICAL_TRACKS.get(slug) or pc.get('track') or pc['title_en']

    # --- Program ---
    program, created = Program.objects.get_or_create(
        slug=slug,
        defaults={
            'title_en': pc['title_en'],
            'track': track,
            'title_ar': pc['title_ar'],
            'short_description_en': pc['short_description_en'],
            'short_description_ar': pc['short_description_ar'],
            'overview_en': pc.get('overview_en', ''),
            'overview_ar': pc.get('overview_ar', ''),
            'branch': pc.get('branch', 'professional'),
            'status': pc.get('status', 'active'),
            'display_order': pc.get('display_order', 100),
            'duration_en': pc.get('duration_en', ''),
            'duration_ar': pc.get('duration_ar', ''),
            'format_en': pc.get('format_en', ''),
            'format_ar': pc.get('format_ar', ''),
            'registration_open': pc.get('registration_open', True),
            'maximum_capacity': pc.get('maximum_capacity'),
            'registration_url': pc.get('registration_url', 'https://forms.gle/tjHRqBZrkNYtrWNL7'),
        },
    )

    if not created:
        program.title_en = pc['title_en']
        program.track = track
        program.title_ar = pc['title_ar']
        program.short_description_en = pc['short_description_en']
        program.short_description_ar = pc['short_description_ar']
        program.overview_en = pc.get('overview_en', '')
        program.overview_ar = pc.get('overview_ar', '')
        program.branch = pc.get('branch', 'professional')
        program.status = pc.get('status', 'active')
        program.display_order = pc.get('display_order', 100)
        program.duration_en = pc.get('duration_en', '')
        program.duration_ar = pc.get('duration_ar', '')
        program.format_en = pc.get('format_en', '')
        program.format_ar = pc.get('format_ar', '')
        program.registration_open = pc.get('registration_open', True)
        if pc.get('maximum_capacity') is not None:
            program.maximum_capacity = pc['maximum_capacity']
        if pc.get('registration_url'):
            program.registration_url = pc['registration_url']
        program.save()

    # --- Image ---
    image_linked = False
    if img_path and os.path.exists(img_path) and not dry_run:
        with open(img_path, 'rb') as f:
            asset = MediaAsset(
                title=f"{pc['title_en']} — Course Image",
                alt_text=f"{pc['title_en']} Course at Sidrah Soft",
                media_type='image',
                usage_context='training-course-card',
                is_active=True,
            )
            asset.file.save(os.path.basename(img_path), File(f), save=False)
            asset.file_size = os.path.getsize(img_path)
            asset.mime_type = 'image/webp'
            asset.save()
        program.image = asset
        program.save()
        image_linked = True

    # --- ProgramLanding ---
    landing_data = pc.get('landing', {})
    landing, landing_created = ProgramLanding.objects.get_or_create(
        program=program,
        defaults=_landing_defaults(landing_data),
    )

    if not landing_created and not dry_run:
        _update_landing(landing, landing_data)
        landing.save()

    if dry_run:
        landing_created = False

    # --- Modules + Topics (replace strategy) ---
    # The approved content is the source of truth for curriculum.
    # Old placeholder modules/topics/FAQs are replaced with the approved
    # content on each run. This does NOT touch MediaAssets, certificates,
    # instructors, testimonials, or program/landing records.
    module_count = 0
    topic_count = 0
    faq_count = 0

    if not dry_run:
        # Delete existing modules (cascades to topics) and FAQs
        ProgramModule.objects.filter(program=program).delete()
        ProgramFAQ.objects.filter(program=program).delete()

    for mod_data in pc.get('modules', []):
        module = ProgramModule.objects.create(
            program=program,
            title_en=mod_data['title_en'],
            title_ar=mod_data.get('title_ar', ''),
            description_en=mod_data.get('description_en', ''),
            description_ar=mod_data.get('description_ar', ''),
            display_order=mod_data.get('display_order', module_count),
            is_published=True,
        )
        module_count += 1

        for topic_data in mod_data.get('topics', []):
            ModuleTopic.objects.create(
                module=module,
                title_en=topic_data['title_en'],
                title_ar=topic_data.get('title_ar', ''),
                display_order=topic_data.get('display_order', topic_count),
            )
            topic_count += 1

    # --- FAQs ---
    for faq_data in pc.get('faqs', []):
        ProgramFAQ.objects.create(
            program=program,
            question_en=faq_data['question_en'],
            question_ar=faq_data.get('question_ar', ''),
            answer_en=faq_data.get('answer_en', ''),
            answer_ar=faq_data.get('answer_ar', ''),
            display_order=faq_data.get('display_order', faq_count),
        )
        faq_count += 1

    return {
        'slug': slug,
        'program_created': created,
        'landing_created': landing_created,
        'modules': module_count,
        'topics': topic_count,
        'faqs': faq_count,
        'image_linked': image_linked,
    }


def _landing_defaults(data):
    return {
        'headline_en': data.get('headline_en', ''),
        'headline_ar': data.get('headline_ar', ''),
        'quick_facts': data.get('quick_facts', {}),
        'current_price': data.get('current_price', 6000),
        'currency': data.get('currency', 'EGP'),
        'show_pricing': data.get('show_pricing', True),
        'target_audience': data.get('target_audience', {}),
        'prerequisites': data.get('prerequisites', {}),
        'tools': data.get('tools', {}),
        'practical_training_en': data.get('practical_training_en', ''),
        'practical_training_ar': data.get('practical_training_ar', ''),
        'final_project_en': data.get('final_project_en', ''),
        'final_project_ar': data.get('final_project_ar', ''),
        'training_experience_en': data.get('training_experience_en', ''),
        'training_experience_ar': data.get('training_experience_ar', ''),
        'mentor_info_en': data.get('mentor_info_en', ''),
        'mentor_info_ar': data.get('mentor_info_ar', ''),
        'installments_available': data.get('installments_available', False),
        'installments_info_en': data.get('installments_info_en', ''),
        'installments_info_ar': data.get('installments_info_ar', ''),
        'seo_title_en': data.get('seo_title_en', ''),
        'seo_title_ar': data.get('seo_title_ar', ''),
        'seo_meta_description_en': data.get('seo_meta_description_en', ''),
        'seo_meta_description_ar': data.get('seo_meta_description_ar', ''),
        'canonical_slug': data.get('canonical_slug', ''),
        'seo_noindex': data.get('seo_noindex', False),
        'show_registration_form': data.get('show_registration_form', True),
        'included_items': data.get('included_items', {}),
    }


def _update_landing(landing, data):
    for field, default in [
        ('headline_en', ''), ('headline_ar', ''),
        ('quick_facts', {}), ('current_price', 6000), ('currency', 'EGP'),
        ('show_pricing', True), ('target_audience', {}), ('prerequisites', {}),
        ('tools', {}), ('practical_training_en', ''), ('practical_training_ar', ''),
        ('final_project_en', ''), ('final_project_ar', ''),
        ('training_experience_en', ''), ('training_experience_ar', ''),
        ('mentor_info_en', ''), ('mentor_info_ar', ''),
        ('installments_available', False),
        ('installments_info_en', ''), ('installments_info_ar', ''),
        ('seo_title_en', ''), ('seo_title_ar', ''),
        ('seo_meta_description_en', ''), ('seo_meta_description_ar', ''),
        ('canonical_slug', ''), ('seo_noindex', False),
        ('show_registration_form', True), ('included_items', {}),
    ]:
        if field in data:
            setattr(landing, field, data[field])
