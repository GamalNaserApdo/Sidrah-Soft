"""Populate Program.track with canonical track values.

Data-only migration: modifies ONLY Program.track for slugs present in the
canonical map. Does NOT touch registrations, statuses, payments,
certificates, titles, slugs, or branches. Programs with slugs absent from
the map are left unchanged and reported.
"""
from django.db import migrations

# FROZEN at authoring time — the canonical slug -> track map as approved.
# This migration must NOT import apps.training.canonical_tracks: historical
# migrations need immutable, self-contained data so re-running them later
# produces identical results even if the live map evolves.
CANONICAL_TRACKS = {
    'backend-development': 'Backend Development',
    'basic-python': 'Basic Python',
    'cpp-programming': 'C++ Programming Fundamentals',
    'data-analysis': 'Data Analysis',
    'devops-engineering': 'DevOps Engineering',
    'flutter-development': 'Flutter Development',
    'frontend-development': 'Frontend Development',
    'icdl': 'ICDL / Digital Skills',
    'problem-solving-data-structures': 'C++ Programming Fundamentals',
    'starter-data-analysis': 'Data Analysis',
    'starter-flutter-development': 'Flutter Development',
    'starter-frontend-development': 'Frontend Development',
    'starter-icdl-digital-skills': 'ICDL / Digital Skills',
    'starter-python-programming': 'Python Programming',
    'summer-training': 'Summer Training',
}


def populate_tracks(apps, schema_editor):
    Program = apps.get_model('training', 'Program')
    known_slugs = set(CANONICAL_TRACKS)

    for slug, track in CANONICAL_TRACKS.items():
        Program.objects.filter(slug=slug).update(track=track)

    unmapped = Program.objects.exclude(slug__in=known_slugs).values_list(
        'slug', 'title_en', 'track',
    )
    for slug, title, track in unmapped:
        print(
            f'  [0019] UNMAPPED program left unchanged: '
            f'slug={slug!r} title={title!r} track={track!r}'
        )


def clear_tracks(apps, schema_editor):
    """Restore the column-default state (track='') for mapped slugs.

    Only clears rows still holding the canonical value, so a track that was
    manually changed after this migration is never clobbered on reverse.
    """
    Program = apps.get_model('training', 'Program')
    for slug, track in CANONICAL_TRACKS.items():
        Program.objects.filter(slug=slug, track=track).update(track='')


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0018_registration_operational_fields'),
    ]

    operations = [
        migrations.RunPython(populate_tracks, clear_tracks),
    ]
