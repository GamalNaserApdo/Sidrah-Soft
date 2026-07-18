"""
Protected admin API views.

Foundation endpoint to prove auth + role-based access works.
Module CRUD will be added in later phases.
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsCMSUser
from .serializers import CMSUserSerializer


class DashboardAccessView(APIView):
    """
    GET /api/v1/admin/dashboard/access/

    Returns the authenticated user's identity and permitted modules.
    Proves that session auth + CMS role enforcement work correctly.
    """
    permission_classes = [IsCMSUser]

    def get(self, request):
        serializer = CMSUserSerializer(request.user)
        return Response({
            'access': 'granted',
            'user': serializer.data,
        })
