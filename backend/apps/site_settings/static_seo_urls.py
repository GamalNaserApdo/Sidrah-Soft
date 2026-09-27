"""Public URL configuration for StaticPageSEO."""
from django.urls import path

from .static_seo_views import StaticPageSEOListView, StaticPageSEODetailView

app_name = 'site_settings_static_seo'

urlpatterns = [
    path('static-page-seo/', StaticPageSEOListView.as_view(), name='static-page-seo-list'),
    path('static-page-seo/<str:page_key>/', StaticPageSEODetailView.as_view(), name='static-page-seo-detail'),
]
