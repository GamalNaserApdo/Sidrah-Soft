"""CMS serializers for the navigation app."""
from rest_framework import serializers

from apps.core.cms_serializers import MediaAssetReferenceSerializer, media_asset_field

from .models import NavigationMenu, NavigationItem


class CMSNavigationMenuSerializer(serializers.ModelSerializer):
    """Full CMS serializer for navigation menus (read + write)."""

    item_count = serializers.SerializerMethodField()

    class Meta:
        model = NavigationMenu
        fields = [
            'id', 'name', 'slug', 'location',
            'description', 'order', 'is_active',
            'item_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'item_count']

    def get_item_count(self, obj):
        return obj.items.count()


class CMSNavigationItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for navigation item list."""

    menu_name = serializers.SerializerMethodField()
    parent_label = serializers.SerializerMethodField()

    class Meta:
        model = NavigationItem
        fields = [
            'id', 'menu', 'menu_name', 'parent', 'parent_label',
            'label_en', 'label_ar',
            'link_type', 'url', 'route_name', 'anchor', 'email', 'phone',
            'order', 'open_in_new_tab', 'icon', 'icon_asset',
            'is_visible',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'menu_name', 'parent_label']

    def get_menu_name(self, obj):
        return obj.menu.name if obj.menu else None

    def get_parent_label(self, obj):
        if obj.parent:
            return obj.parent.label_en or obj.parent.label_ar
        return None


class CMSNavigationItemDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for navigation item retrieve."""

    menu_name = serializers.SerializerMethodField()
    icon_asset = MediaAssetReferenceSerializer(read_only=True)

    class Meta:
        model = NavigationItem
        fields = [
            'id', 'menu', 'menu_name', 'parent',
            'label_en', 'label_ar',
            'link_type', 'url', 'route_name', 'anchor', 'email', 'phone',
            'order', 'open_in_new_tab', 'icon', 'icon_asset',
            'is_visible',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'menu_name']

    def get_menu_name(self, obj):
        return obj.menu.name if obj.menu else None


class CMSNavigationItemWriteSerializer(serializers.ModelSerializer):
    """Write serializer for navigation item create/update."""

    icon_asset = media_asset_field()

    class Meta:
        model = NavigationItem
        fields = [
            'menu', 'parent',
            'label_en', 'label_ar',
            'link_type', 'url', 'route_name', 'anchor', 'email', 'phone',
            'order', 'open_in_new_tab', 'icon', 'icon_asset',
            'is_visible',
        ]

    def validate(self, attrs):
        """Validate parent-child relationships."""
        menu = attrs.get('menu', getattr(self.instance, 'menu', None))
        parent = attrs.get('parent', getattr(self.instance, 'parent', None))

        if parent:
            if self.instance and parent.id == self.instance.id:
                raise serializers.ValidationError({
                    'parent': 'An item cannot be its own parent.'
                })

            if parent.menu_id != menu.id:
                raise serializers.ValidationError({
                    'parent': 'Parent item must belong to the same menu.'
                })

            if parent.parent_id is not None:
                raise serializers.ValidationError({
                    'parent': 'Maximum nesting depth is 2 levels. This parent already has a parent.'
                })

        return attrs


class CMSNavigationReorderSerializer(serializers.Serializer):
    """Reorder serializer for navigation items within a single menu."""

    menu_id = serializers.IntegerField()
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_items(self, value):
        ids = [item.get('id') for item in value]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError('Duplicate IDs are not allowed.')
        for item in value:
            if 'id' not in item or 'order' not in item:
                raise serializers.ValidationError('Each item must have "id" and "order".')
        return value
