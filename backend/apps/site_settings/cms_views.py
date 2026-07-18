"""CMS API views for the site_settings app."""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_permissions import CMSViewMixin
from apps.core.cms_serializers import MediaAssetReferenceSerializer

from .models import SiteSetting
from .cms_serializers import CMSSiteSettingSerializer


class CMSSiteSettingView(CMSViewMixin, APIView):
    """
    GET/PUT /api/v1/cms/site-settings/

    Singleton endpoint — only one active SiteSetting record exists.
    GET returns the current active settings; PUT updates them.
    """

    cms_module = 'site_settings'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        setting = SiteSetting.get_current()
        if not setting:
            return Response(
                {'detail': 'Site settings are not configured yet.'},
                status=404,
            )
        serializer = CMSSiteSettingSerializer(setting, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        self.cms_action = 'update'
        setting = SiteSetting.get_current()
        if not setting:
            return Response(
                {'detail': 'Site settings are not configured yet.'},
                status=404,
            )
        serializer = CMSSiteSettingSerializer(
            setting, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.log_cms_action(
            request, 'settings_change', instance=setting,
            description=f'cms.site_settings.settings_change',
            metadata={'changed_fields': list(request.data.keys())},
        )
        return Response(serializer.data)
