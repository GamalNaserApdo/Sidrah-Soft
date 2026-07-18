"""Public read-only API views for the services CMS."""
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Service
from .serializers import ServiceSerializer


class ServiceListView(APIView):
    """Return all active services, optionally filtered."""

    permission_classes = [AllowAny]

    def get_queryset(self):
        return Service.objects.filter(
            is_active=True,
        ).select_related('icon', 'featured_image')

    def get(self, request):
        queryset = self.get_queryset().order_by('display_order', 'name_en')

        is_featured = request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(
                is_featured=is_featured.lower() in ('true', '1', 'yes'),
            )

        show_on_homepage = request.query_params.get('show_on_homepage')
        if show_on_homepage is not None:
            queryset = queryset.filter(
                show_on_homepage=show_on_homepage.lower() in ('true', '1', 'yes'),
            )

        serializer = ServiceSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)


class ServiceDetailView(APIView):
    """Return a single active service by slug."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        service = get_object_or_404(
            Service.objects.filter(
                is_active=True,
            ).select_related('icon', 'featured_image'),
            slug=slug,
        )
        serializer = ServiceSerializer(
            service,
            context={'request': request},
        )
        return Response(serializer.data)
