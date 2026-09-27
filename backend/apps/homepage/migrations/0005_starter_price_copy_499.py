"""Update stored homepage 'starter' path copy: drop the stale 99 price.

The training_paths JSON on HomepageSettings contains CMS-managed marketing
copy for the Starter path card that still advertises the legacy 99 EGP
price. The copy is normalized to price-neutral wording so it can never
contradict ProgramLanding.current_price. Only the 'starter' path entry is
touched; other keys are untouched.

Reverse restores the legacy wording only where the path still holds the
normalized text — a CMS-edited description is never overwritten.
"""
from django.db import migrations

OLD_EN = 'Start from zero - 6 weeks, 12 live sessions, and a practical final project. 99 EGP for the full course.'
NEW_EN = 'Start from zero - 6 weeks, 12 live sessions, and a practical final project.'


def forwards(apps, schema_editor):
    HomepageSettings = apps.get_model('homepage', 'HomepageSettings')
    for settings_obj in HomepageSettings.objects.all():
        paths = settings_obj.training_paths or []
        changed = False
        for path in paths:
            if path.get('key') != 'starter':
                continue
            if path.get('description_en') == OLD_EN:
                path['description_en'] = NEW_EN
                changed = True
            desc_ar = path.get('description_ar', '')
            if '99 جنيه' in desc_ar:
                path['description_ar'] = desc_ar.replace('99 جنيه', '499 جنيه')
                changed = True
        if changed:
            settings_obj.save(update_fields=['training_paths', 'updated_at'])


def backwards(apps, schema_editor):
    HomepageSettings = apps.get_model('homepage', 'HomepageSettings')
    for settings_obj in HomepageSettings.objects.all():
        paths = settings_obj.training_paths or []
        changed = False
        for path in paths:
            if path.get('key') != 'starter':
                continue
            if path.get('description_en') == NEW_EN:
                path['description_en'] = OLD_EN
                changed = True
            desc_ar = path.get('description_ar', '')
            if '499 جنيه' in desc_ar:
                path['description_ar'] = desc_ar.replace('499 جنيه', '99 جنيه')
                changed = True
        if changed:
            settings_obj.save(update_fields=['training_paths', 'updated_at'])


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0004_add_training_education_section_key'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
