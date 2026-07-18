from django.contrib import admin

from .models import CaseStudy


@admin.action(description='Activate selected case studies')
def activate_case_studies(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description='Deactivate selected case studies')
def deactivate_case_studies(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.action(description='Mark selected case studies as featured')
def mark_featured(modeladmin, request, queryset):
    queryset.update(is_featured=True)


@admin.action(description='Remove featured status from selected case studies')
def remove_featured(modeladmin, request, queryset):
    queryset.update(is_featured=False)


@admin.action(description='Show selected case studies on homepage')
def show_on_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=True)


@admin.action(description='Hide selected case studies from homepage')
def hide_from_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=False)


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
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
            'Client and relationships',
            {
                'fields': (
                    'partner',
                    'client_name_en',
                    'client_name_ar',
                    'services',
                ),
            },
        ),
        (
            'Summary',
            {
                'fields': (
                    'short_description_en',
                    'short_description_ar',
                ),
            },
        ),
        (
            'Problem',
            {
                'fields': (
                    'problem_en',
                    'problem_ar',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'Solution',
            {
                'fields': (
                    'solution_en',
                    'solution_ar',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'Technology',
            {
                'fields': (
                    'technology_en',
                    'technology_ar',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'Outcome',
            {
                'fields': (
                    'outcome_en',
                    'outcome_ar',
                ),
                'classes': ('collapse',),
            },
        ),
        (
            'Media',
            {
                'fields': (
                    'featured_image',
                    'logo',
                ),
            },
        ),
        (
            'Links and metadata',
            {
                'fields': (
                    'project_url',
                    'open_in_new_tab',
                    'project_year',
                ),
            },
        ),
        (
            'Classification',
            {
                'fields': (
                    'industry_en',
                    'industry_ar',
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
            },
        ),
    )

    list_display = (
        'title_en',
        'title_ar',
        'client_or_partner',
        'industry_en',
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
        'industry_en',
        'services',
        'partner',
    )
    search_fields = (
        'title_en',
        'title_ar',
        'client_name_en',
        'client_name_ar',
        'slug',
        'industry_en',
        'industry_ar',
        'problem_en',
        'problem_ar',
        'solution_en',
        'solution_ar',
        'outcome_en',
        'outcome_ar',
    )
    ordering = ('display_order', 'title_en')
    readonly_fields = ('created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title_en',)}
    filter_horizontal = ('services',)
    actions = (
        activate_case_studies,
        deactivate_case_studies,
        mark_featured,
        remove_featured,
        show_on_homepage,
        hide_from_homepage,
    )

    @admin.display(description='Partner / Client')
    def client_or_partner(self, obj):
        if obj.partner:
            return obj.partner.name_en
        return obj.client_name_en
