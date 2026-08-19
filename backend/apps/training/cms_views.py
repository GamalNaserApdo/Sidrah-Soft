"""CMS API views for the Training & Education module."""
from django.db import transaction
from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin
from apps.core.cms_serializers import ReorderSerializer

from .models import Program
from .cms_serializers import (
    CMSProgramListSerializer,
    CMSProgramDetailSerializer,
    CMSProgramWriteSerializer,
)


class CMSProgramListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/training/           -> paginated list (all programs)
    POST /api/v1/cms/training/           -> create new program
    """

    cms_module = 'training'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = Program.objects.all().order_by('display_order', 'title_en')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title_en__icontains=search) |
                Q(title_ar__icontains=search) |
                Q(slug__icontains=search)
            )

        branch = self.request.query_params.get('branch')
        if branch and branch in dict(Program.BRANCH_CHOICES):
            qs = qs.filter(branch=branch)

        status = self.request.query_params.get('status')
        if status and status in dict(Program.STATUS_CHOICES):
            qs = qs.filter(status=status)

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = [
            'display_order', '-display_order',
            'title_en', '-title_en',
            'created_at', '-created_at',
        ]
        if ordering and ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSProgramWriteSerializer
        return CMSProgramListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'title_en': instance.title_en},
        )


class CMSProgramDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/training/<id>/    -> retrieve
    PUT    /api/v1/cms/training/<id>/    -> full update
    PATCH  /api/v1/cms/training/<id>/    -> partial update
    DELETE /api/v1/cms/training/<id>/    -> hard delete
    """

    cms_module = 'training'
    queryset = Program.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSProgramWriteSerializer
        return CMSProgramDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.training.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_title = instance.title_en
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training.deleted',
            metadata={'id': obj_id, 'title_en': obj_title},
            object_id=str(obj_id),
            object_repr=obj_title,
        )


class CMSProgramReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/training/reorder/   -> bulk reorder programs
    """

    cms_module = 'training'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']

        ids = [item['id'] for item in items]
        existing = Program.objects.filter(id__in=ids)
        existing_ids = set(existing.values_list('id', flat=True))

        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown program IDs: {sorted(missing)}', 'code': 'invalid_ids'},
                status=400,
            )

        order_map = {item['id']: item['order'] for item in items}

        with transaction.atomic():
            for program in existing:
                new_order = order_map.get(program.id)
                if new_order is not None and program.display_order != new_order:
                    program.display_order = new_order
                    program.save(update_fields=['display_order'])

        self.log_cms_action(
            request, 'update', instance=None,
            description='cms.training.reordered',
            metadata={'affected_count': len(ids), 'ids': ids},
        )

        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})
