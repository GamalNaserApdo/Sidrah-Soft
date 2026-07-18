"""CMS serializers for the contact app."""
from rest_framework import serializers

from .models import InquiryType, ContactSubmission


class CMSInquiryTypeSerializer(serializers.ModelSerializer):
    """Full CMS serializer for inquiry types (read + write)."""

    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = InquiryType
        fields = [
            'id', 'name_en', 'name_ar', 'slug',
            'description_en', 'description_ar',
            'recipient_email', 'order', 'is_active',
            'submission_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submission_count']

    def get_submission_count(self, obj):
        return obj.submissions.count()


class CMSContactSubmissionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for submission list (no PII beyond name/email)."""

    inquiry_type_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = ContactSubmission
        fields = [
            'id', 'public_id', 'full_name', 'email',
            'status', 'priority',
            'inquiry_type', 'inquiry_type_name',
            'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_inquiry_type_name(self, obj):
        if obj.inquiry_type:
            return obj.inquiry_type.name_en
        return None

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None


class CMSContactSubmissionDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for submission retrieve (all fields)."""

    inquiry_type_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    related_service_name = serializers.SerializerMethodField()

    class Meta:
        model = ContactSubmission
        fields = [
            'id', 'public_id',
            'full_name', 'email', 'phone', 'company', 'job_title',
            'inquiry_type', 'inquiry_type_name',
            'related_service', 'related_service_name',
            'subject', 'message',
            'preferred_contact_method', 'privacy_consent',
            'source_page', 'language',
            'status', 'priority',
            'assigned_to', 'assigned_to_name',
            'internal_notes',
            'email_delivery_status', 'email_attempted_at', 'email_sent_at',
            'email_error_summary', 'recipient_email_used',
            'ip_address', 'user_agent',
            'contacted_at', 'closed_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'public_id',
            'full_name', 'email', 'phone', 'company', 'job_title',
            'inquiry_type', 'inquiry_type_name',
            'related_service', 'related_service_name',
            'subject', 'message',
            'preferred_contact_method', 'privacy_consent',
            'source_page', 'language',
            'email_delivery_status', 'email_attempted_at', 'email_sent_at',
            'email_error_summary', 'recipient_email_used',
            'ip_address', 'user_agent',
            'contacted_at', 'closed_at',
            'created_at', 'updated_at',
            'inquiry_type_name', 'assigned_to_name', 'related_service_name',
        ]

    def get_inquiry_type_name(self, obj):
        if obj.inquiry_type:
            return obj.inquiry_type.name_en
        return None

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None

    def get_related_service_name(self, obj):
        if obj.related_service:
            return obj.related_service.name_en
        return None


class CMSContactSubmissionUpdateSerializer(serializers.ModelSerializer):
    """Write serializer for submission update — only management fields."""

    class Meta:
        model = ContactSubmission
        fields = ['status', 'priority', 'assigned_to', 'internal_notes']

    def validate_assigned_to(self, value):
        """Only active CMS users can be assigned to a lead."""
        from apps.accounts.roles import CMS_ROLES
        if value is None:
            return value
        if not value.is_active:
            raise serializers.ValidationError('The selected user is inactive.')
        if not (value.is_superuser or getattr(value, 'role', None) in CMS_ROLES):
            raise serializers.ValidationError(
                'The selected user is not a CMS team member.'
            )
        return value
