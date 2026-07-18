"""Public read-only API views for the insights CMS."""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import STATUS_PUBLISHED, Article
from .serializers import ArticleDetailSerializer, ArticleListSerializer


class ArticleListView(APIView):
    """Return published articles, optionally filtered."""

    permission_classes = [AllowAny]

    def get_queryset(self):
        return Article.public_qs().select_related('featured_image')

    def get(self, request):
        queryset = self.get_queryset().order_by('display_order', '-published_at', 'title_en')

        content_type = request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)

        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_en__iexact=category)

        is_featured = request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(
                is_featured=is_featured.lower() in ('true', '1', 'yes'),
            )

        show_on_homepage = request.query_params.get('show_on_homepage')
        if show_on_homepage is not None:
            queryset = queryset.filter(
                show_on_homepage=show_on_homepage.lower() in ('true', '1', 'yes'),
            )

        serializer = ArticleListSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)


class ArticleDetailView(APIView):
    """Return a single published article by slug."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        article = get_object_or_404(
            Article.public_qs().select_related('featured_image'),
            slug=slug,
        )
        serializer = ArticleDetailSerializer(
            article,
            context={'request': request},
        )
        return Response(serializer.data)
