"""CMS serializers for the Dynamic Form Builder.

Includes list/detail/write serializers for forms, fields, options,
assignments, and submissions. System field protection is enforced.
"""
from rest_framework import serializers

from .models import (
    FormDefinition, FormField, FormFieldOption,
    FormAssignment, FormSubmission, FormSubmissionValue,
    FIELD_TYPE_CHOICES, ASSIGNMENT_TARGET_CHOICES,
    SYSTEM_FIELD_KEYS,
)


# ---------------------------------------------------------------------------
# Form Field Option serializers
# ---------------------------------------------------------------------------

class CMSFormFieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormFieldOption
        fields = [
            'id', 'field', 'value', 'label_en', 'label_ar',
            'is_active', 'display_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'field', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# Form Field serializers
# ---------------------------------------------------------------------------

class CMSFormFieldSerializer(serializers.ModelSerializer):
    options = CMSFormFieldOptionSerializer(many=True, read_only=True)

    class Meta:
        model = FormField
        fields = [
            'id', 'form', 'field_key', 'field_type',
            'label_en', 'label_ar',
            'placeholder_en', 'placeholder_ar',
            'help_text_en', 'help_text_ar',
            'is_required', 'is_active', 'is_system',
            'display_order', 'options',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'form', 'is_system', 'created_at', 'updated_at']
        extra_kwargs = {
            'field_key': {'required': False, 'allow_blank': True},
        }

    def validate_field_type(self, value):
        # System fields cannot change type
        if self.instance and self.instance.is_system and value != self.instance.field_type:
            raise serializers.ValidationError('Cannot change the type of a system field.')
        return value

    def validate_field_key(self, value):
        # System fields cannot change key
        if self.instance and self.instance.is_system and value != self.instance.field_key:
            raise serializers.ValidationError('Cannot change the key of a system field.')
        return value


# ---------------------------------------------------------------------------
# Form Definition serializers
# ---------------------------------------------------------------------------

class CMSFormDefinitionListSerializer(serializers.ModelSerializer):
    submission_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = FormDefinition
        fields = [
            'id', 'name', 'slug', 'title_en', 'title_ar',
            'is_active', 'submission_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'submission_count', 'created_at', 'updated_at']


class CMSFormDefinitionDetailSerializer(serializers.ModelSerializer):
    fields = CMSFormFieldSerializer(many=True, read_only=True)
    assignments = serializers.SerializerMethodField()

    class Meta:
        model = FormDefinition
        fields = [
            'id', 'name', 'slug', 'title_en', 'title_ar',
            'description_en', 'description_ar',
            'submit_button_en', 'submit_button_ar',
            'success_message_en', 'success_message_ar',
            'is_active',
            'fields', 'assignments',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_assignments(self, obj):
        return [
            {'id': a.id, 'target': a.target, 'is_active': a.is_active}
            for a in obj.assignments.all()
        ]


class CMSFormDefinitionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormDefinition
        fields = [
            'id', 'name', 'slug', 'title_en', 'title_ar',
            'description_en', 'description_ar',
            'submit_button_en', 'submit_button_ar',
            'success_message_en', 'success_message_ar',
            'is_active',
        ]
        read_only_fields = ['id']


# ---------------------------------------------------------------------------
# Form Assignment serializers
# ---------------------------------------------------------------------------

class CMSFormAssignmentSerializer(serializers.ModelSerializer):
    target_label_en = serializers.CharField(read_only=True)
    target_label_ar = serializers.CharField(read_only=True)

    class Meta:
        model = FormAssignment
        fields = ['id', 'form', 'target', 'is_active', 'target_label_en', 'target_label_ar', 'created_at', 'updated_at']
        read_only_fields = ['id', 'target_label_en', 'target_label_ar', 'created_at', 'updated_at']

    def validate_target(self, value):
        if value not in dict(ASSIGNMENT_TARGET_CHOICES):
            raise serializers.ValidationError('Invalid assignment target.')
        return value

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        from .models import ASSIGNMENT_TARGET_LABELS
        labels = ASSIGNMENT_TARGET_LABELS.get(instance.target, {})
        ret['target_label_en'] = labels.get('en', instance.target)
        ret['target_label_ar'] = labels.get('ar', instance.target)
        return ret


# ---------------------------------------------------------------------------
# Submission serializers
# ---------------------------------------------------------------------------

class CMSSubmissionValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormSubmissionValue
        fields = ['id', 'field_key', 'field_label', 'field_type', 'value']
        read_only_fields = fields


class CMSFormSubmissionListSerializer(serializers.ModelSerializer):
    form_name = serializers.CharField(source='form.name', read_only=True)
    values_summary = serializers.SerializerMethodField()

    class Meta:
        model = FormSubmission
        fields = [
            'id', 'public_id', 'form', 'form_name',
            'language', 'source_page', 'status',
            'submitted_at', 'values_summary',
        ]
        read_only_fields = fields

    def get_values_summary(self, obj):
        """Return a brief summary of submission values for list view."""
        values = obj.values.all()[:3]
        return [
            {'field_label': v.field_label, 'value': v.value[:100]}
            for v in values
        ]


class CMSFormSubmissionDetailSerializer(serializers.ModelSerializer):
    form_name = serializers.CharField(source='form.name', read_only=True)
    values = CMSSubmissionValueSerializer(many=True, read_only=True)

    class Meta:
        model = FormSubmission
        fields = [
            'id', 'public_id', 'form', 'form_name',
            'language', 'source_page', 'ip_address',
            'user_agent', 'status', 'internal_notes',
            'submitted_at', 'values',
        ]
        read_only_fields = ['id', 'public_id', 'form', 'form_name', 'language', 'source_page', 'ip_address', 'user_agent', 'submitted_at', 'values']


class CMSFormSubmissionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormSubmission
        fields = ['status', 'internal_notes']
