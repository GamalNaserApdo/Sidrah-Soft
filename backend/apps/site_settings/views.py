from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SiteSetting
from .serializers import SiteSettingSerializer


class SiteSettingsView(APIView):
    """Public endpoint that returns the current CMS-controlled site settings."""

    permission_classes = [AllowAny]

    def get(self, request):
        setting = SiteSetting.get_current()
        if not setting:
            # Return safe defaults so public pages never break when no record
            # has been created yet. The CMS can still create/overwrite them.
            setting = SiteSetting()
        serializer = SiteSettingSerializer(setting)
        return Response(serializer.data)
