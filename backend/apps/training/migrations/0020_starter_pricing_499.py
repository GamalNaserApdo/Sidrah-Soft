"""Starter pricing update: 99 EGP -> 499 EGP.

Data changes (forward):
1. ProgramLanding.current_price -> 499.00 for exactly the five canonical
   Starter program slugs. Stable slug identifiers only — never branch-wide.
2. StarterCampaignConfig submit-button copy is normalized ONLY where the
   stored value still equals the old default text (which advertised 99).
   Customized button copy is never touched.

Schema changes: two AlterField operations so the *default* button copy
becomes price-neutral (the 99 price is no longer the business price).

Reverse: restores 99.00 ONLY for landings still at 499.00 — a price that
was manually changed after this migration is never overwritten. Stored
button copy is restored only when it still equals the new neutral default.
"""
from django.db import migrations, models

STARTER_SLUGS = [
    'starter-python-programming',
    'starter-frontend-development',
    'starter-data-analysis',
    'starter-flutter-development',
    'starter-icdl-digital-skills',
]

OLD_BUTTON_EN = 'Register Now — Start for 99 EGP Only'
OLD_BUTTON_AR = 'سجّل الآن — ابدأ بـ99 جنيه فقط'
NEW_BUTTON_EN = 'Register Now'
NEW_BUTTON_AR = 'سجّل الآن'


def forwards(apps, schema_editor):
    Program = apps.get_model('training', 'Program')
    ProgramLanding = apps.get_model('training', 'ProgramLanding')
    StarterCampaignConfig = apps.get_model('training', 'StarterCampaignConfig')

    # Only rewrite the known old business price (99.00). A landing that
    # already holds another value was deliberately changed and is reported,
    # not overwritten.
    updated = ProgramLanding.objects.filter(
        program__slug__in=STARTER_SLUGS,
        current_price=99,
    ).update(current_price=499)

    skipped = ProgramLanding.objects.filter(
        program__slug__in=STARTER_SLUGS,
    ).exclude(current_price=499).values_list('program__slug', 'current_price')
    for slug, price in skipped:
        print(
            f'  [0020] SKIPPED {slug!r}: current_price={price!r} '
            f'(not the expected legacy 99)'
        )
    print(f'  [0020] Starter landings set to 499.00 EGP: {updated}')

    # Normalize stored button copy only where it is still the old default.
    StarterCampaignConfig.objects.filter(form_button_en=OLD_BUTTON_EN).update(
        form_button_en=NEW_BUTTON_EN,
    )
    StarterCampaignConfig.objects.filter(form_button_ar=OLD_BUTTON_AR).update(
        form_button_ar=NEW_BUTTON_AR,
    )

    # Report any Starter-branch program NOT covered by the canonical list.
    unmapped = Program.objects.filter(branch='starter').exclude(
        slug__in=STARTER_SLUGS,
    ).values_list('slug', flat=True)
    for slug in unmapped:
        print(
            f'  [0020] UNMAPPED starter program left unchanged: slug={slug!r}'
        )


def backwards(apps, schema_editor):
    ProgramLanding = apps.get_model('training', 'ProgramLanding')
    StarterCampaignConfig = apps.get_model('training', 'StarterCampaignConfig')

    # Restore 99.00 only where the value is still exactly what forward set —
    # never overwrite a price that was manually changed afterwards.
    ProgramLanding.objects.filter(
        program__slug__in=STARTER_SLUGS,
        current_price=499,
    ).update(current_price=99)

    StarterCampaignConfig.objects.filter(form_button_en=NEW_BUTTON_EN).update(
        form_button_en=OLD_BUTTON_EN,
    )
    StarterCampaignConfig.objects.filter(form_button_ar=NEW_BUTTON_AR).update(
        form_button_ar=OLD_BUTTON_AR,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0019_populate_program_tracks'),
    ]

    operations = [
        migrations.AlterField(
            model_name='startercampaignconfig',
            name='form_button_en',
            field=models.CharField(
                default='Register Now',
                max_length=120,
                verbose_name='Submit Button (English)',
            ),
        ),
        migrations.AlterField(
            model_name='startercampaignconfig',
            name='form_button_ar',
            field=models.CharField(
                default='سجّل الآن',
                max_length=120,
                verbose_name='Submit Button (Arabic)',
            ),
        ),
        migrations.RunPython(forwards, backwards),
    ]
