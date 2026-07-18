"""CMS API views for the contact app."""
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.activity_logs.services import log_activity
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin

from .models import InquiryType, ContactSubmission
from .cms_serializers import (
    CMSInquiryTypeSerializer,
    CMSContactSubmissionListSerializer,
    CMSContactSubmissionDetailSerializer,
    CMSContactSubmissionUpdateSerializer,
)


# ─── Inquiry Type CRUD ────────────────────────────────────────────────────────

class CMSInquiryTypeListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/contact/inquiry-types/           → paginated list
    POST /api/v1/cms/contact/inquiry-types/           → create
    """

    cms_module = 'contact'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = InquiryType.objects.all().order_by('order', 'name_en')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name_en__icontains=search) | Q(name_ar__icontains=search) | Q(slug__icontains=search))

        is_active = self.request.query_params.get('active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        return qs

    def get_serializer_class(self):
        return CMSInquiryTypeSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.inquiry_type.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'name_en': instance.name_en},
        )


class CMSInquiryTypeDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/contact/inquiry-types/<id>/    → retrieve
    PUT    /api/v1/cms/contact/inquiry-types/<id>/    → update
    PATCH  /api/v1/cms/contact/inquiry-types/<id>/    → partial update
    DELETE /api/v1/cms/contact/inquiry-types/<id>/    → safe delete
    """

    cms_module = 'contact'
    queryset = InquiryType.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSInquiryTypeSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.inquiry_type.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        submission_count = instance.submissions.count()
        if submission_count > 0:
            return Response(
                {
                    'detail': f'This inquiry type is referenced by {submission_count} submission(s) and cannot be deleted. Deactivate it instead.',
                    'code': 'conflict',
                },
                status=409,
            )
        obj_id = instance.id
        obj_name = instance.name_en
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.inquiry_type.deleted',
            metadata={'id': obj_id, 'name_en': obj_name},
            object_id=str(obj_id),
            object_repr=obj_name,
        )


# ─── Contact Submission Management ────────────────────────────────────────────

class CMSContactSubmissionListView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/contact/submissions/           → paginated list
    (POST is not supported — submissions are created via public endpoint only)
    """

    cms_module = 'contact'
    cms_action = 'view'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = ContactSubmission.objects.select_related('inquiry_type', 'assigned_to').order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(company__icontains=search)
            )

        submission_status = self.request.query_params.get('status')
        if submission_status:
            qs = qs.filter(status=submission_status)

        inquiry_type = self.request.query_params.get('inquiry_type')
        if inquiry_type:
            qs = qs.filter(inquiry_type_id=inquiry_type)

        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            qs = qs.filter(assigned_to_id=assigned_to)

        priority = self.request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)

        date_from = self.request.query_params.get('from')
        if date_from:
            qs = qs.filter(created_at__gte=date_from)

        date_to = self.request.query_params.get('to')
        if date_to:
            qs = qs.filter(created_at__lte=date_to)

        return qs

    def get_serializer_class(self):
        return CMSContactSubmissionListSerializer

    def post(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Method "POST" not allowed. Submissions are created via the public endpoint.'},
            status=405,
        )


class CMSContactSubmissionDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/contact/submissions/<id>/    → retrieve (full detail)
    PATCH  /api/v1/cms/contact/submissions/<id>/    → update management fields
    DELETE /api/v1/cms/contact/submissions/<id>/    → hard delete (spam cleanup)
    """

    cms_module = 'contact'
    queryset = ContactSubmission.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSContactSubmissionUpdateSerializer
        return CMSContactSubmissionDetailSerializer

    def put(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Method "PUT" not allowed. Use PATCH for partial updates.'},
            status=405,
        )

    def _log_lead_change(self, request, instance, old_status, old_priority, old_notes):
        """Create sanitized activity logs for specific lead field changes."""
        new_status = instance.status
        new_priority = instance.priority
        new_notes = instance.internal_notes
        user = request.user if request.user.is_authenticated else None

        if old_status != new_status:
            action_name = 'status_changed'
            if new_status == ContactSubmission.STATUS_SPAM:
                action_name = 'marked_spam'
            elif new_status == ContactSubmission.STATUS_ARCHIVED:
                action_name = 'archived'
            log_activity(
                user=user,
                action=action_name,
                module='leads',
                request=request,
                object_instance=instance,
                description=f'Lead status changed from {old_status} to {new_status}.',
                metadata={
                    'lead_id': instance.id,
                    'public_id': str(instance.public_id),
                    'field': 'status',
                    'old_value': old_status,
                    'new_value': new_status,
                },
                is_success=True,
            )

        if old_priority != new_priority:
            log_activity(
                user=user,
                action='priority_changed',
                module='leads',
                request=request,
                object_instance=instance,
                description=f'Lead priority changed from {old_priority} to {new_priority}.',
                metadata={
                    'lead_id': instance.id,
                    'public_id': str(instance.public_id),
                    'field': 'priority',
                    'old_value': old_priority,
                    'new_value': new_priority,
                },
                is_success=True,
            )

        if old_notes != new_notes:
            log_activity(
                user=user,
                action='internal_note_updated',
                module='leads',
                request=request,
                object_instance=instance,
                description='Lead internal notes updated.',
                metadata={
                    'lead_id': instance.id,
                    'public_id': str(instance.public_id),
                    'field': 'internal_notes',
                },
                is_success=True,
            )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        old_priority = instance.priority
        old_notes = instance.internal_notes
        response = super().update(request, *args, **kwargs)
        instance.refresh_from_db()
        self._log_lead_change(request, instance, old_status, old_priority, old_notes)
        return response

    def delete(self, request, *args, **kwargs):
        """Hard delete is not allowed from the Leads dashboard."""
        return Response(
            {'detail': 'Method "DELETE" not allowed. Archive or mark as spam instead.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class CMSContactSubmissionStatsView(CMSViewMixin, APIView):
    """
    GET /api/v1/cms/contact/submissions-stats/

    Return full-queryset lead counts, filtered by the same query parameters
    used on the list endpoint so the dashboard cards stay consistent.
    """

    cms_module = 'contact'
    cms_action = 'view'

    def get_permissions(self):
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def _filtered_queryset(self, request):
        qs = ContactSubmission.objects.all()

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(company__icontains=search)
            )

        submission_status = request.query_params.get('status')
        if submission_status:
            qs = qs.filter(status=submission_status)

        inquiry_type = request.query_params.get('inquiry_type')
        if inquiry_type:
            qs = qs.filter(inquiry_type_id=inquiry_type)

        priority = request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)

        assigned_to = request.query_params.get('assigned_to')
        if assigned_to:
            qs = qs.filter(assigned_to_id=assigned_to)

        date_from = request.query_params.get('from')
        if date_from:
            qs = qs.filter(created_at__gte=date_from)

        date_to = request.query_params.get('to')
        if date_to:
            qs = qs.filter(created_at__lte=date_to)

        return qs

    def get(self, request):
        qs = self._filtered_queryset(request)
        total = qs.count()
        counts = dict(qs.values('status').annotate(count=Count('status')).values_list('status', 'count'))

        return Response({
            'total': total,
            'new': counts.get(ContactSubmission.STATUS_NEW, 0),
            'contacted': counts.get(ContactSubmission.STATUS_CONTACTED, 0),
            'in_progress': counts.get(ContactSubmission.STATUS_IN_PROGRESS, 0),
            'closed': counts.get(ContactSubmission.STATUS_CLOSED, 0),
            'spam': counts.get(ContactSubmission.STATUS_SPAM, 0),
            'archived': counts.get(ContactSubmission.STATUS_ARCHIVED, 0),
        })
