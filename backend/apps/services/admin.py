from django.contrib import admin

from .models import Service


@admin.action(description='Activate selected services')
def activate_services(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description='Deactivate selected services')
def deactivate_services(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.action(description='Mark selected services as featured')
def mark_featured(modeladmin, request, queryset):
    queryset.update(is_featured=True)


@admin.action(description='Remove featured status from selected services')
def remove_featured(modeladmin, request, queryset):
    queryset.update(is_featured=False)


@admin.action(description='Show selected services on homepage')
def show_on_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=True)


@admin.action(description='Hide selected services from homepage')
def hide_from_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=False)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            'Basic information',
            {
                'fields': (
                    'name_en',
                    'name_ar',
                    'slug',
                ),
            },
        ),
        (
            'Descriptions',
            {
                'fields': (
                    'short_description_en',
                    'short_description_ar',
                    'description_en',
                    'description_ar',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'Media',
            {
                'fields': (
                    'icon',
                    'featured_image',
                ),
            },
        ),
        (
            'Display and visibility',
            {
                'fields': (
                    'display_order',
                    'is_featured',
                    'is_active',
                    'show_on_homepage',
                ),
            },
        ),
        (
            'CTA',
            {
                'fields': (
                    'cta_label_en',
                    'cta_label_ar',
                    'cta_url',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'SEO',
            {
                'fields': (
                    'seo_title_en',
                    'seo_title_ar',
                    'seo_description_en',
                    'seo_description_ar',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'Timestamps',
            {
                'fields': (
                    'created_at',
                    'updated_at',
                ),
            },
        ),
    )

    list_display = (
        'name_en',
        'name_ar',
        'display_order',
        'is_featured',
        'show_on_homepage',
        'is_active',
        'updated_at',
    )
    list_filter = (
        'is_active',
        'is_featured',
        'show_on_homepage',
    )
    search_fields = (
        'name_en',
        'name_ar',
        'slug',
        'short_description_en',
        'short_description_ar',
        'description_en',
        'description_ar',
    )
    ordering = ('display_order', 'name_en')
    readonly_fields = ('created_at', 'updated_at')
    prepopulated_fields = {'slug': ('name_en',)}
    actions = (
        activate_services,
        deactivate_services,
        mark_featured,
        remove_featured,
        show_on_homepage,
        hide_from_homepage,
    )
