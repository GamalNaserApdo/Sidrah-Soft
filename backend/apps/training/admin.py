"""Django admin registration for Training & Education."""
from django.contrib import admin

from .models import (
    Certificate,
    Instructor,
    ModuleTopic,
    Program,
    ProgramFAQ,
    ProgramInstructor,
    ProgramLanding,
    ProgramModule,
    ProgramTestimonial,
    TrainingRegistration,
)


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = (
        'title_en', 'branch', 'status', 'registration_open',
        'registration_deadline', 'display_order', 'created_at',
    )
    list_filter = ('branch', 'status', 'registration_open')
    search_fields = ('title_en', 'title_ar', 'slug', 'external_form_key')
    prepopulated_fields = {'slug': ('title_en',)}
    ordering = ('display_order', 'title_en')
    fieldsets = (
        (None, {
            'fields': (
                'slug', 'title_en', 'title_ar', 'branch', 'status',
                'audience_levels', 'display_order', 'image',
            ),
        }),
        ('Registration', {
            'fields': (
                'registration_url', 'registration_open', 'registration_deadline',
                'maximum_capacity', 'external_form_key',
                'registration_cta_text_en', 'registration_cta_text_ar',
                'registration_closed_cta_text_en', 'registration_closed_cta_text_ar',
                'registration_success_cta_text_en', 'registration_success_cta_text_ar',
            ),
        }),
        ('Content', {
            'fields': (
                'short_description_en', 'short_description_ar',
                'overview_en', 'overview_ar',
                'modules_en', 'modules_ar', 'skills_en', 'skills_ar',
                'learning_outcomes_en', 'learning_outcomes_ar',
                'practical_project_en', 'practical_project_ar',
                'duration_en', 'duration_ar', 'format_en', 'format_ar',
                'schedule_en', 'schedule_ar', 'cta_text_en', 'cta_text_ar',
            ),
        }),
    )


@admin.register(TrainingRegistration)
class TrainingRegistrationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'program', 'status', 'submitted_at', 'reviewed_at')
    list_filter = ('status', 'source', 'program', 'submitted_at')
    search_fields = ('full_name', 'email', 'phone', 'national_id', 'external_submission_id')
    readonly_fields = ('email_normalized', 'phone_normalized', 'submitted_at', 'created_at', 'updated_at')
    date_hierarchy = 'submitted_at'


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('reference', 'training_registration', 'status', 'issued_at', 'revoked_at')
    list_filter = ('status', 'issued_at')
    search_fields = ('reference', 'training_registration__full_name', 'training_registration__email')
    readonly_fields = ('reference', 'created_at', 'updated_at')
    date_hierarchy = 'issued_at'


@admin.register(ProgramLanding)
class ProgramLandingAdmin(admin.ModelAdmin):
    list_display = ('program', 'show_pricing', 'current_price', 'currency', 'seo_noindex')
    list_filter = ('show_pricing', 'seo_noindex')
    search_fields = ('program__title_en', 'program__slug')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ProgramModule)
class ProgramModuleAdmin(admin.ModelAdmin):
    list_display = ('program', 'title_en', 'display_order', 'is_published')
    list_filter = ('is_published', 'program')
    search_fields = ('title_en', 'title_ar', 'program__title_en')
    ordering = ('program', 'display_order')


@admin.register(ModuleTopic)
class ModuleTopicAdmin(admin.ModelAdmin):
    list_display = ('module', 'title_en', 'display_order')
    search_fields = ('title_en', 'title_ar', 'module__title_en')
    ordering = ('module', 'display_order')


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_ar', 'title_en', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name_en', 'name_ar', 'title_en', 'title_ar')


@admin.register(ProgramInstructor)
class ProgramInstructorAdmin(admin.ModelAdmin):
    list_display = ('program', 'instructor', 'display_order')
    search_fields = ('program__title_en', 'instructor__name_en')
    ordering = ('program', 'display_order')


@admin.register(ProgramTestimonial)
class ProgramTestimonialAdmin(admin.ModelAdmin):
    list_display = ('program', 'student_name_en', 'rating', 'is_approved', 'display_order')
    list_filter = ('is_approved', 'rating', 'program')
    search_fields = ('student_name_en', 'student_name_ar', 'program__title_en')
    ordering = ('program', 'display_order')


@admin.register(ProgramFAQ)
class ProgramFAQAdmin(admin.ModelAdmin):
    list_display = ('program', 'question_en', 'display_order')
    search_fields = ('question_en', 'question_ar', 'program__title_en')
    ordering = ('program', 'display_order')
