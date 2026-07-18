from django.contrib import admin

from .models import SiteSetting


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            'General',
            {
                'fields': (
                    'site_name',
                    'site_tagline',
                    'default_language',
                    'supported_languages',
                ),
            },
        ),
        (
            'Contact',
            {
                'fields': (
                    'contact_email',
                    'recipient_email',
                    'phone',
                    'whatsapp_url',
                    'telegram_url',
                ),
            },
        ),
        (
            'Social Links',
            {
                'fields': (
                    'facebook_url',
                    'linkedin_url',
                    'instagram_url',
                    'youtube_url',
                    'x_url',
                ),
            },
        ),
        (
            'Location / Map',
            {
                'fields': (
                    'address',
                    'google_maps_url',
                    'map_embed_url',
                    'latitude',
                    'longitude',
                    'working_hours',
                ),
            },
        ),
        (
            'SEO',
            {
                'fields': (
                    'default_meta_title',
                    'default_meta_description',
                    'default_og_image',
                ),
            },
        ),
        (
            'Branding',
            {
                'fields': (
                    'primary_logo',
                    'secondary_logo',
                    'favicon',
                ),
            },
        ),
        (
            'Status',
            {
                'fields': (
                    'is_active',
                    'created_at',
                    'updated_at',
                ),
            },
        ),
    )

    readonly_fields = ('created_at', 'updated_at')

    list_display = (
        'site_name',
        'default_language',
        'contact_email',
        'is_active',
        'updated_at',
    )
    list_filter = ('is_active', 'default_language')
    search_fields = (
        'site_name',
        'site_tagline',
        'contact_email',
        'address',
    )

    def has_add_permission(self, request):
        # Guide users toward a single record; adding more is allowed only if none exist.
        if SiteSetting.objects.exists():
            self.message_user(
                request,
                'A SiteSetting record already exists. Edit the existing record instead of creating a new one.',
                level='warning',
            )
            return False
        return super().has_add_permission(request)
