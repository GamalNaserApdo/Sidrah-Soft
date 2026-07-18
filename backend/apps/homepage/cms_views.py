"""CMS API views for the homepage app."""
from django.db import transaction
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin
from apps.core.cms_serializers import ReorderSerializer

from .models import HomepageSettings, MarqueeItem, Industry, HomepageSectionConfig
from .cms_serializers import (
    CMSHomepageSettingsSerializer,
    CMSMarqueeItemSerializer,
    CMSIndustrySerializer,
    CMSHomepageSectionConfigSerializer,
)


# ---------------------------------------------------------------------------
# Homepage Settings — singleton GET/PUT
# ---------------------------------------------------------------------------

class CMSHomepageSettingsView(CMSViewMixin, APIView):
    """
    GET/PUT /api/v1/cms/homepage/settings/
    """

    cms_module = 'site_settings'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        setting = HomepageSettings.get_current()
        if not setting:
            return Response({'detail': 'Homepage settings are not configured yet.'}, status=404)
        serializer = CMSHomepageSettingsSerializer(setting, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        self.cms_action = 'update'
        setting = HomepageSettings.get_current()
        if not setting:
            setting = HomepageSettings.objects.create(is_active=True)
        serializer = CMSHomepageSettingsSerializer(
            setting, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.log_cms_action(
            request, 'settings_change', instance=setting,
            description='cms.homepage.settings_change',
            metadata={'changed_fields': list(request.data.keys())},
        )
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Marquee Items — list/create + detail CRUD
# ---------------------------------------------------------------------------

class CMSMarqueeItemListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/homepage/marquee/        → list
    POST /api/v1/cms/homepage/marquee/        → create
    """

    cms_module = 'site_settings'
    pagination_class = CMSPagination
    queryset = MarqueeItem.objects.all().order_by('display_order', 'id')

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSMarqueeItemSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.homepage.marquee_created',
            metadata={'id': instance.id},
        )


class CMSMarqueeDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/cms/homepage/marquee/<id>/
    """

    cms_module = 'site_settings'
    queryset = MarqueeItem.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSMarqueeItemSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.homepage.marquee_updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.homepage.marquee_deleted',
            metadata={'id': obj_id},
        )


class CMSMarqueeReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/homepage/marquee/reorder/
    """

    cms_module = 'site_settings'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']
        ids = [item['id'] for item in items]
        existing = MarqueeItem.objects.filter(id__in=ids)
        existing_ids = set(existing.values_list('id', flat=True))
        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown marquee item IDs: {sorted(missing)}', 'code': 'invalid_ids'},
                status=400,
            )
        order_map = {item['id']: item['order'] for item in items}
        with transaction.atomic():
            for item in existing:
                new_order = order_map.get(item.id)
                if new_order is not None and item.display_order != new_order:
                    item.display_order = new_order
                    item.save(update_fields=['display_order'])
        self.log_cms_action(
            request, 'reorder', instance=None,
            description='cms.homepage.marquee_reordered',
            metadata={'affected_count': len(ids)},
        )
        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})


# ---------------------------------------------------------------------------
# Industries — list/create + detail CRUD
# ---------------------------------------------------------------------------

class CMSIndustryListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/homepage/industries/      → list
    POST /api/v1/cms/homepage/industries/      → create
    """

    cms_module = 'site_settings'
    pagination_class = CMSPagination
    queryset = Industry.objects.all().order_by('display_order', 'id')

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSIndustrySerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.homepage.industry_created',
            metadata={'id': instance.id},
        )


class CMSIndustryDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/cms/homepage/industries/<id>/
    """

    cms_module = 'site_settings'
    queryset = Industry.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSIndustrySerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.homepage.industry_updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.homepage.industry_deleted',
            metadata={'id': obj_id},
        )


class CMSIndustryReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/homepage/industries/reorder/
    """

    cms_module = 'site_settings'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']
        ids = [item['id'] for item in items]
        existing = Industry.objects.filter(id__in=ids)
        existing_ids = set(existing.values_list('id', flat=True))
        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown industry IDs: {sorted(missing)}', 'code': 'invalid_ids'},
                status=400,
            )
        order_map = {item['id']: item['order'] for item in items}
        with transaction.atomic():
            for item in existing:
                new_order = order_map.get(item.id)
                if new_order is not None and item.display_order != new_order:
                    item.display_order = new_order
                    item.save(update_fields=['display_order'])
        self.log_cms_action(
            request, 'reorder', instance=None,
            description='cms.homepage.industry_reordered',
            metadata={'affected_count': len(ids)},
        )
        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})


# ---------------------------------------------------------------------------
# Section Config — list + detail update
# ---------------------------------------------------------------------------

class CMSSectionConfigListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/homepage/sections/        → list
    POST /api/v1/cms/homepage/sections/        → create (section_key must be in allowlist)
    """

    cms_module = 'site_settings'
    queryset = HomepageSectionConfig.objects.all().order_by('display_order', 'id')

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSHomepageSectionConfigSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.homepage.section_config_created',
            metadata={'id': instance.id, 'section_key': instance.section_key},
        )


class CMSSectionConfigDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/cms/homepage/sections/<id>/
    """

    cms_module = 'site_settings'
    queryset = HomepageSectionConfig.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSHomepageSectionConfigSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.homepage.section_config_updated',
            metadata={'id': instance.id, 'section_key': instance.section_key, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        from rest_framework.exceptions import MethodNotAllowed
        raise MethodNotAllowed('DELETE', detail='Section configuration records cannot be deleted. Use visibility toggle instead.')
