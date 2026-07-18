"""
DRF permission classes for CMS dashboard authorization.

All admin API views must use one or more of these classes.
Frontend hiding is for UX only — these enforce security server-side.
"""

from rest_framework.permissions import BasePermission

from .roles import (
    CMS_ROLES,
    ROLE_SUPER_ADMIN,
    get_effective_role,
    get_role_permissions,
    has_module_access,
    has_permission,
)


class IsCMSUser(BasePermission):
    """
    Allow access only to authenticated, active users whose role
    grants CMS dashboard access (or who are superusers/staff).
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.is_active:
            return False
        if user.is_superuser:
            return True
        return getattr(user, 'role', None) in CMS_ROLES


class IsSuperAdmin(BasePermission):
    """Allow access only to superusers or users with super_admin role."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.is_active:
            return False
        if user.is_superuser:
            return True
        return getattr(user, 'role', None) == ROLE_SUPER_ADMIN


class CanManageUsers(BasePermission):
    """Allow access only to super_admin or admin roles (user management)."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.is_active:
            return False
        if user.is_superuser:
            return True
        role = getattr(user, 'role', None)
        effective = get_effective_role(role) if role else None
        return effective in (ROLE_SUPER_ADMIN, 'admin')


class HasCMSRole(BasePermission):
    """
    Base class that checks the user has one of the specified roles.
    Subclass and set `allowed_roles` or use directly via view attribute.

    Usage in view:
        permission_classes = [HasCMSRole]
        cms_allowed_roles = ['super_admin', 'admin', 'content_manager']
    """
    allowed_roles = None

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.is_active:
            return False
        if user.is_superuser:
            return True

        roles = self.allowed_roles or getattr(view, 'cms_allowed_roles', None)
        if not roles:
            return False

        role = getattr(user, 'role', None)
        effective = get_effective_role(role) if role else None
        return effective in roles


class HasModulePermission(BasePermission):
    """
    Check that the user has access to a specific module and action.

    Usage in view:
        permission_classes = [HasModulePermission]
        cms_module = 'insights'
        cms_action = 'create'  # optional, defaults to 'view'
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.is_active:
            return False
        if user.is_superuser:
            return True

        role = getattr(user, 'role', None)
        if not role:
            return False

        module = getattr(view, 'cms_module', None)
        action = getattr(view, 'cms_action', 'view')

        if not module:
            return False

        return has_permission(role, module, action)


class CanPublishContent(BasePermission):
    """Check if user can publish content in the specified module."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.is_active:
            return False
        if user.is_superuser:
            return True

        role = getattr(user, 'role', None)
        if not role:
            return False

        module = getattr(view, 'cms_module', None)
        if not module:
            return False

        return has_permission(role, module, 'publish')
