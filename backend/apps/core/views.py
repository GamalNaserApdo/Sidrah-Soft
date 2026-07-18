from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health_check(request):
    """Public health-check endpoint for the CMS API."""
    return Response({
        'status': 'ok',
        'service': 'SidrahSoft CMS API',
    })
