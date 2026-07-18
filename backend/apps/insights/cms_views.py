"""CMS API views for the insights app."""
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin

from .models import Article, STATUS_DRAFT, STATUS_PUBLISHED, STATUS_ARCHIVED
from .cms_serializers import (
    CMSArticleListSerializer,
    CMSArticleDetailSerializer,
    CMSArticleWriteSerializer,
)


class CMSArticleListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/insights/           → paginated list (ALL statuses)
    POST /api/v1/cms/insights/           → create (default status=draft)
    """

    cms_module = 'insights'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = Article.objects.all().order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title_en__icontains=search) |
                Q(title_ar__icontains=search) |
                Q(slug__icontains=search) |
                Q(category_en__icontains=search) |
                Q(category_ar__icontains=search)
            )

        article_status = self.request.query_params.get('status')
        if article_status:
            qs = qs.filter(status=article_status)

        content_type = self.request.query_params.get('content_type')
        if content_type:
            qs = qs.filter(content_type=content_type)

        is_featured = self.request.query_params.get('featured')
        if is_featured is not None:
            qs = qs.filter(is_featured=is_featured.lower() == 'true')

        on_homepage = self.request.query_params.get('homepage')
        if on_homepage is not None:
            qs = qs.filter(show_on_homepage=on_homepage.lower() == 'true')

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = ['display_order', '-display_order', 'published_at', '-published_at',
                           'created_at', '-created_at']
        if ordering and ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSArticleWriteSerializer
        return CMSArticleListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.article.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'title_en': instance.title_en,
                      'status': instance.status},
        )


class CMSArticleDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/insights/<id>/    → retrieve (any status)
    PUT    /api/v1/cms/insights/<id>/    → full update
    PATCH  /api/v1/cms/insights/<id>/    → partial update
    DELETE /api/v1/cms/insights/<id>/    → hard delete
    """

    cms_module = 'insights'
    queryset = Article.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSArticleWriteSerializer
        return CMSArticleDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.article.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_title = instance.title_en
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.article.deleted',
            metadata={'id': obj_id, 'title_en': obj_title},
            object_id=str(obj_id),
            object_repr=obj_title,
        )


class CMSArticleWorkflowView(CMSViewMixin, APIView):
    """
    Base class for article workflow actions (publish/unpublish/archive).

    Subclasses set ``target_status`` and ``action_name``.
    """

    cms_module = 'insights'
    cms_action = 'publish'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    target_status = None
    action_name = None
    valid_transitions = {}

    def post(self, request, pk):
        try:
            article = Article.objects.get(pk=pk)
        except Article.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        current_status = article.status
        allowed = self.valid_transitions.get(current_status, set())

        if self.target_status not in allowed:
            return Response(
                {
                    'detail': f'Cannot {self.action_name} an article with status "{current_status}".',
                    'code': 'invalid_transition',
                },
                status=400,
            )

        previous_status = article.status
        article.status = self.target_status

        if self.target_status == STATUS_PUBLISHED and not article.published_at:
            article.published_at = timezone.now()

        if self.target_status == STATUS_DRAFT:
            article.published_at = None

        article.save(update_fields=['status', 'published_at'])

        self.log_cms_action(
            request, self.action_name, instance=article,
            description=f'cms.article.{self.action_name}',
            metadata={
                'id': article.id,
                'slug': article.slug,
                'title_en': article.title_en,
                'previous_status': previous_status,
                'new_status': article.status,
            },
        )

        serializer = CMSArticleDetailSerializer(article, context={'request': request})
        return Response(serializer.data)


class CMSArticlePublishView(CMSArticleWorkflowView):
    """POST /api/v1/cms/insights/<id>/publish/"""
    target_status = STATUS_PUBLISHED
    action_name = 'publish'
    valid_transitions = {
        STATUS_DRAFT: {STATUS_PUBLISHED},
        STATUS_ARCHIVED: {STATUS_PUBLISHED},
        STATUS_PUBLISHED: set(),
    }


class CMSArticleUnpublishView(CMSArticleWorkflowView):
    """POST /api/v1/cms/insights/<id>/unpublish/"""
    target_status = STATUS_DRAFT
    action_name = 'unpublish'
    valid_transitions = {
        STATUS_PUBLISHED: {STATUS_DRAFT},
        STATUS_DRAFT: set(),
        STATUS_ARCHIVED: set(),
    }


class CMSArticleArchiveView(CMSArticleWorkflowView):
    """POST /api/v1/cms/insights/<id>/archive/"""
    target_status = STATUS_ARCHIVED
    action_name = 'archive'
    valid_transitions = {
        STATUS_PUBLISHED: {STATUS_ARCHIVED},
        STATUS_DRAFT: {STATUS_ARCHIVED},
        STATUS_ARCHIVED: set(),
    }
