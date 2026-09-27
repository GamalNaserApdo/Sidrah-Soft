"""Public API views for StaticPageSEO."""
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StaticPageSEO, STATIC_PAGE_KEYS
from .static_seo_serializers import StaticPageSEOSerializer


class StaticPageSEOListView(APIView):
    """
    GET /api/v1/static-page-seo/

    Returns all static page SEO records.
    Frontend uses this to resolve CMS SEO → seo.js fallback.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        records = StaticPageSEO.objects.all()
        # Build a dict keyed by page_key for easy frontend lookup
        serializer = StaticPageSEOSerializer(records, many=True)
        data = {item['page_key']: item for item in serializer.data}
        return Response(data)


class StaticPageSEODetailView(APIView):
    """
    GET /api/v1/static-page-seo/<page_key>/

    Returns SEO for a single page key.
    """

    permission_classes = [AllowAny]

    def get(self, request, page_key=None):
        try:
            record = StaticPageSEO.objects.get(page_key=page_key)
        except StaticPageSEO.DoesNotExist:
            # Return empty defaults so the frontend can fall back to seo.js
            return Response({
                'page_key': page_key,
                'seo_title_en': '',
                'seo_title_ar': '',
                'meta_description_en': '',
                'meta_description_ar': '',
                'og_title_en': '',
                'og_title_ar': '',
                'og_description_en': '',
                'og_description_ar': '',
                'og_image_url': None,
                'robots_index': True,
                'robots_follow': True,
                'canonical_path': dict(STATIC_PAGE_KEYS).get(page_key, '/'),
            })
        serializer = StaticPageSEOSerializer(record)
        return Response(serializer.data)
