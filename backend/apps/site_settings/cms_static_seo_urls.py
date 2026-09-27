"""CMS URL configuration for StaticPageSEO."""
from django.urls import path

from .cms_static_seo_views import CMSStaticPageSEOListView, CMSStaticPageSEODetailView

urlpatterns = [
    path('', CMSStaticPageSEOListView.as_view(), name='cms-static-page-seo-list'),
    path('<str:page_key>/', CMSStaticPageSEODetailView.as_view(), name='cms-static-page-seo-detail'),
]
