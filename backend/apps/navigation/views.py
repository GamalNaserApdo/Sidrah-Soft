"""Public read-only API views for the navigation CMS."""
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NavigationItem, NavigationMenu
from .serializers import NavigationMenuSerializer


class NavigationMenuListView(APIView):
    """Return all active navigation menus, optionally filtered by location."""

    permission_classes = [AllowAny]

    def _visible_items(self):
        return NavigationItem.objects.filter(
            is_visible=True,
        ).select_related('icon_asset').order_by('order', 'id')

    def get_queryset(self):
        return NavigationMenu.objects.filter(is_active=True).prefetch_related(
            Prefetch(
                'items',
                queryset=self._visible_items().filter(parent=None),
                to_attr='prefetched_items',
            ),
            Prefetch(
                'items__children',
                queryset=self._visible_items(),
                to_attr='prefetched_children',
            ),
        ).order_by('location', 'order', 'name')

    def get(self, request):
        queryset = self.get_queryset()
        location = request.query_params.get('location')
        if location:
            queryset = queryset.filter(location=location)
        serializer = NavigationMenuSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)


class NavigationMenuDetailView(APIView):
    """Return a single active navigation menu by slug."""

    permission_classes = [AllowAny]

    def _visible_items(self):
        return NavigationItem.objects.filter(
            is_visible=True,
        ).select_related('icon_asset').order_by('order', 'id')

    def get(self, request, slug):
        menu = get_object_or_404(
            NavigationMenu.objects.filter(is_active=True).prefetch_related(
                Prefetch(
                    'items',
                    queryset=self._visible_items().filter(parent=None),
                    to_attr='prefetched_items',
                ),
                Prefetch(
                    'items__children',
                    queryset=self._visible_items(),
                    to_attr='prefetched_children',
                ),
            ),
            slug=slug,
        )
        serializer = NavigationMenuSerializer(
            menu,
            context={'request': request},
        )
        return Response(serializer.data)
