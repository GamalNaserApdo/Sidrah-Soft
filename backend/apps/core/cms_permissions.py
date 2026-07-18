"""Shared CMS permission and logging mixins for admin API views."""
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.activity_logs.services import log_content_action


class CMSModulePermissionMixin:
    """
    Mixin that automatically maps ViewSet actions and HTTP methods
    to CMS capability actions for HasModulePermission.

    Set ``cms_module`` on the view.  ``cms_action`` is resolved
    dynamically based on the current request.
    """

    cms_module = None
    cms_action = 'view'

    # Override for custom action → cms_action mapping (e.g. workflow endpoints).
    cms_action_map = {}

    def get_cms_action(self):
        """Return the CMS action string for the current request."""
        if hasattr(self, 'action') and self.action in self.cms_action_map:
            return self.cms_action_map[self.action]

        if hasattr(self, 'action'):
            default_map = {
                'list': 'view',
                'retrieve': 'view',
                'create': 'create',
                'update': 'update',
                'partial_update': 'update',
                'destroy': 'delete',
            }
            return default_map.get(self.action, self.cms_action)

        if hasattr(self, 'request') and self.request:
            # If the view class explicitly sets cms_action to a non-default
            # value (e.g. workflow endpoints set cms_action='publish'),
            # respect it instead of mapping from HTTP method.
            class_cms_action = getattr(type(self), 'cms_action', 'view')
            if class_cms_action != 'view':
                return class_cms_action

            method_map = {
                'GET': 'view',
                'POST': 'create',
                'PUT': 'update',
                'PATCH': 'update',
                'DELETE': 'delete',
            }
            return method_map.get(self.request.method, self.cms_action)

        return self.cms_action

    def get_permissions(self):
        """Set cms_action before permission classes are checked."""
        self.cms_action = self.get_cms_action()
        return super().get_permissions()


class CMSViewMixin(CMSModulePermissionMixin):
    """
    Combined mixin providing permission enforcement and activity logging
    for all CMS admin API views.
    """

    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    cms_module = None
    cms_action = 'view'

    def log_cms_action(self, request, action, instance=None, **kwargs):
        """Create an append-only activity log entry for a CMS mutation."""
        description = kwargs.pop('description', '')
        metadata = kwargs.pop('metadata', None)
        object_id = kwargs.pop('object_id', '')
        object_repr = kwargs.pop('object_repr', '')

        if not description and instance is not None:
            description = f'cms.{self.cms_module}.{action}'

        log_content_action(
            user=request.user,
            action=action,
            module=self.cms_module,
            instance=instance,
            request=request,
            description=description,
            metadata=metadata or {},
            object_id=object_id,
            object_repr=object_repr,
        )
