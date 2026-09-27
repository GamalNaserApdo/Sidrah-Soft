"""CMS API views for StaticPageSEO."""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_permissions import CMSViewMixin

from .models import StaticPageSEO, STATIC_PAGE_KEYS, STATIC_PAGE_KEY_VALUES, STATIC_PAGE_CANONICAL_PATHS
from .cms_static_seo_serializers import CMSStaticPageSEOSerializer


class CMSStaticPageSEOListView(CMSViewMixin, APIView):
    """
    GET /api/v1/cms/static-page-seo/

    Returns all static page SEO records plus the list of valid page keys
    so the CMS UI can show which pages are available for editing.
    """

    cms_module = 'site_settings'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        records = StaticPageSEO.objects.all()
        existing_keys = {r.page_key for r in records}
        serializer = CMSStaticPageSEOSerializer(records, many=True, context={'request': request})
        # Include the full list of valid page keys and which ones have records
        page_keys = [
            {
                'page_key': key,
                'display_name': label,
                'has_record': key in existing_keys,
                'canonical_path': STATIC_PAGE_CANONICAL_PATHS.get(key, '/'),
            }
            for key, label in STATIC_PAGE_KEYS
        ]
        return Response({
            'page_keys': page_keys,
            'records': serializer.data,
        })


class CMSStaticPageSEODetailView(CMSViewMixin, APIView):
    """
    GET/PUT /api/v1/cms/static-page-seo/<page_key>/

    Retrieve or update SEO for a specific page key.
    If no record exists for the page key, GET returns empty defaults
    and PUT creates the record (page_key is read-only after creation).
    """

    cms_module = 'site_settings'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request, page_key=None):
        if page_key not in STATIC_PAGE_KEY_VALUES:
            return Response({'detail': 'Invalid page key.'}, status=400)
        try:
            record = StaticPageSEO.objects.get(page_key=page_key)
        except StaticPageSEO.DoesNotExist:
            # Return empty defaults
            return Response({
                'id': None,
                'page_key': page_key,
                'seo_title_en': '',
                'seo_title_ar': '',
                'meta_description_en': '',
                'meta_description_ar': '',
                'og_title_en': '',
                'og_title_ar': '',
                'og_description_en': '',
                'og_description_ar': '',
                'og_image': None,
                'og_image_id': None,
                'robots_index': True,
                'robots_follow': True,
                'canonical_path': STATIC_PAGE_CANONICAL_PATHS.get(page_key, '/'),
                'created_at': None,
                'updated_at': None,
            })
        serializer = CMSStaticPageSEOSerializer(record, context={'request': request})
        return Response(serializer.data)

    def put(self, request, page_key=None):
        self.cms_action = 'update'
        if page_key not in STATIC_PAGE_KEY_VALUES:
            return Response({'detail': 'Invalid page key.'}, status=400)
        try:
            record = StaticPageSEO.objects.get(page_key=page_key)
            serializer = CMSStaticPageSEOSerializer(
                record, data=request.data, partial=True, context={'request': request}
            )
        except StaticPageSEO.DoesNotExist:
            # Create new record with the given page_key
            # page_key is read-only in the serializer, so we pass it to save()
            serializer = CMSStaticPageSEOSerializer(
                data=request.data, context={'request': request}
            )
        serializer.is_valid(raise_exception=True)
        record = serializer.save(page_key=page_key)
        self.log_cms_action(
            request, 'seo_change', instance=record,
            description=f'cms.static_seo.seo_change:{page_key}',
            metadata={'changed_fields': list(request.data.keys())},
        )
        return Response(serializer.data)
