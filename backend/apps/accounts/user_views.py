"""
CMS Admin API views for user management.

Endpoints (all under /api/v1/admin/users/):
- GET    /                — List users (paginated, filterable, searchable)
- POST   /                — Create user
- GET    /<id>/           — Retrieve user
- PATCH  /<id>/           — Update user (name, email, role)
- POST   /<id>/activate/  — Activate user
- POST   /<id>/deactivate/ — Deactivate user
- POST   /<id>/reset-password/ — Reset password

Authorization: requires users.manage_users capability.
Anonymous users and users without this capability receive 403.

Security rules enforced:
- Never return password hashes.
- Never log passwords or CSRF/session secrets.
- Use set_password() with Django password validators.
- Reject blank or weak passwords.
- Do not permit arbitrary role values.
- Do not permit privilege changes (is_superuser, is_staff) through serializer fields.
- Do not allow a user to deactivate their own current account.
- Do not allow deactivation of the last active super_admin.
- Do not allow removal of the last active super_admin role.
- Activity logs are append-only and sanitized.
"""

from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.accounts.roles import ROLE_SUPER_ADMIN, get_effective_role
from apps.activity_logs.services import log_activity

from .models import User
from .user_serializers import (
    CMSUserCreateSerializer,
    CMSUserManagementSerializer,
    CMSUserUpdateSerializer,
    CMSPasswordResetSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


def _is_super_admin_user(user):
    """Return True if the user has super_admin role or is_superuser flag."""
    if user.is_superuser:
        return True
    effective = get_effective_role(getattr(user, 'role', None))
    return effective == ROLE_SUPER_ADMIN


def _count_active_super_admins():
    """Count active users who are super_admin by role or is_superuser flag."""
    return User.objects.filter(is_active=True).filter(
        Q(is_superuser=True) | Q(role=ROLE_SUPER_ADMIN)
    ).count()


class UserManagementViewSet(ViewSet):
    """
    ViewSet for CMS user management.
    All actions require the users.manage_users capability.
    """

    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    cms_module = 'users'
    cms_action = 'manage_users'
    pagination_class = StandardResultsSetPagination

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def _log(self, request, action, user_obj, description, metadata=None):
        log_activity(
            user=request.user,
            action=action,
            module='users',
            request=request,
            object_instance=user_obj,
            description=description,
            metadata=metadata or {},
            is_success=True,
        )

    # ------------------------------------------------------------------
    # List
    # ------------------------------------------------------------------

    def list(self, request):
        qs = User.objects.order_by('-date_joined')

        role = request.query_params.get('role')
        is_active = request.query_params.get('is_active')
        search = request.query_params.get('search')

        if role:
            qs = qs.filter(role=role)
        if is_active is not None:
            lowered = is_active.strip().lower()
            if lowered in ('true', '1'):
                qs = qs.filter(is_active=True)
            elif lowered in ('false', '0'):
                qs = qs.filter(is_active=False)
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = CMSUserManagementSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    # ------------------------------------------------------------------
    # Retrieve
    # ------------------------------------------------------------------

    def retrieve(self, request, pk=None):
        user = self._get_object(pk)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CMSUserManagementSerializer(user)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------

    def create(self, request):
        serializer = CMSUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        self._log(
            request, 'user_created', user,
            f'Created user "{user.username}" with role "{user.role}".',
            metadata={'username': user.username, 'role': user.role},
        )

        return Response(
            CMSUserManagementSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )

    # ------------------------------------------------------------------
    # Update (partial)
    # ------------------------------------------------------------------

    def partial_update(self, request, pk=None):
        target = self._get_object(pk)
        if not target:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        old_role = target.role

        serializer = CMSUserUpdateSerializer(
            data=request.data,
            context={'instance': target},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        # Last super_admin role protection
        new_role = serializer.validated_data.get('role')
        if new_role is not None and new_role != old_role:
            if _is_super_admin_user(target) and _count_active_super_admins() <= 1:
                effective_old = get_effective_role(old_role)
                effective_new = get_effective_role(new_role)
                if effective_old == ROLE_SUPER_ADMIN and effective_new != ROLE_SUPER_ADMIN:
                    return Response(
                        {'detail': 'Cannot remove the last active super_admin role.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        updated = serializer.update(target, serializer.validated_data)

        # Log role change separately if it changed
        if new_role is not None and new_role != old_role:
            self._log(
                request, 'role_changed', updated,
                f'Changed role for "{updated.username}" from "{old_role}" to "{new_role}".',
                metadata={'old_role': old_role, 'new_role': new_role},
            )

        # Log general update
        changed_fields = [k for k in serializer.validated_data.keys() if k != 'role']
        if changed_fields:
            self._log(
                request, 'user_updated', updated,
                f'Updated fields for "{updated.username}": {", ".join(changed_fields)}.',
                metadata={'fields': changed_fields},
            )

        return Response(CMSUserManagementSerializer(updated).data)

    # ------------------------------------------------------------------
    # Activate
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        target = self._get_object(pk)
        if not target:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target.is_active:
            return Response(
                {'detail': 'User is already active.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target.is_active = True
        target.save(update_fields=['is_active'])

        self._log(
            request, 'user_activated', target,
            f'Activated user "{target.username}".',
            metadata={'username': target.username},
        )

        return Response(CMSUserManagementSerializer(target).data)

    # ------------------------------------------------------------------
    # Deactivate
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        target = self._get_object(pk)
        if not target:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not target.is_active:
            return Response(
                {'detail': 'User is already inactive.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Self-deactivation protection
        if target.pk == request.user.pk:
            return Response(
                {'detail': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Last super_admin deactivation protection
        if _is_super_admin_user(target) and _count_active_super_admins() <= 1:
            return Response(
                {'detail': 'Cannot deactivate the last active super_admin.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target.is_active = False
        target.save(update_fields=['is_active'])

        self._log(
            request, 'user_deactivated', target,
            f'Deactivated user "{target.username}".',
            metadata={'username': target.username},
        )

        return Response(CMSUserManagementSerializer(target).data)

    # ------------------------------------------------------------------
    # Reset password
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        target = self._get_object(pk)
        if not target:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CMSPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target.set_password(serializer.validated_data['password'])
        target.save(update_fields=['password'])

        self._log(
            request, 'password_reset', target,
            f'Password reset for user "{target.username}".',
            metadata={'username': target.username},
        )

        return Response({'detail': 'Password updated successfully.'})
