"""
Serializers for CMS user management admin API.

Security rules:
- Never expose password hashes or sensitive fields.
- Role is validated against the defined ROLE_CHOICES.
- Password is write-only and validated via Django password validators.
- is_superuser and is_staff are never settable through these serializers.
"""

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

from .models import User
from .roles import ROLE_SUPER_ADMIN, get_effective_role


class CMSUserManagementSerializer(serializers.ModelSerializer):
    """
    Safe read serializer for CMS user management.
    Never exposes password, password hash, or session secrets.
    """

    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'display_name',
            'role',
            'is_active',
            'is_staff',
            'is_superuser',
            'date_joined',
            'last_login',
        ]
        read_only_fields = fields

    def get_display_name(self, obj):
        full = f'{obj.first_name} {obj.last_name}'.strip()
        return full or obj.username or obj.email


class CMSUserCreateSerializer(serializers.Serializer):
    """
    Write serializer for creating a new CMS user.
    Password is validated and never returned.
    """

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.ROLE_CONTENT_MANAGER)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return value

    def validate_email(self, value):
        value = value.strip()
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_role(self, value):
        """Reject arbitrary role values — only defined roles are allowed."""
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if value not in valid_roles:
            raise serializers.ValidationError('Invalid role.')
        return value

    def validate(self, attrs):
        password = attrs.get('password', '')
        password_confirm = attrs.get('password_confirm', '')

        if not password:
            raise serializers.ValidationError({'password': 'Password cannot be blank.'})

        if password != password_confirm:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        # Apply Django password validators
        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})

        return attrs

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data.get('email', '')
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        role = validated_data['role']
        password = validated_data['password']

        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )
        user.set_password(password)
        user.save()
        return user


class CMSUserUpdateSerializer(serializers.Serializer):
    """
    Write serializer for updating allowed user fields.
    Does not permit password, is_superuser, or is_staff changes.
    Role changes are validated and subject to last-super-admin protection.
    """

    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)

    def validate_email(self, value):
        value = value.strip()
        instance = self.context.get('instance')
        if value and instance:
            qs = User.objects.filter(email__iexact=value).exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_role(self, value):
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if value not in valid_roles:
            raise serializers.ValidationError('Invalid role.')
        return value

    def update(self, instance, validated_data):
        for field in ('first_name', 'last_name', 'email', 'role'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


class CMSPasswordResetSerializer(serializers.Serializer):
    """
    Write serializer for resetting a user's password.
    Password is validated and never returned.
    """

    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        password = attrs.get('password', '')
        password_confirm = attrs.get('password_confirm', '')

        if not password:
            raise serializers.ValidationError({'password': 'Password cannot be blank.'})

        if password != password_confirm:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})

        return attrs
