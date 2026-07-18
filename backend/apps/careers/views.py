"""Public read-only API views for the careers CMS."""
from django.db import models
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Job
from .serializers import JobDetailSerializer, JobListSerializer


class JobListView(APIView):
    """Return active, non-expired jobs, optionally filtered."""

    permission_classes = [AllowAny]

    def get_queryset(self):
        return Job.public_qs()

    def _boolean_param(self, request, name):
        value = request.query_params.get(name)
        if value is None:
            return None
        return value.lower() in ('true', '1', 'yes')

    def get(self, request):
        queryset = self.get_queryset().order_by(
            '-is_featured',
            'display_order',
            '-posted_date',
            'title_en',
        )

        is_featured = self._boolean_param(request, 'is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured)

        show_on_homepage = self._boolean_param(request, 'show_on_homepage')
        if show_on_homepage is not None:
            queryset = queryset.filter(show_on_homepage=show_on_homepage)

        employment_type = request.query_params.get('employment_type')
        if employment_type:
            queryset = queryset.filter(employment_type=employment_type)

        workplace_type = request.query_params.get('workplace_type')
        if workplace_type:
            queryset = queryset.filter(workplace_type=workplace_type)

        experience_level = request.query_params.get('experience_level')
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)

        department = request.query_params.get('department')
        if department:
            queryset = queryset.filter(
                models.Q(department_en__iexact=department)
                | models.Q(department_ar__iexact=department),
            )

        serializer = JobListSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)


class JobDetailView(APIView):
    """Return a single active, non-expired job by slug."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        job = get_object_or_404(Job.public_qs(), slug=slug)
        serializer = JobDetailSerializer(
            job,
            context={'request': request},
        )
        return Response(serializer.data)
