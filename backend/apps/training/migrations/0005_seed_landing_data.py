"""Data migration: seed full landing page content for the 7 professional programs.

This migration imports from a FROZEN data snapshot (_seed_data_frozen.py)
inside the migrations package. This ensures the migration is self-contained
and does not depend on mutable application code (apps.training.data).

It is idempotent: it uses get_or_create / update_or_create keyed by slug
and natural keys, so re-running (e.g. after a rollback + re-apply) is safe
and will NOT overwrite CMS user edits made after the initial seeding.

Reverse is a no-op: we cannot safely distinguish seeded rows from
user-edited rows.
"""
from django.db import migrations

from ._seed_data_frozen import PROGRAMS, REGISTRATION_URL, CURRENT_PRICE, CURRENCY


def _update_program(Program, slug, course_data):
    """Update an existing Program with full content fields."""
    try:
        program = Program.objects.get(slug=slug)
    except Program.DoesNotExist:
        return None

    c = course_data
    program.title_en = c.get('titleEn') or program.title_en
    program.title_ar = c.get('titleAr') or program.title_ar
    program.short_description_en = c.get('shortDescriptionEn') or program.short_description_en
    program.short_description_ar = c.get('shortDescriptionAr') or program.short_description_ar
    program.overview_en = c.get('overviewEn') or program.overview_en
    program.overview_ar = c.get('overviewAr') or program.overview_ar
    program.duration_en = c.get('durationEn') or program.duration_en
    program.duration_ar = c.get('durationAr') or program.duration_ar
    program.format_en = c.get('formatEn') or program.format_en
    program.format_ar = c.get('formatAr') or program.format_ar
    program.schedule_en = c.get('scheduleEn') or program.schedule_en
    program.schedule_ar = c.get('scheduleAr') or program.schedule_ar
    program.cta_text_en = c.get('ctaTextEn') or program.cta_text_en
    program.cta_text_ar = c.get('ctaTextAr') or program.cta_text_ar

    # Registration settings
    program.registration_open = True
    program.registration_url = REGISTRATION_URL
    program.branch = 'professional'
    program.status = 'active'

    # JSON fields (skills, learning outcomes, modules — kept for backward compat)
    program.skills_en = c.get('skillsEn') or []
    program.skills_ar = c.get('skillsAr') or []

    # Save
    program.save()
    return program


def _seed_landing(ProgramLanding, program, landing_data):
    """Create or update the ProgramLanding record for a program."""
    obj, created = ProgramLanding.objects.get_or_create(
        program=program,
        defaults=_landing_defaults(landing_data),
    )
    if not created:
        # Only fill in fields that are empty (don't overwrite CMS edits)
        changed = False
        defaults = _landing_defaults(landing_data)
        for field, value in defaults.items():
            current = getattr(obj, field)
            if not current and value:
                setattr(obj, field, value)
                changed = True
        if changed:
            obj.save()
    return obj


def _landing_defaults(ld):
    """Build ProgramLanding field defaults from landing data dict."""
    headline = ld.get('headline') or {}
    video_title = ld.get('videoTitle') or {}
    quick_facts = ld.get('quickFacts') or {}
    pricing = ld.get('pricing') or {}
    target_audience = ld.get('targetAudience') or {}
    prerequisites = ld.get('prerequisites') or {}
    tools = ld.get('tools') or {}
    practical = ld.get('practicalTraining') or {}
    final_project = ld.get('finalProject') or {}
    seo_title = ld.get('seoTitle') or {}
    seo_desc = ld.get('seoDescription') or {}
    included = pricing.get('includedItems') or {}

    return {
        'headline_en': headline.get('en', ''),
        'headline_ar': headline.get('ar', ''),
        'intro_video_type': ld.get('introVideoType') or 'none',
        'intro_video_url': ld.get('introVideoUrl') or '',
        'video_title_en': video_title.get('en', ''),
        'video_title_ar': video_title.get('ar', ''),
        'quick_facts': quick_facts,
        'current_price': CURRENT_PRICE,
        'original_price': pricing.get('originalPrice'),
        'currency': pricing.get('currency') or CURRENCY,
        'included_items': included,
        'show_pricing': True,
        'target_audience': target_audience,
        'prerequisites': prerequisites,
        'tools': tools,
        'practical_training_en': practical.get('en', ''),
        'practical_training_ar': practical.get('ar', ''),
        'final_project_en': final_project.get('en', ''),
        'final_project_ar': final_project.get('ar', ''),
        'seo_title_en': seo_title.get('en', ''),
        'seo_title_ar': seo_title.get('ar', ''),
        'seo_meta_description_en': seo_desc.get('en', ''),
        'seo_meta_description_ar': seo_desc.get('ar', ''),
    }


