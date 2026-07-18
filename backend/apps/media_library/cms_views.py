"""CMS API views for the media library app."""
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin

from .models import MediaAsset
from .cms_serializers import (
    CMSMediaListSerializer,
    CMSMediaDetailSerializer,
    CMSMediaUploadSerializer,
    CMSMediaMetadataUpdateSerializer,
    CMSMediaUsageSerializer,
)
from .services import get_asset_usage, delete_media_asset
from .validators import MediaValidationError


class CMSMediaListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/media/           → paginated list with search/filter/ordering
    POST /api/v1/cms/media/           → upload new image (multipart/form-data)
    """

    cms_module = 'media'
    pagination_class = CMSPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = MediaAsset.objects.select_related('uploaded_by').order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(alt_text__icontains=search) |
                Q(file__icontains=search)
            )

        mime_type = self.request.query_params.get('mime_type')
        if mime_type:
            qs = qs.filter(mime_type=mime_type)

        uploaded_by = self.request.query_params.get('uploaded_by')
        if uploaded_by:
            qs = qs.filter(uploaded_by_id=uploaded_by)

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = [
            'created_at', '-created_at',
            'updated_at', '-updated_at',
            'file_size', '-file_size',
            'title', '-title',
        ]
        if ordering and ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSMediaUploadSerializer
        return CMSMediaListSerializer

    def create(self, request, *args, **kwargs):
        """Override to return CMSMediaDetailSerializer after upload."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Return detail representation instead of the upload serializer's data
        detail_serializer = CMSMediaDetailSerializer(
            serializer.instance,
            context={'request': request},
        )
        headers = self.get_success_headers(detail_serializer.data)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.media.uploaded',
            metadata={
                'id': instance.id,
                'title': instance.title,
                'mime_type': instance.mime_type,
                'file_size': instance.file_size,
                'width': instance.width,
                'height': instance.height,
            },
        )


class CMSMediaDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/media/<id>/    → retrieve media detail
    PATCH  /api/v1/cms/media/<id>/    → update metadata only
    DELETE /api/v1/cms/media/<id>/    → delete (blocked if referenced)
    """

    cms_module = 'media'
    queryset = MediaAsset.objects.select_related('uploaded_by')
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return CMSMediaMetadataUpdateSerializer
        return CMSMediaDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        changed_fields = getattr(instance, '_changed_fields', [])
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.media.updated',
            metadata={
                'id': instance.id,
                'changed_fields': changed_fields,
            },
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_label = instance.title or instance.file.name or str(instance.id)
        mime_type = instance.mime_type
        file_size = instance.file_size

        try:
            delete_media_asset(instance)
        except MediaValidationError as exc:
            if exc.code == 'media_in_use':
                usage = get_asset_usage(obj_id)
                return Response(
                    {
                        'detail': 'This media asset cannot be deleted because it is currently in use.',
                        'code': 'media_in_use',
                        'usage_count': usage['usage_count'],
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            raise

        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.media.deleted',
            metadata={
                'id': obj_id,
                'title': obj_label,
                'mime_type': mime_type,
                'file_size': file_size,
            },
            object_id=str(obj_id),
            object_repr=obj_label,
        )

    def delete(self, request, *args, **kwargs):
        """Override to handle 409 conflict response from perform_destroy."""
        instance = self.get_object()
        result = self.perform_destroy(instance)
        if result is not None:
            return result
        return Response(status=status.HTTP_204_NO_CONTENT)


class CMSMediaUsageView(CMSViewMixin, APIView):
    """
    GET /api/v1/cms/media/<id>/usage/   → usage references for an asset
    """

    cms_module = 'media'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request, pk):
        # Verify the asset exists
        try:
            MediaAsset.objects.get(pk=pk)
        except MediaAsset.DoesNotExist:
            return Response(
                {'detail': 'Media asset not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        usage = get_asset_usage(int(pk))
        serializer = CMSMediaUsageSerializer(usage)
        return Response(serializer.data)
