# Data migration: seed initial professional training programs.
# Uses get_or_create to be safe for re-runs and existing data.
#
# Reverse operation is intentionally a no-op:
#   We cannot safely distinguish rows that were seeded by this migration
#   from rows that were later edited by CMS users or created manually with
#   the same slug. Deleting them could destroy user-modified production data.
#   A no-op reverse is the safest choice; the rows are harmless if the
#   migration is rolled back.

from django.db import migrations


PROGRAMS = [
    ('frontend-development', 'Frontend Development'),
    ('backend-development', 'Backend Development'),
    ('flutter-development', 'Flutter Development'),
    ('basic-python', 'Basic Python'),
    ('cpp-programming', 'C++ Programming'),
    ('problem-solving-data-structures', 'Problem Solving & Data Structures'),
    ('devops-engineering', 'DevOps Engineering'),
]


def seed_programs(apps, schema_editor):
    """Insert professional programs if they do not already exist."""
    Program = apps.get_model('training', 'Program')
    for order, (slug, title) in enumerate(PROGRAMS, start=100):
        Program.objects.get_or_create(
            slug=slug,
            defaults={
                'title_en': title,
                'branch': 'professional',
                'status': 'active',
                'registration_open': True,
                'registration_url': '',
                'display_order': order,
            },
        )


def reverse_noop(apps, schema_editor):
    """No-op: cannot safely delete rows that may have been user-modified."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0002_registration_and_certificates'),
    ]

    operations = [
        migrations.RunPython(seed_programs, reverse_noop),
    ]
