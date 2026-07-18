"""Read-only admin API views for ActivityLog."""
from django.db.models import Q
from django.utils.dateparse import parse_datetime

from rest_framework import status
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.accounts.permissions import IsCMSUser, HasModulePermission

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class StandardResultsSetPagination(PageNumberPagination):
    """Page-number pagination with a safe maximum page size."""

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ActivityLogPermissionMixin:
    """Shared permission and module attributes for activity log endpoints."""

    permission_classes = [IsCMSUser, HasModulePermission]
    cms_module = 'activity_logs'
    cms_action = 'view'


class ActivityLogListView(ActivityLogPermissionMixin, ListAPIView):
    """
    GET /api/v1/admin/activity-logs/

    Paginated, filterable list of activity logs. Read-only.
    """

    queryset = ActivityLog.objects.order_by('-created_at')
    serializer_class = ActivityLogSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset().select_related('user')

        action = self.request.query_params.get('action')
        module = self.request.query_params.get('module')
        is_success = self.request.query_params.get('success')
        user_id = self.request.query_params.get('user')
        object_type = self.request.query_params.get('object_type')
        object_id = self.request.query_params.get('object_id')
        date_from = self.request.query_params.get('from')
        date_to = self.request.query_params.get('to')
        search = self.request.query_params.get('search')

        if action:
            qs = qs.filter(action=action)
        if module:
            qs = qs.filter(module=module)
        if object_type:
            qs = qs.filter(object_type=object_type)
        if object_id:
            qs = qs.filter(object_id=object_id)
        if is_success is not None:
            is_success_lower = is_success.strip().lower()
            if is_success_lower in ('true', '1'):
                qs = qs.filter(is_success=True)
            elif is_success_lower in ('false', '0'):
                qs = qs.filter(is_success=False)
        if user_id:
            qs = qs.filter(user_id=user_id)
        if date_from:
            parsed = parse_datetime(date_from)
            if parsed:
                qs = qs.filter(created_at__gte=parsed)
        if date_to:
            parsed = parse_datetime(date_to)
            if parsed:
                qs = qs.filter(created_at__lte=parsed)
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(object_repr__icontains=search)
                | Q(description__icontains=search)
                | Q(object_type__icontains=search)
                | Q(request_path__icontains=search)
            )

        return qs

    def post(self, request, *args, **kwargs):
        """Explicitly reject POST to keep the API append-only."""
        raise MethodNotAllowed('POST')


class ActivityLogDetailView(ActivityLogPermissionMixin, RetrieveAPIView):
    """
    GET /api/v1/admin/activity-logs/<id>/

    Single activity log detail. Read-only.
    """

    queryset = ActivityLog.objects.order_by('-created_at')
    serializer_class = ActivityLogSerializer

    def put(self, request, *args, **kwargs):
        raise MethodNotAllowed('PUT')

    def patch(self, request, *args, **kwargs):
        raise MethodNotAllowed('PATCH')

    def delete(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE')
