"""CMS API views for the case_studies app."""
from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin
from apps.core.cms_serializers import ReorderSerializer

from .models import CaseStudy
from .cms_serializers import (
    CMSCaseStudyListSerializer,
    CMSCaseStudyDetailSerializer,
    CMSCaseStudyWriteSerializer,
)


class CMSCaseStudyListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/case-studies/           → paginated list
    POST /api/v1/cms/case-studies/           → create
    """

    cms_module = 'case_studies'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = CaseStudy.objects.select_related('partner').order_by('display_order', 'title_en')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title_en__icontains=search) |
                Q(title_ar__icontains=search) |
                Q(slug__icontains=search)
            )

        is_active = self.request.query_params.get('active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        is_featured = self.request.query_params.get('featured')
        if is_featured is not None:
            qs = qs.filter(is_featured=is_featured.lower() == 'true')

        on_homepage = self.request.query_params.get('homepage')
        if on_homepage is not None:
            qs = qs.filter(show_on_homepage=on_homepage.lower() == 'true')

        partner = self.request.query_params.get('partner')
        if partner:
            qs = qs.filter(partner_id=partner)

        industry = self.request.query_params.get('industry')
        if industry:
            qs = qs.filter(industry_en__iexact=industry)

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = ['display_order', '-display_order', 'title_en', '-title_en',
                           'created_at', '-created_at']
        if ordering and ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSCaseStudyWriteSerializer
        return CMSCaseStudyListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.case_study.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'title_en': instance.title_en},
        )


class CMSCaseStudyDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/case-studies/<id>/    → retrieve
    PUT    /api/v1/cms/case-studies/<id>/    → full update
    PATCH  /api/v1/cms/case-studies/<id>/    → partial update
    DELETE /api/v1/cms/case-studies/<id>/    → hard delete
    """

    cms_module = 'case_studies'
    queryset = CaseStudy.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSCaseStudyWriteSerializer
        return CMSCaseStudyDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.case_study.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_title = instance.title_en
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.case_study.deleted',
            metadata={'id': obj_id, 'title_en': obj_title},
            object_id=str(obj_id),
            object_repr=obj_title,
        )


class CMSCaseStudyReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/case-studies/reorder/   → bulk reorder case studies
    """

    cms_module = 'case_studies'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']

        ids = [item['id'] for item in items]
        existing = CaseStudy.objects.filter(id__in=ids)
        existing_ids = set(existing.values_list('id', flat=True))

        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown case study IDs: {sorted(missing)}',
                 'code': 'invalid_ids'},
                status=400,
            )

        order_map = {item['id']: item['order'] for item in items}

        with transaction.atomic():
            for cs in existing:
                new_order = order_map.get(cs.id)
                if new_order is not None and cs.display_order != new_order:
                    cs.display_order = new_order
                    cs.save(update_fields=['display_order'])

        self.log_cms_action(
            request, 'reorder', instance=None,
            description='cms.case_study.reordered',
            metadata={'affected_count': len(ids), 'ids': ids},
        )

        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})
