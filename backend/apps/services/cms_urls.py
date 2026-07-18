"""CMS URL configuration for the services app."""
from django.urls import path

from .cms_views import (
    CMSServiceListCreateView,
    CMSServiceDetailView,
    CMSServiceReorderView,
)

urlpatterns = [
    path('', CMSServiceListCreateView.as_view(), name='cms-service-list'),
    path('reorder/', CMSServiceReorderView.as_view(), name='cms-service-reorder'),
    path('<int:pk>/', CMSServiceDetailView.as_view(), name='cms-service-detail'),
]
