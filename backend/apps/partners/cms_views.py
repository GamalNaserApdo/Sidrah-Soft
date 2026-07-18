"""CMS API views for the partners app."""
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

from .models import Partner
from .cms_serializers import (
    CMSPartnerListSerializer,
    CMSPartnerDetailSerializer,
    CMSPartnerWriteSerializer,
)


class CMSPartnerListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/partners/           → paginated list (all partners)
    POST /api/v1/cms/partners/           → create new partner
    """

    cms_module = 'partners'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = Partner.objects.all().order_by('display_order', 'name_en')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name_en__icontains=search) |
                Q(name_ar__icontains=search) |
                Q(slug__icontains=search)
            )

        partner_type = self.request.query_params.get('partner_type')
        if partner_type:
            qs = qs.filter(partner_type=partner_type)

        is_active = self.request.query_params.get('active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        is_featured = self.request.query_params.get('featured')
        if is_featured is not None:
            qs = qs.filter(is_featured=is_featured.lower() == 'true')

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = ['display_order', '-display_order', 'name_en', '-name_en',
                           'created_at', '-created_at']
        if ordering and ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSPartnerWriteSerializer
        return CMSPartnerListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description=f'cms.partner.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'name_en': instance.name_en},
        )


class CMSPartnerDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/partners/<id>/    → retrieve
    PUT    /api/v1/cms/partners/<id>/    → full update
    PATCH  /api/v1/cms/partners/<id>/    → partial update
    DELETE /api/v1/cms/partners/<id>/    → hard delete
    """

    cms_module = 'partners'
    queryset = Partner.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSPartnerWriteSerializer
        return CMSPartnerDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description=f'cms.partner.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_name = instance.name_en
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description=f'cms.partner.deleted',
            metadata={'id': obj_id, 'name_en': obj_name},
            object_id=str(obj_id),
            object_repr=obj_name,
        )


class CMSPartnerReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/partners/reorder/   → bulk reorder partners
    """

    cms_module = 'partners'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']

        ids = [item['id'] for item in items]
        existing = Partner.objects.filter(id__in=ids)
        existing_ids = set(existing.values_list('id', flat=True))

        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown partner IDs: {sorted(missing)}',
                 'code': 'invalid_ids'},
                status=400,
            )

        order_map = {item['id']: item['order'] for item in items}

        with transaction.atomic():
            for partner in existing:
                new_order = order_map.get(partner.id)
                if new_order is not None and partner.display_order != new_order:
                    partner.display_order = new_order
                    partner.save(update_fields=['display_order'])

        self.log_cms_action(
            request, 'reorder', instance=None,
            description='cms.partner.reordered',
            metadata={'affected_count': len(ids), 'ids': ids},
        )

        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})
