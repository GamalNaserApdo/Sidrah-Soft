"""CMS URL configuration for the partners app."""
from django.urls import path

from .cms_views import (
    CMSPartnerListCreateView,
    CMSPartnerDetailView,
    CMSPartnerReorderView,
)

urlpatterns = [
    path('', CMSPartnerListCreateView.as_view(), name='cms-partner-list'),
    path('reorder/', CMSPartnerReorderView.as_view(), name='cms-partner-reorder'),
    path('<int:pk>/', CMSPartnerDetailView.as_view(), name='cms-partner-detail'),
]
