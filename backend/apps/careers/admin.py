from django.contrib import admin

from .models import Job


@admin.action(description='Activate selected jobs')
def activate_jobs(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description='Deactivate selected jobs')
def deactivate_jobs(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.action(description='Mark selected jobs as featured')
def mark_featured(modeladmin, request, queryset):
    queryset.update(is_featured=True)


@admin.action(description='Remove featured status from selected jobs')
def remove_featured(modeladmin, request, queryset):
    queryset.update(is_featured=False)


@admin.action(description='Show selected jobs on homepage')
def show_on_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=True)


@admin.action(description='Hide selected jobs from homepage')
def hide_from_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=False)


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            'Basic information',
            {
                'fields': (
                    'title_en',
                    'title_ar',
                    'slug',
                ),
            },
        ),
        (
            'Organization and classification',
            {
                'fields': (
                    'department_en',
                    'department_ar',
                    'location_en',
                    'location_ar',
                    'employment_type',
                    'workplace_type',
                    'experience_level',
                ),
            },
        ),
        (
            'Summary and description',
            {
                'fields': (
                    'short_description_en',
                    'short_description_ar',
                    'description_en',
                    'description_ar',
                ),
            },
        ),
        (
            'Responsibilities',
            {
                'fields': (
                    'responsibilities_en',
                    'responsibilities_ar',
                ),
            },
        ),
        (
            'Requirements',
            {
                'fields': (
                    'requirements_en',
                    'requirements_ar',
                ),
            },
        ),
        (
            'Preferred qualifications',
            {
                'fields': (
                    'preferred_qualifications_en',
                    'preferred_qualifications_ar',
                ),
            },
        ),
        (
            'Benefits',
            {
                'fields': (
                    'benefits_en',
                    'benefits_ar',
                ),
            },
        ),
        (
            'Application settings',
            {
                'fields': (
                    'application_method',
                    'external_apply_url',
                    'application_email',
                ),
            },
        ),
        (
            'Dates',
            {
                'fields': (
                    'posted_date',
                    'closing_date',
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
                'classes': ('collapse',),
            },
        ),
    )

    list_display = (
        'title_en',
        'title_ar',
        'department_en',
        'location_en',
        'employment_type',
        'workplace_type',
        'experience_level',
        'posted_date',
        'closing_date',
        'is_featured',
        'show_on_homepage',
        'is_active',
        'updated_at',
    )
    list_filter = (
        'is_active',
        'is_featured',
        'show_on_homepage',
        'employment_type',
        'workplace_type',
        'experience_level',
        'application_method',
        'posted_date',
        'closing_date',
    )
    search_fields = (
        'title_en',
        'title_ar',
        'slug',
        'department_en',
        'department_ar',
        'location_en',
        'location_ar',
        'description_en',
        'description_ar',
        'requirements_en',
        'requirements_ar',
    )
    ordering = ['-is_featured', 'display_order', '-posted_date', 'title_en']
    readonly_fields = ('created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title_en',)}
    actions = (
        activate_jobs,
        deactivate_jobs,
        mark_featured,
        remove_featured,
        show_on_homepage,
        hide_from_homepage,
    )
