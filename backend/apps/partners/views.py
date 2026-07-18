"""Public read-only API views for the partners CMS."""
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Partner
from .serializers import PartnerSerializer


class PartnerListView(APIView):
    """Return all active partners, optionally filtered."""

    permission_classes = [AllowAny]

    def get_queryset(self):
        return Partner.objects.filter(is_active=True).select_related('logo')

    def get(self, request):
        queryset = self.get_queryset().order_by('display_order', 'name_en')

        partner_type = request.query_params.get('partner_type')
        if partner_type:
            queryset = queryset.filter(partner_type=partner_type)

        is_featured = request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() in ('true', '1', 'yes'))

        serializer = PartnerSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)


class PartnerDetailView(APIView):
    """Return a single active partner by slug."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        partner = get_object_or_404(
            Partner.objects.filter(is_active=True).select_related('logo'),
            slug=slug,
        )
        serializer = PartnerSerializer(
            partner,
            context={'request': request},
        )
        return Response(serializer.data)
