"""Shared CMS serializer helpers for admin API serializers."""
from rest_framework import serializers

from apps.media_library.models import MediaAsset


class MediaAssetReferenceSerializer(serializers.ModelSerializer):
    """Read-only nested representation of a MediaAsset for CMS responses."""

    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ['id', 'url', 'alt_text', 'title', 'media_type']
        read_only_fields = fields

    def get_url(self, obj):
        if obj and obj.file:
            request = self.context.get('request')
            url = obj.file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None


def media_asset_field(field_name=None):
    """
    Return a PrimaryKeyRelatedField configured for a MediaAsset FK.

    Usage in a serializer::

        logo = media_asset_field('logo')

    When ``field_name`` is provided and differs from the serializer field
    name (e.g. ``default_og_image_id = media_asset_field('default_og_image')``),
    ``source`` is set so DRF maps the input to the correct model attribute.
    When ``field_name`` is ``None``, no ``source`` is set and the serializer
    field name is used as-is.
    """
    kwargs = dict(
        queryset=MediaAsset.objects.filter(is_active=True),
        required=False,
        allow_null=True,
        write_only=True,
    )
    if field_name is not None:
        kwargs['source'] = field_name
    return serializers.PrimaryKeyRelatedField(**kwargs)


class ReorderItemSerializer(serializers.Serializer):
    """Single item in a bulk reorder request."""

    id = serializers.IntegerField()
    order = serializers.IntegerField(min_value=0)


class ReorderSerializer(serializers.Serializer):
    """Bulk reorder request accepting a list of {id, order} pairs."""

    items = ReorderItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('At least one item is required.')
        ids = [item['id'] for item in value]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError('Duplicate IDs are not allowed.')
        return value
