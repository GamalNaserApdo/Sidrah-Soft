"""Public serializers for the Contact Management CMS app."""
import re

from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.services.models import Service

from .models import ContactSubmission, InquiryType


class InquiryTypeSerializer(serializers.ModelSerializer):
    """Public read-only representation of an inquiry type."""

    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = InquiryType
        fields = [
            'id',
            'slug',
            'name',
            'description',
            'order',
        ]

    def get_name(self, obj):
        return {
            'en': obj.name_en,
            'ar': obj.name_ar or obj.name_en,
        }

    def get_description(self, obj):
        return {
            'en': obj.description_en,
            'ar': obj.description_ar or obj.description_en,
        }


class ContactSubmissionCreateSerializer(serializers.ModelSerializer):
    """Public write-only serializer for creating contact submissions."""

    inquiry_type = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=InquiryType.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    related_service = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Service.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    # Honeypot field: legitimate users never fill this; bots often do.
    website = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )

    class Meta:
        model = ContactSubmission
        fields = [
            'full_name',
            'email',
            'phone',
            'company',
            'job_title',
            'inquiry_type',
            'related_service',
            'subject',
            'message',
            'preferred_contact_method',
            'privacy_consent',
            'source_page',
            'language',
            'website',
        ]

    def validate_full_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError(_('Full name is required.'))
        if len(value) > 255:
            raise serializers.ValidationError(_('Full name must be 255 characters or fewer.'))
        return value

    def validate_email(self, value):
        value = (value or '').strip().lower()
        if not value:
            raise serializers.ValidationError(_('Email is required.'))
        if len(value) > 254:
            raise serializers.ValidationError(_('Email is too long.'))
        return value

    def validate_phone(self, value):
        value = (value or '').strip()
        if value and len(value) > 40:
            raise serializers.ValidationError(_('Phone must be 40 characters or fewer.'))
        if value and not re.match(r'^[\d\s\+\-\(\)\.]+$', value):
            raise serializers.ValidationError(
                _('Phone may only contain digits, spaces, and + - ( ).')
            )
        return value

    def validate_company(self, value):
        value = (value or '').strip()
        if value and len(value) > 255:
            raise serializers.ValidationError(_('Company must be 255 characters or fewer.'))
        return value

    def validate_job_title(self, value):
        value = (value or '').strip()
        if value and len(value) > 120:
            raise serializers.ValidationError(_('Job title must be 120 characters or fewer.'))
        return value

    def validate_subject(self, value):
        value = (value or '').strip()
        if value and len(value) > 255:
            raise serializers.ValidationError(_('Subject must be 255 characters or fewer.'))
        return value

    def validate_message(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError(_('Message is required.'))
        if len(value) < 10:
            raise serializers.ValidationError(
                _('Message must be at least 10 characters.')
            )
        if len(value) > 5000:
            raise serializers.ValidationError(
                _('Message must be 5000 characters or fewer.')
            )
        return value

    def validate_preferred_contact_method(self, value):
        value = (value or '').strip().lower()
        choices = dict(ContactSubmission.PREFERRED_CONTACT_CHOICES)
        if value and value not in choices:
            raise serializers.ValidationError(_('Invalid contact preference.'))
        return value

    def validate_language(self, value):
        value = (value or 'en').strip().lower()
        supported = getattr(settings, 'SUPPORTED_LANGUAGES', ['en', 'ar'])
        if value not in supported:
            raise serializers.ValidationError(_('Unsupported language.'))
        return value

    def validate_source_page(self, value):
        value = (value or '').strip()
        if value and len(value) > 512:
            raise serializers.ValidationError(_('Source page is too long.'))
        return value

    def validate_website(self, value):
        """Reject honeypot field if populated."""
        value = (value or '').strip()
        if value:
            raise serializers.ValidationError(_('Invalid submission.'))
        return value

    def validate_privacy_consent(self, value):
        if not value:
            raise serializers.ValidationError(
                _('You must agree to the privacy policy to submit.')
            )
        return value

    def validate(self, attrs):
        # Normalize whitespace on text fields.
        for field in ('full_name', 'company', 'job_title', 'subject'):
            if field in attrs and attrs[field] is not None:
                attrs[field] = ' '.join(attrs[field].split())
        if 'message' in attrs and attrs['message'] is not None:
            attrs['message'] = ' '.join(attrs['message'].split())
        return attrs

    def create(self, validated_data):
        # The honeypot field is validated above; it must not reach the model.
        validated_data.pop('website', None)
        return super().create(validated_data)
