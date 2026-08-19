"""Django admin registration for Training & Education."""
from django.contrib import admin

from .models import Program


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'branch', 'status', 'display_order', 'created_at')
    list_filter = ('branch', 'status')
    search_fields = ('title_en', 'title_ar', 'slug')
    prepopulated_fields = {'slug': ('title_en',)}
    ordering = ('display_order', 'title_en')
