"""Public serializers for the Dynamic Form Builder.

The public serializer exposes the form schema (fields, options) for rendering
and accepts submissions with server-side validation against the authoritative schema.
"""
import re

from rest_framework import serializers

from .models import (
    FormDefinition, FormField, FormFieldOption,
    FormSubmission, FormSubmissionValue,
    FIELD_TYPES_WITH_OPTIONS, SYSTEM_FIELD_KEYS,
)


# ---------------------------------------------------------------------------
# Public schema serializers (read-only)
# ---------------------------------------------------------------------------

class FormFieldOptionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormFieldOption
        fields = ['value', 'label_en', 'label_ar']
        read_only_fields = fields


class FormFieldPublicSerializer(serializers.ModelSerializer):
    options = FormFieldOptionPublicSerializer(many=True, read_only=True)

    class Meta:
        model = FormField
        fields = [
            'id', 'field_key', 'field_type',
            'label_en', 'label_ar',
            'placeholder_en', 'placeholder_ar',
            'help_text_en', 'help_text_ar',
            'is_required', 'is_system', 'display_order',
            'options',
        ]
        read_only_fields = fields


class FormDefinitionPublicSerializer(serializers.ModelSerializer):
    fields = serializers.SerializerMethodField(method_name='get_active_fields')

    class Meta:
        model = FormDefinition
        fields = [
            'id', 'slug', 'title_en', 'title_ar',
            'description_en', 'description_ar',
            'submit_button_en', 'submit_button_ar',
            'success_message_en', 'success_message_ar',
            'fields',
        ]
        read_only_fields = fields

    def get_active_fields(self, obj):
        active_fields = obj.fields.filter(is_active=True).order_by('display_order', 'id')
        return FormFieldPublicSerializer(active_fields, many=True, context=self.context).data


# ---------------------------------------------------------------------------
# Public submission serializer
# ---------------------------------------------------------------------------

class FormSubmissionCreateSerializer(serializers.Serializer):
    """
    Accepts a flat dict of field_key → value pairs.
    Validates against the authoritative form schema loaded server-side.
    """

    # Honeypot field — must be empty
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        self._form = kwargs.pop('form', None)
        self._language = kwargs.pop('language', 'en')
        self._source_page = kwargs.pop('source_page', '')
        self._ip_address = kwargs.pop('ip_address', None)
        self._user_agent = kwargs.pop('user_agent', '')
        super().__init__(*args, **kwargs)

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError('Spam detected.')
        return value

    def validate(self, attrs):
        # Remove honeypot from data
        attrs.pop('website', None)

        if not self._form or not self._form.is_active:
            raise serializers.ValidationError('Form is not available.')

        # Load authoritative schema
        active_fields = self._form.fields.filter(is_active=True).select_related().prefetch_related('options')
        field_map = {f.field_key or f'field_{f.id}': f for f in active_fields}

        # Use initial_data to access all submitted fields (not just declared ones)
        raw_data = self.initial_data

        validated_values = {}
        errors = {}

        # Check for unknown fields (schema-authoritative contract)
        known_keys = set(field_map.keys())
        # Control fields that are allowed but not in the schema
        control_keys = {'website', '_language', '_source_page'}
        for submitted_key in raw_data.keys():
            if submitted_key not in known_keys and submitted_key not in control_keys:
                errors[submitted_key] = 'Unknown field.'

        for field_key, field in field_map.items():
            raw_value = raw_data.get(field_key, None)

            # Required check
            if field.is_required and (raw_value is None or raw_value == ''):
                errors[field_key] = 'This field is required.'
                continue

            # Skip empty optional fields
            if raw_value is None or raw_value == '':
                continue

            # Type-specific validation
            error = self._validate_field_value(field, raw_value)
            if error:
                errors[field_key] = error
                continue

            validated_values[field_key] = raw_value

        if errors:
            raise serializers.ValidationError(errors)

        self._validated_values = validated_values
        self._field_map = field_map
        return attrs

    def _validate_field_value(self, field, value):
        """Validate a single field value against its type."""
        ftype = field.field_type

        if ftype == 'email':
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', str(value)):
                return 'Enter a valid email address.'

        elif ftype == 'phone':
            digits = re.sub(r'\D', '', str(value))
            if len(digits) < 7:
                return 'Enter a valid phone number (at least 7 digits).'

        elif ftype == 'number':
            try:
                float(value)
            except (ValueError, TypeError):
                return 'Enter a valid number.'

        elif ftype == 'url':
            url = str(value).strip().lower()
            if not url.startswith('http://') and not url.startswith('https://'):
                return 'Enter a valid URL (must start with http:// or https://).'

        elif ftype == 'date':
            import datetime
            try:
                datetime.datetime.strptime(str(value), '%Y-%m-%d')
            except ValueError:
                return 'Enter a valid date (YYYY-MM-DD).'

        elif ftype in FIELD_TYPES_WITH_OPTIONS:
            valid_values = {opt.value for opt in field.options.filter(is_active=True)}
            if valid_values:
                # Select/Radio/Checkbox with predefined options
                if str(value) not in valid_values:
                    return 'Invalid option selected.'
            elif ftype == 'checkbox':
                # Checkbox without options — accept boolean-like values
                if str(value).lower() not in ('true', 'false', '1', '0', 'yes', 'no', 'on', 'off'):
                    return 'Invalid checkbox value.'

        # Length limits for text fields
        if ftype in ('text', 'email', 'phone', 'url') and len(str(value)) > 500:
            return 'Value too long (max 500 characters).'
        if ftype == 'textarea' and len(str(value)) > 5000:
            return 'Value too long (max 5000 characters).'

        return None

    def create(self, validated_data):
        submission = FormSubmission.objects.create(
            form=self._form,
            language=self._language,
            source_page=self._source_page,
            ip_address=self._ip_address,
            user_agent=self._user_agent[:1000] if self._user_agent else '',
            status='new',
        )

        for field_key, value in self._validated_values.items():
            field = self._field_map[field_key]
            FormSubmissionValue.objects.create(
                submission=submission,
                field_key=field.field_key or '',
                field_label=field.label_en,
                field_type=field.field_type,
                value=str(value),
            )

        return submission
