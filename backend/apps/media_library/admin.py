from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'media_type',
        'mime_type',
        'file_size',
        'width',
        'height',
        'usage_context',
        'uploaded_by',
        'is_active',
        'created_at',
        'updated_at',
    )
    list_filter = ('media_type', 'is_active', 'mime_type', 'usage_context')
    search_fields = ('title', 'alt_text', 'file', 'mime_type')
    readonly_fields = (
        'file_size',
        'mime_type',
        'width',
        'height',
        'uploaded_by',
        'created_at',
        'updated_at',
    )
    date_hierarchy = 'created_at'
