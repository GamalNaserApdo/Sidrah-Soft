"""Public read-only API views for the case studies CMS."""
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CaseStudy
from .serializers import CaseStudyDetailSerializer, CaseStudyListSerializer


class CaseStudyListView(APIView):
    """Return active case studies, optionally filtered."""

    permission_classes = [AllowAny]

    def get_queryset(self):
        return CaseStudy.objects.filter(
            is_active=True,
        ).select_related('partner', 'featured_image', 'logo').prefetch_related('services')

    def get(self, request):
        queryset = self.get_queryset().order_by('display_order', 'title_en')

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

        service = request.query_params.get('service')
        if service:
            queryset = queryset.filter(services__slug=service)

        partner = request.query_params.get('partner')
        if partner:
            queryset = queryset.filter(partner__slug=partner)

        industry = request.query_params.get('industry')
        if industry:
            queryset = queryset.filter(industry_en=industry)

        serializer = CaseStudyListSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)


class CaseStudyDetailView(APIView):
    """Return a single active case study by slug."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        case_study = get_object_or_404(
            CaseStudy.objects.filter(
                is_active=True,
            ).select_related('partner', 'featured_image', 'logo').prefetch_related('services'),
            slug=slug,
        )
        serializer = CaseStudyDetailSerializer(
            case_study,
            context={'request': request},
        )
        return Response(serializer.data)
