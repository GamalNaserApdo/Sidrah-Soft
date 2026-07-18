from rest_framework import serializers

from .models import Job


class BilingualField(serializers.SerializerMethodField):
    """Expose a bilingual pair with fallback to English."""

    def __init__(self, en_field, ar_field, **kwargs):
        super().__init__(**kwargs)
        self.en_field = en_field
        self.ar_field = ar_field

    def to_representation(self, value):
        en_value = getattr(value, self.en_field, '') or ''
        ar_value = getattr(value, self.ar_field, '') or ''
        return {
            'en': en_value,
            'ar': ar_value or en_value,
        }


class JobListSerializer(serializers.ModelSerializer):
    """Card-ready public representation of a job."""

    title = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    application = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id',
            'slug',
            'title',
            'department',
            'location',
            'short_description',
            'employment_type',
            'workplace_type',
            'experience_level',
            'application',
            'posted_date',
            'closing_date',
            'display_order',
            'is_featured',
            'show_on_homepage',
        ]

    def get_title(self, obj):
        return {
            'en': obj.title_en,
            'ar': obj.title_ar or obj.title_en,
        }

    def get_department(self, obj):
        return {
            'en': obj.department_en,
            'ar': obj.department_ar or obj.department_en,
        }

    def get_location(self, obj):
        return {
            'en': obj.location_en,
            'ar': obj.location_ar or obj.location_en,
        }

    def get_short_description(self, obj):
        return {
            'en': obj.short_description_en,
            'ar': obj.short_description_ar or obj.short_description_en,
        }

    def get_application(self, obj):
        method = obj.application_method
        url = ''
        email = ''

        if method == Job.APPLICATION_METHOD_EXTERNAL_URL:
            url = obj.external_apply_url
        elif method == Job.APPLICATION_METHOD_CONTACT_PAGE:
            url = '#contact'
        elif method == Job.APPLICATION_METHOD_EMAIL:
            email = obj.application_email
            url = f'mailto:{obj.application_email}'

        return {
            'method': method,
            'url': url,
            'email': email,
        }


class JobDetailSerializer(JobListSerializer):
    """Full public representation of a job."""

    description = serializers.SerializerMethodField()
    responsibilities = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()
    preferred_qualifications = serializers.SerializerMethodField()
    benefits = serializers.SerializerMethodField()
    seo = serializers.SerializerMethodField()

    class Meta(JobListSerializer.Meta):
        fields = JobListSerializer.Meta.fields + [
            'description',
            'responsibilities',
            'requirements',
            'preferred_qualifications',
            'benefits',
            'seo',
        ]

    def _bilingual(self, obj, en_field, ar_field):
        en_value = getattr(obj, en_field, '') or ''
        ar_value = getattr(obj, ar_field, '') or ''
        return {
            'en': en_value,
            'ar': ar_value or en_value,
        }

    def get_description(self, obj):
        return self._bilingual(obj, 'description_en', 'description_ar')

    def get_responsibilities(self, obj):
        return self._bilingual(obj, 'responsibilities_en', 'responsibilities_ar')

    def get_requirements(self, obj):
        return self._bilingual(obj, 'requirements_en', 'requirements_ar')

    def get_preferred_qualifications(self, obj):
        return self._bilingual(obj, 'preferred_qualifications_en', 'preferred_qualifications_ar')

    def get_benefits(self, obj):
        return self._bilingual(obj, 'benefits_en', 'benefits_ar')

    def get_seo(self, obj):
        return {
            'title': self._bilingual(obj, 'seo_title_en', 'seo_title_ar'),
            'description': self._bilingual(obj, 'seo_description_en', 'seo_description_ar'),
        }
