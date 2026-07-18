"""Django Admin configuration for the Insights app."""
from django.contrib import admin

from .models import (
    STATUS_ARCHIVED,
    STATUS_DRAFT,
    STATUS_PUBLISHED,
    Article,
)


@admin.action(description='Publish selected articles')
def publish_articles(modeladmin, request, queryset):
    queryset.update(status=STATUS_PUBLISHED)


@admin.action(description='Move selected articles to draft')
def draft_articles(modeladmin, request, queryset):
    queryset.update(status=STATUS_DRAFT)


@admin.action(description='Archive selected articles')
def archive_articles(modeladmin, request, queryset):
    queryset.update(status=STATUS_ARCHIVED)


@admin.action(description='Mark selected articles as featured')
def feature_articles(modeladmin, request, queryset):
    queryset.update(is_featured=True)


@admin.action(description='Remove featured status from selected articles')
def unfeature_articles(modeladmin, request, queryset):
    queryset.update(is_featured=False)


@admin.action(description='Show selected articles on homepage')
def show_on_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=True)


@admin.action(description='Hide selected articles from homepage')
def hide_from_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=False)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        'title_en',
        'title_ar',
        'content_type',
        'category_en',
        'author_name_en',
        'status',
        'is_featured',
        'show_on_homepage',
        'published_at',
        'updated_at',
    )
    list_filter = (
        'status',
        'content_type',
        'is_featured',
        'show_on_homepage',
        'category_en',
        'published_at',
    )
    search_fields = (
        'title_en',
        'title_ar',
        'slug',
        'excerpt_en',
        'excerpt_ar',
        'body_en',
        'body_ar',
        'category_en',
        'category_ar',
        'author_name_en',
        'author_name_ar',
    )
    ordering = ('display_order', 'title_en')
    readonly_fields = ('created_at', 'updated_at')
    prepopulated_fields = {'slug': ('title_en',)}
    actions = [
        publish_articles,
        draft_articles,
        archive_articles,
        feature_articles,
        unfeature_articles,
        show_on_homepage,
        hide_from_homepage,
    ]

    fieldsets = (
        (
            'Identity',
            {
                'fields': (
                    'title_en',
                    'title_ar',
                    'slug',
                    'content_type',
                ),
            },
        ),
        (
            'Summary',
            {
                'fields': ('excerpt_en', 'excerpt_ar'),
            },
        ),
        (
            'Body',
            {
                'fields': ('body_en', 'body_ar'),
            },
        ),
        (
            'Classification',
            {
                'fields': ('category_en', 'category_ar'),
            },
        ),
        (
            'Author',
            {
                'fields': (
                    'author_name_en',
                    'author_name_ar',
                ),
            },
        ),
        (
            'Media',
            {
                'fields': ('featured_image',),
            },
        ),
        (
            'Publishing',
            {
                'fields': (
                    'status',
                    'published_at',
                    'is_featured',
                    'show_on_homepage',
                    'display_order',
                ),
            },
        ),
        (
            'Reading metadata',
            {
                'fields': ('read_time_minutes',),
            },
        ),
        (
            'SEO',
            {
                'classes': ('collapse',),
                'fields': (
                    'seo_title_en',
                    'seo_title_ar',
                    'seo_description_en',
                    'seo_description_ar',
                ),
            },
        ),
        (
            'Timestamps',
            {
                'classes': ('collapse',),
                'fields': ('created_at', 'updated_at'),
            },
        ),
    )
