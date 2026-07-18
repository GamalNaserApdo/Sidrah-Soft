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
            return Response(
                {'detail': 'Site settings are not configured yet.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = SiteSettingSerializer(setting)
        return Response(serializer.data)
