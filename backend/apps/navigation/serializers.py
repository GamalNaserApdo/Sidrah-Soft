"""Serializers for the navigation CMS public API."""
from rest_framework import serializers

from .models import NavigationItem, NavigationMenu


class NavigationItemSerializer(serializers.ModelSerializer):
    """Public representation of a single navigation item, including nested children."""

    label = serializers.SerializerMethodField()
    href = serializers.CharField(read_only=True)
    children = serializers.SerializerMethodField()
    icon_asset = serializers.SerializerMethodField()

    class Meta:
        model = NavigationItem
        fields = [
            'id',
            'label',
            'href',
            'link_type',
            'open_in_new_tab',
            'icon',
            'icon_asset',
            'order',
            'children',
        ]

    def get_label(self, obj):
        return {
            'en': obj.label_en,
            'ar': obj.label_ar or obj.label_en,
        }

    def get_icon_asset(self, obj):
        if obj.icon_asset and obj.icon_asset.file:
            request = self.context.get('request')
            url = obj.icon_asset.file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_children(self, obj):
        children = getattr(obj, 'prefetched_children', None)
        if children is None:
            children = obj.children.filter(is_visible=True).select_related('icon_asset')
        return NavigationItemSerializer(
            children,
            many=True,
            context=self.context,
        ).data


class NavigationMenuSerializer(serializers.ModelSerializer):
    """Public representation of a navigation menu with its top-level items."""

    items = serializers.SerializerMethodField()

    class Meta:
        model = NavigationMenu
        fields = [
            'name',
            'slug',
            'location',
            'items',
        ]

    def get_items(self, obj):
        items = getattr(obj, 'prefetched_items', None)
        if items is None:
            items = obj.items.filter(
                parent=None,
                is_visible=True,
            ).select_related('icon_asset').prefetch_related('children')
        return NavigationItemSerializer(
            items,
            many=True,
            context=self.context,
        ).data
