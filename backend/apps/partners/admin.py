from django.contrib import admin

from .models import Partner


@admin.action(description='Activate selected partners')
def activate_partners(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description='Deactivate selected partners')
def deactivate_partners(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.action(description='Mark selected partners as featured')
def mark_featured(modeladmin, request, queryset):
    queryset.update(is_featured=True)


@admin.action(description='Remove featured status from selected partners')
def remove_featured(modeladmin, request, queryset):
    queryset.update(is_featured=False)


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            'Names',
            {
                'fields': (
                    'name_en',
                    'name_ar',
                    'slug',
                ),
            },
        ),
        (
            'Branding',
            {
                'fields': ('logo',),
            },
        ),
        (
            'Link',
            {
                'fields': (
                    'website_url',
                    'open_in_new_tab',
                ),
            },
        ),
        (
            'Classification',
            {
                'fields': (
                    'partner_type',
                    'display_order',
                    'is_featured',
                    'is_active',
                ),
            },
        ),
        (
            'Descriptions',
            {
                'fields': (
                    'description_en',
                    'description_ar',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'Status',
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
        'partner_type',
        'display_order',
        'is_featured',
        'is_active',
        'updated_at',
    )
    list_filter = (
        'partner_type',
        'is_featured',
        'is_active',
    )
    search_fields = (
        'name_en',
        'name_ar',
        'slug',
        'description_en',
        'description_ar',
        'website_url',
    )
    ordering = ('display_order', 'name_en')
    readonly_fields = ('created_at', 'updated_at')
    prepopulated_fields = {'slug': ('name_en',)}
    actions = (
        activate_partners,
        deactivate_partners,
        mark_featured,
        remove_featured,
    )
