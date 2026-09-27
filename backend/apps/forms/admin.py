from django.contrib import admin

from .models import (
    FormDefinition, FormField, FormFieldOption,
    FormAssignment, FormSubmission, FormSubmissionValue,
)


@admin.register(FormDefinition)
class FormDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug', 'title_en')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(FormField)
class FormFieldAdmin(admin.ModelAdmin):
    list_display = ('form', 'label_en', 'field_type', 'is_required', 'is_active', 'is_system', 'display_order')
    list_filter = ('field_type', 'is_required', 'is_active', 'is_system')
    search_fields = ('label_en', 'field_key')


@admin.register(FormFieldOption)
class FormFieldOptionAdmin(admin.ModelAdmin):
    list_display = ('field', 'value', 'label_en', 'is_active', 'display_order')
    list_filter = ('is_active',)
    search_fields = ('value', 'label_en')


@admin.register(FormAssignment)
class FormAssignmentAdmin(admin.ModelAdmin):
    list_display = ('form', 'target', 'is_active', 'created_at')
    list_filter = ('target', 'is_active')


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ('form', 'public_id', 'language', 'status', 'submitted_at')
    list_filter = ('status', 'form')
    search_fields = ('public_id',)
    readonly_fields = ('public_id', 'submitted_at')


@admin.register(FormSubmissionValue)
class FormSubmissionValueAdmin(admin.ModelAdmin):
    list_display = ('submission', 'field_key', 'field_label', 'value')
    search_fields = ('field_key', 'field_label', 'value')
