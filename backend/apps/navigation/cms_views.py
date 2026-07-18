"""CMS API views for the navigation app."""
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

from .models import NavigationMenu, NavigationItem
from .cms_serializers import (
    CMSNavigationMenuSerializer,
    CMSNavigationItemListSerializer,
    CMSNavigationItemDetailSerializer,
    CMSNavigationItemWriteSerializer,
    CMSNavigationReorderSerializer,
)


# ─── Menu CRUD ────────────────────────────────────────────────────────────────

class CMSNavigationMenuListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/navigation/menus/           → paginated list
    POST /api/v1/cms/navigation/menus/           → create
    """

    cms_module = 'navigation'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = NavigationMenu.objects.all().order_by('order', 'name')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(slug__icontains=search))

        location = self.request.query_params.get('location')
        if location:
            qs = qs.filter(location=location)

        is_active = self.request.query_params.get('active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        return qs

    def get_serializer_class(self):
        return CMSNavigationMenuSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.navigation_menu.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'name': instance.name},
        )


class CMSNavigationMenuDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/navigation/menus/<id>/    → retrieve
    PUT    /api/v1/cms/navigation/menus/<id>/    → update
    PATCH  /api/v1/cms/navigation/menus/<id>/    → partial update
    DELETE /api/v1/cms/navigation/menus/<id>/    → hard delete (CASCADE items)
    """

    cms_module = 'navigation'
    queryset = NavigationMenu.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        return CMSNavigationMenuSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.navigation_menu.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_name = instance.name
        item_count = instance.items.count()
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.navigation_menu.deleted',
            metadata={'id': obj_id, 'name': obj_name, 'cascaded_items': item_count},
            object_id=str(obj_id),
            object_repr=obj_name,
        )


# ─── Item CRUD ────────────────────────────────────────────────────────────────

class CMSNavigationItemListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/navigation/items/           → paginated list
    POST /api/v1/cms/navigation/items/           → create
    """

    cms_module = 'navigation'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = NavigationItem.objects.select_related('menu', 'parent', 'icon_asset').order_by('order')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(label_en__icontains=search) | Q(label_ar__icontains=search))

        menu_id = self.request.query_params.get('menu')
        if menu_id:
            qs = qs.filter(menu_id=menu_id)

        is_visible = self.request.query_params.get('visible')
        if is_visible is not None:
            qs = qs.filter(is_visible=is_visible.lower() == 'true')

        link_type = self.request.query_params.get('link_type')
        if link_type:
            qs = qs.filter(link_type=link_type)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSNavigationItemWriteSerializer
        return CMSNavigationItemListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.navigation_item.created',
            metadata={'id': instance.id, 'label_en': instance.label_en, 'menu_id': instance.menu_id},
        )


class CMSNavigationItemDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/navigation/items/<id>/    → retrieve
    PUT    /api/v1/cms/navigation/items/<id>/    → update
    PATCH  /api/v1/cms/navigation/items/<id>/    → partial update
    DELETE /api/v1/cms/navigation/items/<id>/    → hard delete (CASCADE children)
    """

    cms_module = 'navigation'
    queryset = NavigationItem.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSNavigationItemWriteSerializer
        return CMSNavigationItemDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.navigation_item.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_label = instance.label_en
        child_count = instance.children.count()
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.navigation_item.deleted',
            metadata={'id': obj_id, 'label_en': obj_label, 'cascaded_children': child_count},
            object_id=str(obj_id),
            object_repr=obj_label,
        )


# ─── Reorder ──────────────────────────────────────────────────────────────────

class CMSNavigationReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/navigation/reorder/   → bulk reorder items within a menu
    """

    cms_module = 'navigation'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        serializer = CMSNavigationReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        menu_id = data['menu_id']
        items = data['items']

        # Validate menu exists
        try:
            menu = NavigationMenu.objects.get(id=menu_id)
        except NavigationMenu.DoesNotExist:
            return Response(
                {'detail': f'Menu {menu_id} does not exist.', 'code': 'invalid_menu'},
                status=400,
            )

        ids = [item['id'] for item in items]
        existing = NavigationItem.objects.filter(id__in=ids, menu_id=menu_id)
        existing_ids = set(existing.values_list('id', flat=True))

        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown or cross-menu item IDs: {sorted(missing)}',
                 'code': 'invalid_ids'},
                status=400,
            )

        order_map = {item['id']: item['order'] for item in items}

        with transaction.atomic():
            for nav_item in existing:
                new_order = order_map.get(nav_item.id)
                if new_order is not None and nav_item.order != new_order:
                    nav_item.order = new_order
                    nav_item.save(update_fields=['order'])

        self.log_cms_action(
            request, 'reorder', instance=None,
            description='cms.navigation.reordered',
            metadata={'menu_id': menu_id, 'affected_count': len(ids), 'ids': ids},
        )

        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})
