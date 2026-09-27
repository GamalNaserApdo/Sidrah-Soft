"""CMS serializers for the Training & Education module."""
from urllib.parse import urlparse

from django.db import transaction
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field

from .models import (
    Certificate,
    Instructor,
    ModuleTopic,
    OfferCampaign,
    OfferItem,
    Program,
    ProgramFAQ,
    ProgramInstructor,
    ProgramLanding,
    ProgramModule,
    ProgramTestimonial,
    StarterCampaignConfig,
    TrainingRegistration,
)


class CMSProgramListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for CMS program list views."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch', 'status',
            'title_en', 'title_ar',
            'audience_levels', 'display_order',
            'registration_open', 'registration_deadline',
            'image_url', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_image_url(self, obj):
        if obj.image and obj.image.file:
            request = self.context.get('request')
            url = obj.image.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class CMSProgramDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for CMS program retrieve."""

    image = MediaAssetReferenceSerializer(read_only=True)
    landing = serializers.SerializerMethodField()
    curriculum_modules = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    testimonials = serializers.SerializerMethodField()
    instructors = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch', 'status',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'overview_en', 'overview_ar',
            'audience_levels',
            'image',
            'modules_en', 'modules_ar',
            'skills_en', 'skills_ar',
            'learning_outcomes_en', 'learning_outcomes_ar',
            'practical_project_en', 'practical_project_ar',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'schedule_en', 'schedule_ar',
            'cta_text_en', 'cta_text_ar',
            'display_order',
            'registration_url', 'registration_open', 'registration_deadline', 'maximum_capacity',
            'external_form_key',
            'registration_cta_text_en', 'registration_cta_text_ar',
            'registration_closed_cta_text_en', 'registration_closed_cta_text_ar',
            'registration_success_cta_text_en', 'registration_success_cta_text_ar',
            'landing', 'curriculum_modules', 'faqs', 'testimonials', 'instructors',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_landing(self, obj):
        try:
            landing = obj.landing
        except ProgramLanding.DoesNotExist:
            return None
        request = self.context.get('request')

        def _media(asset):
            if asset and asset.file:
                if request:
                    return request.build_absolute_uri(asset.file.url)
                return asset.file.url
            return None

        return {
            'headline_en': landing.headline_en,
            'headline_ar': landing.headline_ar,
            'intro_video_type': landing.intro_video_type,
            'intro_video_url': landing.intro_video_url,
            'intro_video_file': MediaAssetReferenceSerializer(landing.intro_video_file, context=self.context).data if landing.intro_video_file else None,
            'video_poster': MediaAssetReferenceSerializer(landing.video_poster, context=self.context).data if landing.video_poster else None,
            'video_title_en': landing.video_title_en,
            'video_title_ar': landing.video_title_ar,
            'quick_facts': landing.quick_facts,
            'current_price': str(landing.current_price) if landing.current_price is not None else None,
            'original_price': str(landing.original_price) if landing.original_price is not None else None,
            'currency': landing.currency,
            'discount_percentage': landing.discount_percentage,
            'included_items': landing.included_items,
            'show_pricing': landing.show_pricing,
            'target_audience': landing.target_audience,
            'prerequisites': landing.prerequisites,
            'tools': landing.tools,
            'practical_training_en': landing.practical_training_en,
            'practical_training_ar': landing.practical_training_ar,
            'final_project_en': landing.final_project_en,
            'final_project_ar': landing.final_project_ar,
            'training_experience_en': landing.training_experience_en,
            'training_experience_ar': landing.training_experience_ar,
            'mentor_info_en': landing.mentor_info_en,
            'mentor_info_ar': landing.mentor_info_ar,
            'installments_available': landing.installments_available,
            'installments_info_en': landing.installments_info_en,
            'installments_info_ar': landing.installments_info_ar,
            'seo_title_en': landing.seo_title_en,
            'seo_title_ar': landing.seo_title_ar,
            'seo_meta_description_en': landing.seo_meta_description_en,
            'seo_meta_description_ar': landing.seo_meta_description_ar,
            'og_image': MediaAssetReferenceSerializer(landing.og_image, context=self.context).data if landing.og_image else None,
            'canonical_slug': landing.canonical_slug,
            'seo_noindex': landing.seo_noindex,
            # Registration form settings
            'show_registration_form': landing.show_registration_form,
            'registration_form_title_en': landing.registration_form_title_en,
            'registration_form_title_ar': landing.registration_form_title_ar,
            'registration_form_description_en': landing.registration_form_description_en,
            'registration_form_description_ar': landing.registration_form_description_ar,
            'registration_form_button_en': landing.registration_form_button_en,
            'registration_form_button_ar': landing.registration_form_button_ar,
            'registration_success_message_en': landing.registration_success_message_en,
            'registration_success_message_ar': landing.registration_success_message_ar,
            'registration_closed_message_en': landing.registration_closed_message_en,
            'registration_closed_message_ar': landing.registration_closed_message_ar,
            'fallback_google_form_url': landing.fallback_google_form_url,
        }

    def get_curriculum_modules(self, obj):
        modules = obj.curriculum_modules.all().order_by('display_order', 'id')
        return [
            {
                'id': m.id,
                'title_en': m.title_en,
                'title_ar': m.title_ar,
                'description_en': m.description_en,
                'description_ar': m.description_ar,
                'display_order': m.display_order,
                'is_published': m.is_published,
                'topics': [
                    {
                        'id': t.id,
                        'title_en': t.title_en,
                        'title_ar': t.title_ar,
                        'display_order': t.display_order,
                    }
                    for t in m.topics.order_by('display_order', 'id')
                ],
            }
            for m in modules
        ]

    def get_faqs(self, obj):
        return [
            {
                'id': f.id,
                'question_en': f.question_en,
                'question_ar': f.question_ar,
                'answer_en': f.answer_en,
                'answer_ar': f.answer_ar,
                'display_order': f.display_order,
            }
            for f in obj.program_faqs.order_by('display_order', 'id')
        ]

    def get_testimonials(self, obj):
        request = self.context.get('request')
        return [
            {
                'id': t.id,
                'student_name_en': t.student_name_en,
                'student_name_ar': t.student_name_ar,
                'content_en': t.content_en,
                'content_ar': t.content_ar,
                'rating': t.rating,
                'image': MediaAssetReferenceSerializer(t.image, context=self.context).data if t.image else None,
                'is_approved': t.is_approved,
                'display_order': t.display_order,
            }
            for t in obj.program_testimonials.order_by('display_order', 'id')
        ]

    def get_instructors(self, obj):
        return [
            {
                'id': pi.id,
                'instructor_id': pi.instructor.id,
                'name_en': pi.instructor.name_en,
                'name_ar': pi.instructor.name_ar,
                'title_en': pi.instructor.title_en,
                'title_ar': pi.instructor.title_ar,
                'bio_en': pi.instructor.bio_en,
                'bio_ar': pi.instructor.bio_ar,
                'image': MediaAssetReferenceSerializer(pi.instructor.image, context=self.context).data if pi.instructor.image else None,
                'linkedin_url': pi.instructor.linkedin_url,
                'is_active': pi.instructor.is_active,
                'display_order': pi.display_order,
            }
            for pi in obj.program_instructors.select_related('instructor', 'instructor__image').order_by('display_order', 'id')
        ]


class CMSProgramLandingWriteSerializer(serializers.ModelSerializer):
    """Write serializer for ProgramLanding fields (nested under Program update)."""

    intro_video_file = media_asset_field()
    video_poster = media_asset_field()
    og_image = media_asset_field()

    class Meta:
        model = ProgramLanding
        fields = [
            'headline_en', 'headline_ar',
            'intro_video_type', 'intro_video_url',
            'intro_video_file', 'video_poster',
            'video_title_en', 'video_title_ar',
            'quick_facts',
            'current_price', 'original_price', 'currency',
            'included_items', 'show_pricing',
            'target_audience', 'prerequisites', 'tools',
            'practical_training_en', 'practical_training_ar',
            'final_project_en', 'final_project_ar',
            'training_experience_en', 'training_experience_ar',
            'mentor_info_en', 'mentor_info_ar',
            'installments_available',
            'installments_info_en', 'installments_info_ar',
            'seo_title_en', 'seo_title_ar',
            'seo_meta_description_en', 'seo_meta_description_ar',
            'og_image', 'canonical_slug', 'seo_noindex',
            # Registration form settings
            'show_registration_form',
            'registration_form_title_en', 'registration_form_title_ar',
            'registration_form_description_en', 'registration_form_description_ar',
            'registration_form_button_en', 'registration_form_button_ar',
            'registration_success_message_en', 'registration_success_message_ar',
            'registration_closed_message_en', 'registration_closed_message_ar',
            'fallback_google_form_url',
        ]

    def validate_current_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Price cannot be negative.')
        return value

    def validate_original_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Original price cannot be negative.')
        return value

    def validate(self, attrs):
        current = attrs.get('current_price', getattr(self.instance, 'current_price', None))
        original = attrs.get('original_price', getattr(self.instance, 'original_price', None))
        if current is not None and original is not None and original <= current:
            raise serializers.ValidationError({
                'original_price': 'Original price must be greater than the current price.'
            })
        video_type = attrs.get('intro_video_type', getattr(self.instance, 'intro_video_type', 'none'))
        video_url = attrs.get('intro_video_url', getattr(self.instance, 'intro_video_url', ''))
        video_file = attrs.get('intro_video_file', getattr(self.instance, 'intro_video_file', None))
        if video_type == 'youtube' and not video_url:
            raise serializers.ValidationError({'intro_video_url': 'YouTube URL is required when video type is YouTube.'})
        if video_type == 'uploaded' and not video_file:
            raise serializers.ValidationError({'intro_video_file': 'An uploaded video file is required when video type is uploaded.'})
        return attrs


class CMSProgramWriteSerializer(serializers.ModelSerializer):
    """Write serializer for CMS program create/update."""

    image = media_asset_field()
    landing = CMSProgramLandingWriteSerializer(required=False)

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch', 'status',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'overview_en', 'overview_ar',
            'audience_levels',
            'image',
            'modules_en', 'modules_ar',
            'skills_en', 'skills_ar',
            'learning_outcomes_en', 'learning_outcomes_ar',
            'practical_project_en', 'practical_project_ar',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'schedule_en', 'schedule_ar',
            'cta_text_en', 'cta_text_ar',
            'display_order',
            'registration_url', 'registration_open', 'registration_deadline', 'maximum_capacity',
            'external_form_key',
            'registration_cta_text_en', 'registration_cta_text_ar',
            'registration_closed_cta_text_en', 'registration_closed_cta_text_ar',
            'registration_success_cta_text_en', 'registration_success_cta_text_ar',
            'landing',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_registration_url(self, value):
        if not value:
            return value
        parsed = urlparse(value)
        allowed_hosts = {'forms.gle', 'docs.google.com'}
        if parsed.scheme != 'https' or parsed.hostname not in allowed_hosts:
            raise serializers.ValidationError('Use an HTTPS Google Forms URL.')
        return value

    def create(self, validated_data):
        landing_data = validated_data.pop('landing', None)
        with transaction.atomic():
            program = super().create(validated_data)
            if landing_data:
                ProgramLanding.objects.create(program=program, **landing_data)
            else:
                ProgramLanding.objects.get_or_create(program=program)
            return program

    def update(self, instance, validated_data):
        landing_data = validated_data.pop('landing', None)
        with transaction.atomic():
            program = super().update(instance, validated_data)
            if landing_data:
                landing, _ = ProgramLanding.objects.get_or_create(program=program)
                landing_serializer = CMSProgramLandingWriteSerializer(
                    landing, data=landing_data, partial=True
                )
                landing_serializer.is_valid(raise_exception=True)
                landing_serializer.save()
            return program


class CMSTrainingRegistrationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for CMS registration list views."""

    program_title = serializers.CharField(source='program.title_en', read_only=True)
    confirmation_email_status_display = serializers.CharField(
        source='get_confirmation_email_status_display', read_only=True,
    )
    enrollment_stage_display = serializers.CharField(
        source='get_enrollment_stage_display', read_only=True,
    )
    operational_status_display = serializers.CharField(
        source='get_operational_status_display', read_only=True,
    )
    payment_status_display = serializers.CharField(
        source='get_payment_status_display', read_only=True,
    )
    program_track = serializers.CharField(source='program.track', read_only=True)

    class Meta:
        model = TrainingRegistration
        fields = [
            'id', 'program', 'program_title', 'program_track',
            'full_name', 'email', 'phone', 'status',
            'operational_status', 'operational_status_display',
            'enrollment_stage', 'enrollment_stage_display',
            'payment_status', 'payment_status_display',
            'whatsapp_group_added', 'next_follow_up_at',
            'course_price', 'course_price_currency',
            'source', 'external_submission_id',
            'current_level', 'current_status', 'acquisition_source',
            'confirmation_email_status', 'confirmation_email_status_display',
            'submitted_at', 'reviewed_at',
            'utm_source', 'utm_medium', 'utm_campaign',
            'utm_content', 'utm_term',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class CMSTrainingRegistrationDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for CMS registration retrieve."""

    program_title = serializers.CharField(source='program.title_en', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)
    confirmation_email_status_display = serializers.CharField(
        source='get_confirmation_email_status_display', read_only=True,
    )
    enrollment_stage_display = serializers.CharField(
        source='get_enrollment_stage_display', read_only=True,
    )
    payment_status_display = serializers.CharField(
        source='get_payment_status_display', read_only=True,
    )
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', read_only=True,
    )
    whatsapp_group_added_by_username = serializers.CharField(
        source='whatsapp_group_added_by.username', read_only=True,
    )
    operational_status_display = serializers.CharField(
        source='get_operational_status_display', read_only=True,
    )
    program_track = serializers.CharField(source='program.track', read_only=True)

    class Meta:
        model = TrainingRegistration
        fields = [
            'id', 'program', 'program_title', 'program_track',
            'source', 'external_submission_id',
            'full_name', 'email', 'phone', 'national_id',
            'college_or_school', 'academic_year', 'preferred_language',
            'university', 'university_other',
            'education_status', 'education_status_other',
            'current_level', 'current_status', 'current_status_other',
            'acquisition_source', 'acquisition_source_other',
            'email_normalized', 'phone_normalized',
            'status', 'certificate_eligible', 'reviewed_by', 'reviewed_by_username',
            'reviewed_at', 'review_notes', 'notes', 'internal_notes',
            'source_page',
            # Primary operational status (transitions only via dedicated endpoint).
            'operational_status', 'operational_status_display',
            # Operational fields.
            'enrollment_stage', 'enrollment_stage_display',
            'payment_status', 'payment_status_display',
            'paid_amount', 'payment_method', 'payment_method_display',
            'payment_date', 'payment_reference', 'payment_notes',
            'whatsapp_group_added', 'whatsapp_group_added_at',
            'whatsapp_group_added_by', 'whatsapp_group_added_by_username',
            'last_contacted_at', 'next_follow_up_at', 'follow_up_notes',
            # UTM attribution.
            'utm_source', 'utm_medium', 'utm_campaign',
            'utm_content', 'utm_term', 'referrer', 'landing_page_url',
            # Confirmation email delivery state (read-only audit fields).
            'confirmation_email_status', 'confirmation_email_status_display',
            'confirmation_email_attempted_at', 'confirmation_email_sent_at',
            'confirmation_email_error_summary',
            'course_price', 'course_price_currency',
            'submitted_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'source', 'external_submission_id',
            'email_normalized', 'phone_normalized',
            'reviewed_by', 'reviewed_at',
            'whatsapp_group_added_by', 'whatsapp_group_added_by_username',
            'operational_status', 'operational_status_display',
            'course_price', 'course_price_currency',
            'utm_source', 'utm_medium', 'utm_campaign',
            'utm_content', 'utm_term', 'referrer', 'landing_page_url',
            'confirmation_email_status', 'confirmation_email_status_display',
            'confirmation_email_attempted_at', 'confirmation_email_sent_at',
            'confirmation_email_error_summary',
            'submitted_at', 'created_at', 'updated_at',
        ]


class CMSTrainingRegistrationWriteSerializer(serializers.ModelSerializer):
    """Write serializer for CMS registration create/update.

    Email is OPTIONAL per the canonical Sidrah registration rule — a customer
    can register with phone/WhatsApp only. Non-empty values are still validated
    as proper email addresses by the field itself.
    """

    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = TrainingRegistration
        fields = [
            'id', 'program', 'source', 'external_submission_id',
            'full_name', 'email', 'phone', 'national_id',
            'college_or_school', 'academic_year', 'preferred_language',
            'university', 'university_other',
            'education_status', 'education_status_other',
            'status', 'review_notes', 'notes', 'internal_notes', 'source_page',
            # Operational fields.
            'enrollment_stage',
            'payment_status', 'paid_amount', 'payment_method',
            'payment_date', 'payment_reference', 'payment_notes',
            'whatsapp_group_added',
            'last_contacted_at', 'next_follow_up_at', 'follow_up_notes',
            'submitted_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'source', 'external_submission_id',
            'submitted_at', 'created_at', 'updated_at',
        ]
        validators = []

    def validate(self, attrs):
        external_id = attrs.get('external_submission_id', '')
        source = attrs.get('source', TrainingRegistration.SOURCE_CMS_MANUAL)
        requested_status = attrs.get('status')
        if self.instance and requested_status and requested_status != self.instance.status:
            if requested_status not in TrainingRegistration.ALLOWED_TRANSITIONS[self.instance.status]:
                raise serializers.ValidationError({'status': 'Invalid status transition.'})
        elif not self.instance and requested_status not in (None, TrainingRegistration.STATUS_NEW):
            raise serializers.ValidationError({'status': 'Registrations must start with status new.'})
        if external_id:
            existing = TrainingRegistration.objects.filter(
                source=source, external_submission_id=external_id
            ).first()
            if existing and (not self.instance or self.instance.pk != existing.pk):
                raise serializers.ValidationError(
                    {'external_submission_id': 'This submission ID already exists for the selected source.'}
                )
        return attrs

    def create(self, validated_data):
        program = validated_data.pop('program')
        with transaction.atomic():
            program = Program.objects.select_for_update().get(pk=program.pk)
            if program.maximum_capacity:
                active_count = program.registrations.exclude(
                    status__in=[TrainingRegistration.STATUS_REJECTED, TrainingRegistration.STATUS_CANCELLED]
                ).count()
                if active_count >= program.maximum_capacity:
                    raise serializers.ValidationError({'program': 'Registration capacity has been reached.'})
            return TrainingRegistration.objects.create(
                **validated_data,
                program=program,
                source=TrainingRegistration.SOURCE_CMS_MANUAL,
            )


class CMSTrainingRegistrationExportSerializer(serializers.ModelSerializer):
    """Serializer used for CSV/Excel export of registrations.

    Includes all operationally useful fields for the operations team:
    applicant info, program, campaign fields, UTM attribution, email status,
    and operational enrollment/payment/follow-up data.
    """

    program_title = serializers.CharField(source='program.title_en', read_only=True)
    program_branch = serializers.CharField(source='program.branch', read_only=True)
    program_track = serializers.CharField(source='program.track', read_only=True)
    confirmation_email_status_display = serializers.CharField(
        source='get_confirmation_email_status_display', read_only=True,
    )
    enrollment_stage_display = serializers.CharField(
        source='get_enrollment_stage_display', read_only=True,
    )
    payment_status_display = serializers.CharField(
        source='get_payment_status_display', read_only=True,
    )
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', read_only=True,
    )

    class Meta:
        model = TrainingRegistration
        fields = [
            'id', 'program_title', 'program_branch', 'program_track',
            'full_name', 'email', 'phone',
            'current_level', 'current_status', 'current_status_other',
            'acquisition_source', 'acquisition_source_other',
            'preferred_language',
            'status', 'source', 'external_submission_id',
            # Operational fields.
            'enrollment_stage', 'enrollment_stage_display',
            'payment_status', 'payment_status_display',
            'paid_amount', 'payment_method', 'payment_method_display',
            'payment_date', 'payment_reference', 'payment_notes',
            'whatsapp_group_added',
            'last_contacted_at', 'next_follow_up_at', 'follow_up_notes',
            'submitted_at', 'created_at', 'updated_at',
            'reviewed_at',
            'utm_source', 'utm_medium', 'utm_campaign',
            'utm_content', 'utm_term', 'referrer', 'landing_page_url',
            'confirmation_email_status', 'confirmation_email_status_display',
            'confirmation_email_attempted_at', 'confirmation_email_sent_at',
        ]
        read_only_fields = fields


class CMSCertificateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for CMS certificate list views."""

    program_title = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'reference', 'certificate_type', 'certificate_number', 'status',
            'training_registration', 'recipient_name', 'program',
            'program_title', 'certificate_title',
            'training_start_date', 'training_end_date',
            'grade', 'result', 'issued_at', 'revoked_at',
            'verification_url', 'certificate_file',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_program_title(self, obj):
        program = obj.effective_program
        return program.title_en if program else None

    def get_recipient_name(self, obj):
        return obj.effective_recipient_name

    def get_verification_url(self, obj):
        from django.conf import settings
        public_url = getattr(settings, 'PUBLIC_SITE_URL', '').rstrip('/')
        return f'{public_url}/certificates/verify/{obj.reference}' if public_url else None


class CMSCertificateDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for CMS certificate retrieve."""

    program_title = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    recipient_email = serializers.SerializerMethodField()
    media_asset = MediaAssetReferenceSerializer(read_only=True)
    verification_url = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'reference', 'certificate_type', 'certificate_number', 'status',
            'training_registration', 'program',
            'recipient_name', 'recipient_email',
            'certificate_title', 'recognition_reason',
            'program_title', 'training_start_date', 'training_end_date',
            'grade', 'result', 'issued_at', 'issued_by',
            'revoked_at', 'revoked_by', 'revoked_reason',
            'media_asset', 'certificate_file', 'verification_url', 'qr_code_url',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference', 'issued_at', 'revoked_at',
            'created_at', 'updated_at',
            'verification_url', 'qr_code_url',
            'certificate_file',
        ]

    def get_program_title(self, obj):
        program = obj.effective_program
        return program.title_en if program else None

    def get_recipient_name(self, obj):
        return obj.effective_recipient_name

    def get_recipient_email(self, obj):
        if obj.training_registration:
            return obj.training_registration.email
        return None

    def get_verification_url(self, obj):
        from django.conf import settings
        public_url = getattr(settings, 'PUBLIC_SITE_URL', '').rstrip('/')
        return f'{public_url}/certificates/verify/{obj.reference}' if public_url else None

    def get_qr_code_url(self, obj):
        # QR code is generated on demand via a separate endpoint
        return f'/api/v1/cms/training/certificates/{obj.id}/qr-code/' if obj.status == Certificate.STATUS_ISSUED else None


class CMSCertificateWriteSerializer(serializers.ModelSerializer):
    """Write serializer for CMS certificate create/update."""

    media_asset = media_asset_field()

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_type', 'training_registration', 'program',
            'recipient_name', 'certificate_title', 'recognition_reason',
            'status', 'reference', 'certificate_number',
            'training_start_date', 'training_end_date', 'grade', 'result',
            'issued_at', 'revoked_at', 'revoked_reason', 'media_asset',
            'certificate_file',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'reference', 'issued_at', 'revoked_at',
            'created_at', 'updated_at',
        ]

    def validate_certificate_file(self, file):
        """Validate that the uploaded certificate file filename matches the certificate reference."""
        if not file:
            return file
        import os
        filename = os.path.basename(file.name)
        name_without_ext = os.path.splitext(filename)[0]
        # The reference may not be set yet on create (auto-generated on save),
        # so we only validate on update when reference is known.
        ref = self.instance.reference if self.instance else None
        if ref and name_without_ext != ref:
            raise serializers.ValidationError(
                f'Certificate file filename ({filename}) must match the reference ({ref}).'
            )
        return file

    def validate_training_registration(self, registration):
        if self.instance and registration and registration.pk != self.instance.training_registration_id:
            raise serializers.ValidationError('A certificate cannot be reassigned to another registration.')
        if registration and registration.status != TrainingRegistration.STATUS_COMPLETED:
            raise serializers.ValidationError('Only completed registrations are certificate eligible.')
        return registration

    def validate(self, attrs):
        if attrs.get('certificate_number') == '':
            attrs['certificate_number'] = None
        start = attrs.get('training_start_date', getattr(self.instance, 'training_start_date', None))
        end = attrs.get('training_end_date', getattr(self.instance, 'training_end_date', None))
        if start and end and end < start:
            raise serializers.ValidationError({'training_end_date': 'Must be on or after the start date.'})

        cert_type = attrs.get('certificate_type', getattr(self.instance, 'certificate_type', Certificate.TYPE_COMPLETION))
        if cert_type == Certificate.TYPE_COMPLETION:
            reg = attrs.get('training_registration', getattr(self.instance, 'training_registration', None))
            if not reg:
                raise serializers.ValidationError({'training_registration': 'Completion certificates require a training registration.'})
        elif cert_type in (Certificate.TYPE_RECOGNITION, Certificate.TYPE_INSTRUCTOR):
            name = attrs.get('recipient_name', getattr(self.instance, 'recipient_name', ''))
            if not name:
                raise serializers.ValidationError({'recipient_name': 'This certificate type requires a recipient name.'})

        return attrs


# ---------------------------------------------------------------------------
# Landing Page CMS Serializers
# ---------------------------------------------------------------------------

class CMSProgramModuleWriteSerializer(serializers.ModelSerializer):
    """Write serializer for ProgramModule.

    Includes nested topics so the CMS curriculum tab can display them
    without a separate API call per module.
    """

    topics = serializers.SerializerMethodField()

    class Meta:
        model = ProgramModule
        fields = ['id', 'program', 'title_en', 'title_ar', 'description_en', 'description_ar', 'display_order', 'is_published', 'topics']
        read_only_fields = ['id', 'program']

    def get_topics(self, obj):
        return [
            {
                'id': t.id,
                'title_en': t.title_en,
                'title_ar': t.title_ar,
                'display_order': t.display_order,
            }
            for t in obj.topics.order_by('display_order', 'id')
        ]


class CMSModuleTopicWriteSerializer(serializers.ModelSerializer):
    """Write serializer for ModuleTopic."""

    class Meta:
        model = ModuleTopic
        fields = ['id', 'module', 'title_en', 'title_ar', 'display_order']
        read_only_fields = ['id', 'module']


class CMSInstructorListSerializer(serializers.ModelSerializer):
    """List serializer for Instructor."""

    image = MediaAssetReferenceSerializer(read_only=True)

    class Meta:
        model = Instructor
        fields = ['id', 'name_en', 'name_ar', 'title_en', 'title_ar', 'image', 'linkedin_url', 'is_active', 'created_at', 'updated_at']
        read_only_fields = fields


class CMSInstructorWriteSerializer(serializers.ModelSerializer):
    """Write serializer for Instructor."""

    image = media_asset_field()

    class Meta:
        model = Instructor
        fields = ['id', 'name_en', 'name_ar', 'title_en', 'title_ar', 'bio_en', 'bio_ar', 'image', 'linkedin_url', 'is_active']
        read_only_fields = ['id']


class CMSProgramInstructorWriteSerializer(serializers.ModelSerializer):
    """Write serializer for ProgramInstructor (linking instructor to program)."""

    class Meta:
        model = ProgramInstructor
        fields = ['id', 'program', 'instructor', 'display_order']
        read_only_fields = ['id', 'program']


class CMSProgramTestimonialWriteSerializer(serializers.ModelSerializer):
    """Write serializer for ProgramTestimonial."""

    image = media_asset_field()

    class Meta:
        model = ProgramTestimonial
        fields = ['id', 'program', 'student_name_en', 'student_name_ar', 'content_en', 'content_ar', 'rating', 'image', 'is_approved', 'display_order']
        read_only_fields = ['id', 'program']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class CMSProgramFAQWriteSerializer(serializers.ModelSerializer):
    """Write serializer for ProgramFAQ."""

    class Meta:
        model = ProgramFAQ
        fields = ['id', 'program', 'question_en', 'question_ar', 'answer_en', 'answer_ar', 'display_order']
        read_only_fields = ['id', 'program']


# ---------------------------------------------------------------------------
# Courses Offers CMS Serializers (OfferCampaign -> OfferItem -> Program)
# ---------------------------------------------------------------------------

class CMSOfferItemSerializer(serializers.ModelSerializer):
    """Read serializer for an offer item with its program summary."""

    program_slug = serializers.CharField(source='program.slug', read_only=True)
    program_title_en = serializers.CharField(source='program.title_en', read_only=True)
    program_title_ar = serializers.CharField(source='program.title_ar', read_only=True)
    program_branch = serializers.CharField(source='program.branch', read_only=True)

    class Meta:
        model = OfferItem
        fields = [
            'id', 'campaign', 'program',
            'program_slug', 'program_title_en', 'program_title_ar', 'program_branch',
            'badge_en', 'badge_ar',
            'promotional_copy_en', 'promotional_copy_ar',
            'cta_label_en', 'cta_label_ar', 'cta_url',
            'display_order',
            'promo_price', 'promo_currency', 'show_promo_price_publicly',
            'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'campaign', 'created_at', 'updated_at']


class CMSOfferItemWriteSerializer(serializers.ModelSerializer):
    """Write serializer for offer item create/update.

    Server-side validation:
    - program must exist and be an active program.
    - cta_url is validated against dangerous schemes and malformed destinations.
    - promo_price cannot be negative.
    - show_promo_price_publicly defaults to False (Professional price protection).
    """

    class Meta:
        model = OfferItem
        fields = [
            'id', 'program',
            'badge_en', 'badge_ar',
            'promotional_copy_en', 'promotional_copy_ar',
            'cta_label_en', 'cta_label_ar', 'cta_url',
            'display_order',
            'promo_price', 'promo_currency', 'show_promo_price_publicly',
            'is_active',
        ]
        read_only_fields = ['id']

    def validate_program(self, value):
        if value is None:
            raise serializers.ValidationError('A program is required.')
        if value.status != Program.STATUS_ACTIVE:
            raise serializers.ValidationError(
                'Only active programs can be added to an offer campaign.'
            )
        return value

    def validate_cta_url(self, value):
        if not value:
            return value
        from django.core.exceptions import ValidationError as DjangoValidationError
        from .models import validate_offer_cta_url
        try:
            validate_offer_cta_url(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)
        return value

    def validate_promo_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Promotional price cannot be negative.')
        return value

    def validate(self, attrs):
        # Enforce the unique campaign+program constraint at the serializer
        # level so the CMS UI receives a field-level error instead of a 500
        # from the DB constraint.
        program = attrs.get('program') or (self.instance.program if self.instance else None)
        campaign = (
            attrs.get('campaign')
            or getattr(self.context.get('view'), 'campaign_instance', None)
            or (self.instance.campaign if self.instance else None)
        )
        if program is not None and campaign is not None:
            qs = OfferItem.objects.filter(campaign=campaign, program=program)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    'program': 'This program is already part of this campaign.',
                })
        return attrs


class CMSOfferCampaignListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the CMS campaign list view."""

    item_count = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)

    class Meta:
        model = OfferCampaign
        fields = [
            'id', 'slug', 'title_en', 'title_ar',
            'status', 'is_active',
            'start_date', 'end_date', 'priority',
            'item_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_item_count(self, obj):
        return obj.items.filter(is_active=True).count()


class CMSOfferCampaignDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for CMS campaign retrieve with nested items."""

    items = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)

    class Meta:
        model = OfferCampaign
        fields = [
            'id', 'slug', 'title_en', 'title_ar',
            'description_en', 'description_ar',
            'badge_en', 'badge_ar',
            'start_date', 'end_date', 'is_active', 'priority',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
            'items', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_items(self, obj):
        items = (
            obj.items.select_related('program')
            .order_by('display_order', 'id')
        )
        return CMSOfferItemSerializer(items, many=True, context=self.context).data


class CMSOfferCampaignWriteSerializer(serializers.ModelSerializer):
    """Write serializer for campaign create/update.

    Server-side validation:
    - slug is required and unique (SlugField).
    - end_date must be after start_date when both are provided.
    - SEO title fields are bounded to 255 characters.
    """

    class Meta:
        model = OfferCampaign
        fields = [
            'id', 'slug', 'title_en', 'title_ar',
            'description_en', 'description_ar',
            'badge_en', 'badge_ar',
            'start_date', 'end_date', 'is_active', 'priority',
            'seo_title_en', 'seo_title_ar',
            'seo_description_en', 'seo_description_ar',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start and end and end < start:
            raise serializers.ValidationError({
                'end_date': 'End date must be after the start date.',
            })
        return attrs

    def validate_seo_title_en(self, value):
        return self._validate_seo_title(value)

    def validate_seo_title_ar(self, value):
        return self._validate_seo_title(value)

    def _validate_seo_title(self, value):
        if not value:
            return value
        if len(value) > 255:
            raise serializers.ValidationError('SEO title must be 255 characters or fewer.')
        return value


class CMSStarterCampaignConfigSerializer(serializers.ModelSerializer):
    """CMS read/write serializer for the StarterCampaignConfig singleton.

    All fields are editable. The is_active flag enforces singleton behavior
    at the model level. The CMS UI uses a single GET/PUT endpoint.
    """

    class Meta:
        model = StarterCampaignConfig
        fields = [
            'id', 'is_active',
            'show_registration_form',
            'form_title_en', 'form_title_ar',
            'form_description_en', 'form_description_ar',
            'form_button_en', 'form_button_ar',
            'success_message_en', 'success_message_ar',
            'success_note_en', 'success_note_ar',
            'closed_message_en', 'closed_message_ar',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