def _seed_curriculum(ProgramModule, ModuleTopic, program, landing_data):
    """Create ProgramModule and ModuleTopic records from landing curriculum."""
    curriculum = landing_data.get('curriculum') or []
    for idx, module_data in enumerate(curriculum):
        title = module_data.get('title') or {}
        desc = module_data.get('description') or {}
        topics = module_data.get('topics') or {}

        # Use title_en as natural key for idempotency
        module, created = ProgramModule.objects.get_or_create(
            program=program,
            title_en=title.get('en', f'Module {idx + 1}'),
            defaults={
                'title_ar': title.get('ar', ''),
                'description_en': desc.get('en', ''),
                'description_ar': desc.get('ar', ''),
                'display_order': idx,
                'is_published': True,
            },
        )
        if not created:
            # Fill in missing fields
            changed = False
            if not module.title_ar and title.get('ar'):
                module.title_ar = title['ar']
                changed = True
            if not module.description_en and desc.get('en'):
                module.description_en = desc['en']
                changed = True
            if not module.description_ar and desc.get('ar'):
                module.description_ar = desc['ar']
                changed = True
            if changed:
                module.save()

        # Seed topics
        topics_en = topics.get('en') or []
        topics_ar = topics.get('ar') or []
        for t_idx, topic_en in enumerate(topics_en):
            topic_ar = topics_ar[t_idx] if t_idx < len(topics_ar) else ''
            ModuleTopic.objects.get_or_create(
                module=module,
                title_en=topic_en,
                defaults={
                    'title_ar': topic_ar,
                    'display_order': t_idx,
                },
            )


def _seed_learning_outcomes(Program, program, landing_data):
    """Update Program learning_outcomes JSON fields from landing data."""
    outcomes = landing_data.get('learningOutcomes') or {}
    outcomes_en = outcomes.get('en') or []
    outcomes_ar = outcomes.get('ar') or []
    if outcomes_en and not program.learning_outcomes_en:
        program.learning_outcomes_en = outcomes_en
        program.save(update_fields=['learning_outcomes_en'])
    if outcomes_ar and not program.learning_outcomes_ar:
        program.learning_outcomes_ar = outcomes_ar
        program.save(update_fields=['learning_outcomes_ar'])


def _seed_faq(ProgramFAQ, program, landing_data):
    """Create ProgramFAQ records from landing data."""
    faqs = landing_data.get('faq') or []
    for idx, faq_data in enumerate(faqs):
        q = faq_data.get('question') or {}
        a = faq_data.get('answer') or {}
        ProgramFAQ.objects.get_or_create(
            program=program,
            question_en=q.get('en', ''),
            defaults={
                'question_ar': q.get('ar', ''),
                'answer_en': a.get('en', ''),
                'answer_ar': a.get('ar', ''),
                'display_order': idx,
            },
        )


def _seed_testimonials(ProgramTestimonial, program, landing_data):
    """Create ProgramTestimonial records from landing data (approved=False)."""
    testimonials = landing_data.get('testimonials') or []
    for idx, t_data in enumerate(testimonials):
        name = t_data.get('name') or {}
        content = t_data.get('content') or {}
        rating = t_data.get('rating') or 5
        ProgramTestimonial.objects.get_or_create(
            program=program,
            student_name_en=name.get('en', ''),
            defaults={
                'student_name_ar': name.get('ar', ''),
                'content_en': content.get('en', ''),
                'content_ar': content.get('ar', ''),
                'rating': rating,
                'is_approved': False,  # Never auto-approve
                'display_order': idx,
            },
        )


def _seed_instructors(Instructor, ProgramInstructor, program, landing_data):
    """Create Instructor and ProgramInstructor records from landing data."""
    instructors = landing_data.get('instructors') or []
    for idx, inst_data in enumerate(instructors):
        name = inst_data.get('name') or {}
        title = inst_data.get('title') or {}
        bio = inst_data.get('bio') or {}

        instructor, created = Instructor.objects.get_or_create(
            name_en=name.get('en', ''),
            defaults={
                'name_ar': name.get('ar', ''),
                'title_en': title.get('en', ''),
                'title_ar': title.get('ar', ''),
                'bio_en': bio.get('en', ''),
                'bio_ar': bio.get('ar', ''),
                'linkedin_url': inst_data.get('linkedin') or '',
                'is_active': True,
            },
        )

        ProgramInstructor.objects.get_or_create(
            program=program,
            instructor=instructor,
            defaults={'display_order': idx},
        )


def seed_landing_data(apps, schema_editor):
    """Populate all 7 professional programs with full landing page content."""
    Program = apps.get_model('training', 'Program')
    ProgramLanding = apps.get_model('training', 'ProgramLanding')
    ProgramModule = apps.get_model('training', 'ProgramModule')
    ModuleTopic = apps.get_model('training', 'ModuleTopic')
    Instructor = apps.get_model('training', 'Instructor')
    ProgramInstructor = apps.get_model('training', 'ProgramInstructor')
    ProgramTestimonial = apps.get_model('training', 'ProgramTestimonial')
    ProgramFAQ = apps.get_model('training', 'ProgramFAQ')

    for slug, payload in PROGRAMS.items():
        course_data = payload.get('course') or {}
        landing_data = payload.get('landing') or {}

        program = _update_program(Program, slug, course_data)
        if not program:
            continue

        _seed_learning_outcomes(Program, program, landing_data)
        _seed_landing(ProgramLanding, program, landing_data)
        _seed_curriculum(ProgramModule, ModuleTopic, program, landing_data)
        _seed_faq(ProgramFAQ, program, landing_data)
        _seed_testimonials(ProgramTestimonial, program, landing_data)
        _seed_instructors(Instructor, ProgramInstructor, program, landing_data)


def reverse_noop(apps, schema_editor):
    """No-op: cannot safely delete user-modified rows."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0004_landing_models'),
    ]

    operations = [
        migrations.RunPython(seed_landing_data, reverse_noop),
    ]
