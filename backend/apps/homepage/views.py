"""Public API views for the homepage app."""
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HomepageSettings
from .serializers import PublicHomepageSerializer


class HomepageView(APIView):
    """
    GET /api/v1/homepage/

    Returns the full homepage configuration in a single response.
    No sensitive data is exposed — only presentation data.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        settings = HomepageSettings.get_current()
        serializer = PublicHomepageSerializer(settings, context={'request': request})
        return Response(serializer.data)
