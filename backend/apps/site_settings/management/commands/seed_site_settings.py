from django.core.management.base import BaseCommand

from apps.site_settings.models import SiteSetting


class Command(BaseCommand):
    help = 'Create default SiteSetting values if none exist.'

    def handle(self, *args, **options):
        if SiteSetting.objects.exists():
            self.stdout.write(
                self.style.WARNING(
                    'SiteSetting already exists. No changes were made. '
                    'Use the Django admin to edit the existing record.'
                )
            )
            return

        setting = SiteSetting.objects.create(
            site_name='SidrahSoft',
            site_tagline='Building intelligent digital ecosystems',
            default_language='en',
            supported_languages=['en', 'ar'],
            contact_email='sidrahsoft@gmail.com',
            recipient_email='sidrahsoft@gmail.com',
            address='Riyadh, Saudi Arabia',
            working_hours='Sun - Thu, 9:00 AM - 5:00 PM',
            is_active=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created default SiteSetting: {setting.site_name}'
            )
        )
