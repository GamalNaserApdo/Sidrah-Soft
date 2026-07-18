from django.contrib import admin

from .models import HomepageSettings, MarqueeItem, Industry, HomepageSectionConfig


@admin.register(HomepageSettings)
class HomepageSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name_label', 'hero_enabled', 'foundation_enabled', 'is_active')
    list_filter = ('is_active', 'hero_enabled', 'foundation_enabled')
    search_fields = ('hero_headline_en', 'hero_headline_ar', 'foundation_heading_en')

    def site_name_label(self, obj):
        return 'Homepage Settings'

    site_name_label.short_description = 'Settings'


@admin.register(MarqueeItem)
class MarqueeItemAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'title_ar', 'display_order', 'is_visible')
    list_filter = ('is_visible',)
    list_editable = ('display_order', 'is_visible')
    search_fields = ('title_en', 'title_ar', 'description_en', 'description_ar')
    ordering = ('display_order',)


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'title_ar', 'display_order', 'is_visible')
    list_filter = ('is_visible',)
    list_editable = ('display_order', 'is_visible')
    search_fields = ('title_en', 'title_ar', 'description_en', 'description_ar')
    ordering = ('display_order',)


@admin.register(HomepageSectionConfig)
class HomepageSectionConfigAdmin(admin.ModelAdmin):
    list_display = ('section_key', 'display_order', 'is_visible')
    list_filter = ('is_visible',)
    list_editable = ('display_order', 'is_visible')
    ordering = ('display_order',)
