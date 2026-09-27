"""Public API views for the AI Automation page."""
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AIAutomationPage
from .serializers import PublicAIAutomationPageSerializer


class AIAutomationView(APIView):
    """
    GET /api/v1/ai-automation/

    Returns the full AI Automation page content in a single response.
    No sensitive data is exposed — only presentation data.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        page = AIAutomationPage.get_current()
        serializer = PublicAIAutomationPageSerializer(page, context={'request': request})
        return Response(serializer.data)
