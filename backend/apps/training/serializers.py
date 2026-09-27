"""Public API serializers for Training & Education programs."""
from django.utils import timezone
from rest_framework import serializers

from apps.site_settings.models import SiteSetting

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
    StarterCampaignConfig,
    TrainingRegistration,
)


def registration_available(program):
    if not program.registration_open:
        return False
    if program.registration_deadline and program.registration_deadline <= timezone.now():
        return False
    if not program.maximum_capacity:
        return True
    return program.registrations.exclude(
        status__in=[TrainingRegistration.STATUS_REJECTED, TrainingRegistration.STATUS_CANCELLED]
    ).count() < program.maximum_capacity


def _is_professional_price_suppressed(program):
    """Return True if professional-branch prices must be hidden from public API.

    Reads the single source of truth ``SiteSetting.campaign_pricing_mode`` so
    backend serialization and frontend presentation stay aligned. Starter
    and Summer programs are never affected.
    """
    if program.branch != 'professional':
        return False
    setting = SiteSetting.get_current()
    return bool(setting and setting.campaign_pricing_mode)


class ProgramListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for public program listings."""

    image_url = serializers.SerializerMethodField()
    registration_available = serializers.SerializerMethodField()
    current_price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'audience_levels', 'status',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'image_url', 'display_order',
            'current_price', 'currency',
            'registration_url', 'registration_open', 'registration_available',
            'registration_deadline', 'maximum_capacity',
            'registration_cta_text_en', 'registration_cta_text_ar',
            'registration_closed_cta_text_en', 'registration_closed_cta_text_ar',
            'registration_success_cta_text_en', 'registration_success_cta_text_ar',
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

    def get_registration_available(self, obj):
        return registration_available(obj)

    def _landing_price(self, obj, field):
        try:
            landing = obj.landing
        except ProgramLanding.DoesNotExist:
            return None
        value = getattr(landing, field, None)
        return str(value) if value is not None else None

    def get_current_price(self, obj):
        if _is_professional_price_suppressed(obj):
            return None
        return self._landing_price(obj, 'current_price')

    def get_currency(self, obj):
        if _is_professional_price_suppressed(obj):
            return None
        try:
            return obj.landing.currency
        except ProgramLanding.DoesNotExist:
            return None


class ProgramDetailSerializer(serializers.ModelSerializer):
    """Full serializer for public program detail view."""

    image_url = serializers.SerializerMethodField()
    registration_available = serializers.SerializerMethodField()
    landing = serializers.SerializerMethodField()
    curriculum_modules = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    testimonials = serializers.SerializerMethodField()
    instructors = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'slug', 'branch',
            'title_en', 'title_ar',
            'short_description_en', 'short_description_ar',
            'overview_en', 'overview_ar',
            'audience_levels', 'status',
            'modules_en', 'modules_ar',
            'skills_en', 'skills_ar',
            'learning_outcomes_en', 'learning_outcomes_ar',
            'practical_project_en', 'practical_project_ar',
            'duration_en', 'duration_ar',
            'format_en', 'format_ar',
            'schedule_en', 'schedule_ar',
            'cta_text_en', 'cta_text_ar',
            'image_url', 'display_order',
            'registration_url', 'registration_open', 'registration_available',
            'registration_deadline', 'maximum_capacity',
            'registration_cta_text_en', 'registration_cta_text_ar',
            'registration_closed_cta_text_en', 'registration_closed_cta_text_ar',
            'registration_success_cta_text_en', 'registration_success_cta_text_ar',
            # Landing page nested data
            'landing', 'curriculum_modules', 'faqs', 'testimonials', 'instructors',
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

    def get_registration_available(self, obj):
        return registration_available(obj)

    def get_landing(self, obj):
        try:
            landing = obj.landing
        except ProgramLanding.DoesNotExist:
            return None
        request = self.context.get('request')

        def _media_url(asset):
            if asset and asset.file:
                if request:
                    return request.build_absolute_uri(asset.file.url)
                return asset.file.url
            return None

        # Suppress professional prices when campaign pricing mode is active.
        # Starter and Summer programs are unaffected.
        suppress_price = _is_professional_price_suppressed(obj)

        return {
            'headline_en': landing.headline_en,
            'headline_ar': landing.headline_ar,
            'intro_video_type': landing.intro_video_type,
            'intro_video_url': landing.intro_video_url,
            'intro_video_file_url': _media_url(landing.intro_video_file),
            'video_poster_url': _media_url(landing.video_poster),
            'video_title_en': landing.video_title_en,
            'video_title_ar': landing.video_title_ar,
            'quick_facts': landing.quick_facts,
            'current_price': None if suppress_price else (str(landing.current_price) if landing.current_price is not None else None),
            'original_price': None if suppress_price else (str(landing.original_price) if landing.original_price is not None else None),
            'currency': None if suppress_price else landing.currency,
            'discount_percentage': None if suppress_price else landing.discount_percentage,
            'included_items': landing.included_items,
            'show_pricing': False if suppress_price else landing.show_pricing,
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
            'og_image_url': _media_url(landing.og_image),
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
        modules = obj.curriculum_modules.filter(is_published=True).order_by('display_order', 'id')
        result = []
        for m in modules:
            topics = m.topics.order_by('display_order', 'id')
            result.append({
                'id': m.id,
                'title_en': m.title_en,
                'title_ar': m.title_ar,
                'description_en': m.description_en,
                'description_ar': m.description_ar,
                'display_order': m.display_order,
                'topics': [
                    {
                        'id': t.id,
                        'title_en': t.title_en,
                        'title_ar': t.title_ar,
                        'display_order': t.display_order,
                    }
                    for t in topics
                ],
            })
        return result

    def get_faqs(self, obj):
        faqs = obj.program_faqs.order_by('display_order', 'id')
        return [
            {
                'id': f.id,
                'question_en': f.question_en,
                'question_ar': f.question_ar,
                'answer_en': f.answer_en,
                'answer_ar': f.answer_ar,
                'display_order': f.display_order,
            }
            for f in faqs
        ]

    def get_testimonials(self, obj):
        testimonials = obj.program_testimonials.filter(is_approved=True).order_by('display_order', 'id')
        request = self.context.get('request')

        def _media_url(asset):
            if asset and asset.file:
                if request:
                    return request.build_absolute_uri(asset.file.url)
                return asset.file.url
            return None

        return [
            {
                'id': t.id,
                'student_name_en': t.student_name_en,
                'student_name_ar': t.student_name_ar,
                'content_en': t.content_en,
                'content_ar': t.content_ar,
                'rating': t.rating,
                'image_url': _media_url(t.image),
                'display_order': t.display_order,
            }
            for t in testimonials
        ]

    def get_instructors(self, obj):
        pis = obj.program_instructors.select_related('instructor', 'instructor__image').order_by('display_order', 'id')
        request = self.context.get('request')

        def _media_url(asset):
            if asset and asset.file:
                if request:
                    return request.build_absolute_uri(asset.file.url)
                return asset.file.url
            return None

        return [
            {
                'id': pi.instructor.id,
                'name_en': pi.instructor.name_en,
                'name_ar': pi.instructor.name_ar,
                'title_en': pi.instructor.title_en,
                'title_ar': pi.instructor.title_ar,
                'bio_en': pi.instructor.bio_en,
                'bio_ar': pi.instructor.bio_ar,
                'image_url': _media_url(pi.instructor.image),
                'linkedin_url': pi.instructor.linkedin_url,
                'display_order': pi.display_order,
            }
            for pi in pis
            if pi.instructor.is_active
        ]


class GoogleFormRegistrationSerializer(serializers.ModelSerializer):
    """Strict allow-list serializer for Google Form ingestion."""

    form_key = serializers.CharField(write_only=True, max_length=64)

    class Meta:
        model = TrainingRegistration
        fields = [
            'form_key', 'external_submission_id', 'full_name', 'email', 'phone',
            'national_id', 'college_or_school', 'academic_year',
            'preferred_language', 'notes', 'source_page',
        ]
        extra_kwargs = {
            'external_submission_id': {'required': True, 'allow_blank': False},
            'full_name': {'required': True, 'allow_blank': False},
            'email': {'required': False, 'allow_blank': True},
        }
        validators = []

    def validate_form_key(self, value):
        program = Program.objects.filter(external_form_key=value).first()
        if not program:
            raise serializers.ValidationError('Invalid form configuration.')
        self.context['program'] = program
        return value

    def validate(self, attrs):
        program = self.context['program']
        if not program.registration_open:
            raise serializers.ValidationError({'form_key': 'Registration is closed.'})
        if program.registration_deadline and program.registration_deadline <= timezone.now():
            raise serializers.ValidationError({'form_key': 'Registration deadline has passed.'})
        if program.maximum_capacity:
            active_count = program.registrations.exclude(
                status__in=[TrainingRegistration.STATUS_REJECTED, TrainingRegistration.STATUS_CANCELLED]
            ).count()
            if active_count >= program.maximum_capacity:
                raise serializers.ValidationError({'form_key': 'Registration capacity has been reached.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('form_key')
        program = Program.objects.select_for_update().get(pk=self.context['program'].pk)
        if program.maximum_capacity:
            active_count = program.registrations.exclude(
                status__in=[TrainingRegistration.STATUS_REJECTED, TrainingRegistration.STATUS_CANCELLED]
            ).count()
            if active_count >= program.maximum_capacity:
                raise serializers.ValidationError({'form_key': 'Registration capacity has been reached.'})
        return TrainingRegistration.objects.create(
            program=program,
            source=TrainingRegistration.SOURCE_GOOGLE_FORM,
            status=TrainingRegistration.STATUS_NEW,
            enrollment_stage=TrainingRegistration.ENROLLMENT_STAGE_NEEDS_CONTACT,
            **validated_data,
        )


# ---------------------------------------------------------------------------
# Website (native) registration
# ---------------------------------------------------------------------------

class WebsiteRegistrationSerializer(serializers.ModelSerializer):
    """Public serializer for native website registration form submissions.

    Accepts PII fields + UTM attribution. Enforces:
    - required fields (full_name, phone, privacy consent)
    - email is optional for all programs (canonical rule: phone/WhatsApp is
      the primary contact); non-empty values are still email-validated
    - registration open/closed/deadline/capacity checks
    - honeypot field (website_field) to block bots
    - privacy_policy_consent must be True
    - program is bound from the URL, not user input
    """

    # Honeypot — must be empty for legitimate submissions
    website_field = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # Privacy consent — required
    privacy_policy_consent = serializers.BooleanField(write_only=True, required=True)

    # UTM fields — optional, no PII
    utm_source = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=255)
    utm_medium = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=255)
    utm_campaign = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=255)
    utm_content = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=255)
    utm_term = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=255)
    referrer = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=512)
    landing_page_url = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=512)

    # Starter campaign registration fields — optional for legacy forms and
    # retained for compatibility with forms that still collect them.
    current_level = serializers.CharField(required=False, allow_blank=True, max_length=20)
    current_status = serializers.CharField(required=False, allow_blank=True, max_length=20)
    current_status_other = serializers.CharField(required=False, allow_blank=True, max_length=255)
    acquisition_source = serializers.CharField(required=False, allow_blank=True, max_length=20)
    acquisition_source_other = serializers.CharField(required=False, allow_blank=True, max_length=255)

    class Meta:
        model = TrainingRegistration
        fields = [
            'website_field', 'privacy_policy_consent',
            'full_name', 'email', 'phone',
            'college_or_school', 'academic_year', 'notes',
            'preferred_language',
            'university', 'university_other',
            'education_status', 'education_status_other',
            'current_level', 'current_status', 'current_status_other',
            'acquisition_source', 'acquisition_source_other',
            'utm_source', 'utm_medium', 'utm_campaign',
            'utm_content', 'utm_term', 'referrer', 'landing_page_url',
        ]
        extra_kwargs = {
            'full_name': {'required': True, 'allow_blank': False, 'max_length': 255},
            'email': {'required': False, 'allow_blank': True},
            'phone': {'required': True, 'allow_blank': False, 'max_length': 40},
            'notes': {'required': False, 'allow_blank': True, 'max_length': 2000},
            'college_or_school': {'required': False, 'allow_blank': True, 'max_length': 255},
            'academic_year': {'required': False, 'allow_blank': True, 'max_length': 120},
            'preferred_language': {'required': False, 'allow_blank': True, 'max_length': 10},
            'university': {'required': False, 'allow_blank': True, 'max_length': 100},
            'university_other': {'required': False, 'allow_blank': True, 'max_length': 255},
            'education_status': {'required': False, 'allow_blank': True, 'max_length': 20},
            'education_status_other': {'required': False, 'allow_blank': True, 'max_length': 255},
        }
        validators = []

    def validate_website_field(self, value):
        """Honeypot — if filled, silently reject (bot)."""
        if value:
            raise serializers.ValidationError('Submission rejected.')
        return value

    def validate_privacy_policy_consent(self, value):
        if not value:
            raise serializers.ValidationError('Privacy policy consent is required.')
        return value

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Full name is required.')
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Full name must be at least 3 characters.')
        return ' '.join(value.split())

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phone(self, value):
        import re
        digits = re.sub(r'\D', '', value)
        if len(digits) < 7:
            raise serializers.ValidationError('A valid phone number is required.')
        return value.strip()

    def validate_university(self, value):
        """Validate that the university value is a recognized key or blank."""
        from .egyptian_universities import VALID_UNIVERSITY_VALUES
        value = (value or '').strip()
        if value and value not in VALID_UNIVERSITY_VALUES:
            raise serializers.ValidationError('Invalid university selection.')
        return value

    def validate_education_status(self, value):
        """Validate that the education status is a recognized key or blank."""
        from .egyptian_universities import VALID_EDUCATION_STATUS_VALUES
        value = (value or '').strip()
        if value and value not in VALID_EDUCATION_STATUS_VALUES:
            raise serializers.ValidationError('Invalid education status selection.')
        return value

    def validate(self, attrs):
        # Program is set in the view's context, not from user input
        program = self.context.get('program')
        if not program:
            raise serializers.ValidationError('Program not found.')

        # Cross-field validation for "Other" conditional fields
        university = attrs.get('university', '')
        university_other = attrs.get('university_other', '')
        if university == 'other' and not university_other.strip():
            raise serializers.ValidationError({
                'university_other': 'Please enter the university or educational institution name.',
            })

        education_status = attrs.get('education_status', '')
        education_status_other = attrs.get('education_status_other', '')
        if education_status == 'other' and not education_status_other.strip():
            raise serializers.ValidationError({
                'education_status_other': 'Please specify your education status.',
            })

        # Validate Starter campaign fields when present
        current_level = attrs.get('current_level', '')
        if current_level and current_level not in dict(TrainingRegistration.CURRENT_LEVEL_CHOICES):
            raise serializers.ValidationError({
                'current_level': 'Invalid level selection.',
            })

        current_status = attrs.get('current_status', '')
        if current_status and current_status not in dict(TrainingRegistration.CURRENT_STATUS_CHOICES):
            raise serializers.ValidationError({
                'current_status': 'Invalid status selection.',
            })
        current_status_other = attrs.get('current_status_other', '')
        if current_status == 'other' and not current_status_other.strip():
            raise serializers.ValidationError({
                'current_status_other': 'Please specify your current status.',
            })

        acquisition_source = attrs.get('acquisition_source', '')
        if acquisition_source and acquisition_source not in dict(TrainingRegistration.ACQUISITION_SOURCE_CHOICES):
            raise serializers.ValidationError({
                'acquisition_source': 'Invalid acquisition source selection.',
            })
        acquisition_source_other = attrs.get('acquisition_source_other', '')
        if acquisition_source == 'other' and not acquisition_source_other.strip():
            raise serializers.ValidationError({
                'acquisition_source_other': 'Please specify how you heard about us.',
            })

        # Check registration is open
        if not program.registration_open:
            raise serializers.ValidationError({
                'non_field_errors': 'Registration for this course is currently closed.',
            })
        if program.registration_deadline and program.registration_deadline <= timezone.now():
            raise serializers.ValidationError({
                'non_field_errors': 'Registration deadline has passed.',
            })

        # Check landing form visibility
        try:
            landing = program.landing
            if not landing.show_registration_form:
                raise serializers.ValidationError({
                    'non_field_errors': 'Registration form is not available for this course.',
                })
        except ProgramLanding.DoesNotExist:
            pass  # Allow if no landing page configured

        # Check capacity
        if program.maximum_capacity:
            active_count = program.registrations.exclude(
                status__in=[TrainingRegistration.STATUS_REJECTED, TrainingRegistration.STATUS_CANCELLED]
            ).count()
            if active_count >= program.maximum_capacity:
                raise serializers.ValidationError({
                    'non_field_errors': 'Registration capacity has been reached.',
                })

        return attrs

    def create(self, validated_data):
        program = self.context['program']
        # Remove non-model fields
        validated_data.pop('website_field', None)
        validated_data.pop('privacy_policy_consent', None)

        return TrainingRegistration.objects.create(
            program=program,
            source=TrainingRegistration.SOURCE_WEBSITE,
            status=TrainingRegistration.STATUS_NEW,
            enrollment_stage=TrainingRegistration.ENROLLMENT_STAGE_NEEDS_CONTACT,
            **validated_data,
        )


class CertificateVerificationSerializer(serializers.ModelSerializer):
    """Safe, detail-only serializer for public certificate verification.

    Only exposes non-PII fields: recipient name, program/course, dates, reference, status.
    Never exposes: phone, email, national ID, internal notes, revocation reason.
    Exposes file_url only for issued certificates with a certificate_file.
    """

    recipient_name = serializers.SerializerMethodField()
    program_title = serializers.SerializerMethodField()
    certificate_title = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'reference', 'status', 'certificate_type',
            'recipient_name', 'program_title', 'certificate_title',
            'training_start_date', 'training_end_date',
            'issued_at', 'is_valid', 'file_url',
        ]
        read_only_fields = fields

    def get_recipient_name(self, obj):
        return obj.effective_recipient_name

    def get_program_title(self, obj):
        program = obj.effective_program
        return program.title_en if program else None

    def get_certificate_title(self, obj):
        return obj.effective_certificate_title

    def get_is_valid(self, obj):
        return obj.status == Certificate.STATUS_ISSUED and obj.revoked_at is None

    def get_file_url(self, obj):
        """Return the certificate PDF URL only for valid issued certificates."""
        if obj.status == Certificate.STATUS_ISSUED and obj.revoked_at is None and obj.certificate_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.certificate_file.url)
            return obj.certificate_file.url
        return None


# ---------------------------------------------------------------------------
# Public Courses Offers serializers (OfferCampaign -> OfferItem -> Program)
# ---------------------------------------------------------------------------

class PublicOfferItemSerializer(serializers.Serializer):
    """Public serialization of an offer item (a course within a campaign).

    Price-leakage protection: ``promo_price`` / ``promo_currency`` are only
    serialized when the item's ``show_promo_price_publicly`` flag is True.
    When the flag is False the fields are entirely absent from the payload
    (not null, not zero) so no numeric price can leak for Professional courses.
    """

    id = serializers.IntegerField(read_only=True)
    program_slug = serializers.CharField(source='program.slug', read_only=True)
    program_title_en = serializers.CharField(source='program.title_en', read_only=True)
    program_title_ar = serializers.CharField(source='program.title_ar', read_only=True)
    program_branch = serializers.CharField(source='program.branch', read_only=True)
    program_image_url = serializers.SerializerMethodField()
    program_duration_en = serializers.CharField(source='program.duration_en', read_only=True)
    program_duration_ar = serializers.CharField(source='program.duration_ar', read_only=True)
    registration_available = serializers.SerializerMethodField()

    # Effective per-course values (item override falling back to campaign default)
    badge_en = serializers.SerializerMethodField()
    badge_ar = serializers.SerializerMethodField()
    promotional_copy_en = serializers.SerializerMethodField()
    promotional_copy_ar = serializers.SerializerMethodField()
    cta_label_en = serializers.SerializerMethodField()
    cta_label_ar = serializers.SerializerMethodField()

    # Resolved CTA destination: item override, else the course landing page
    cta_url = serializers.SerializerMethodField()

    # Only present when show_promo_price_publicly is True
    promo_price = serializers.SerializerMethodField()
    promo_currency = serializers.SerializerMethodField()

    def get_program_image_url(self, obj):
        program = obj.program
        if program.image and program.image.file:
            request = self.context.get('request')
            url = program.image.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_registration_available(self, obj):
        return registration_available(obj.program)

    def get_badge_en(self, obj):
        return obj.badge_en or obj.campaign.badge_en or ''

    def get_badge_ar(self, obj):
        return obj.badge_ar or obj.campaign.badge_ar or ''

    def get_promotional_copy_en(self, obj):
        return obj.promotional_copy_en or obj.campaign.description_en or ''

    def get_promotional_copy_ar(self, obj):
        return obj.promotional_copy_ar or obj.campaign.description_ar or ''

    def get_cta_label_en(self, obj):
        return obj.cta_label_en or ''

    def get_cta_label_ar(self, obj):
        return obj.cta_label_ar or ''

    def get_cta_url(self, obj):
        if obj.cta_url:
            return obj.cta_url
        return f'/training/{obj.program.slug}'

    def get_promo_price(self, obj):
        if not obj.show_promo_price_publicly or obj.promo_price is None:
            return None
        return str(obj.promo_price)

    def get_promo_currency(self, obj):
        if not obj.show_promo_price_publicly or obj.promo_price is None:
            return None
        return obj.promo_currency


class PublicOfferCampaignSerializer(serializers.Serializer):
    """Public serialization of an active offer campaign with its active items."""

    id = serializers.IntegerField(read_only=True)
    slug = serializers.CharField(read_only=True)
    title_en = serializers.CharField(read_only=True)
    title_ar = serializers.CharField(read_only=True)
    description_en = serializers.CharField(read_only=True)
    description_ar = serializers.CharField(read_only=True)
    badge_en = serializers.CharField(read_only=True)
    badge_ar = serializers.CharField(read_only=True)
    ends_at = serializers.DateTimeField(source='end_date', read_only=True)
    items = serializers.SerializerMethodField()

    def get_items(self, obj):
        items = obj.public_items
        return PublicOfferItemSerializer(items, many=True, context=self.context).data


class PublicStarterCampaignConfigSerializer(serializers.Serializer):
    """Public read-only serializer for the shared Starter campaign form configuration.

    Exposes only the fields required by the public Starter registration page.
    Internal/admin fields (is_active, id, timestamps) are intentionally excluded.
    """

    show_registration_form = serializers.BooleanField(read_only=True)
    form_title_en = serializers.CharField(read_only=True)
    form_title_ar = serializers.CharField(read_only=True)
    form_description_en = serializers.CharField(read_only=True)
    form_description_ar = serializers.CharField(read_only=True)
    form_button_en = serializers.CharField(read_only=True)
    form_button_ar = serializers.CharField(read_only=True)
    success_message_en = serializers.CharField(read_only=True)
    success_message_ar = serializers.CharField(read_only=True)
    success_note_en = serializers.CharField(read_only=True)
    success_note_ar = serializers.CharField(read_only=True)
    closed_message_en = serializers.CharField(read_only=True)
    closed_message_ar = serializers.CharField(read_only=True)
