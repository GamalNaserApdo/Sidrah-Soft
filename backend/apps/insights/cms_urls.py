"""CMS URL configuration for the insights app."""
from django.urls import path

from .cms_views import (
    CMSArticleListCreateView,
    CMSArticleDetailView,
    CMSArticlePublishView,
    CMSArticleUnpublishView,
    CMSArticleArchiveView,
)

urlpatterns = [
    path('', CMSArticleListCreateView.as_view(), name='cms-article-list'),
    path('<int:pk>/publish/', CMSArticlePublishView.as_view(), name='cms-article-publish'),
    path('<int:pk>/unpublish/', CMSArticleUnpublishView.as_view(), name='cms-article-unpublish'),
    path('<int:pk>/archive/', CMSArticleArchiveView.as_view(), name='cms-article-archive'),
    path('<int:pk>/', CMSArticleDetailView.as_view(), name='cms-article-detail'),
]
