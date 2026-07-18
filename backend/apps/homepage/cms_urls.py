"""CMS URL configuration for the homepage app."""
from django.urls import path

from .cms_views import (
    CMSHomepageSettingsView,
    CMSMarqueeItemListCreateView,
    CMSMarqueeDetailView,
    CMSMarqueeReorderView,
    CMSIndustryListCreateView,
    CMSIndustryDetailView,
    CMSIndustryReorderView,
    CMSSectionConfigListCreateView,
    CMSSectionConfigDetailView,
)

urlpatterns = [
    # Settings singleton
    path('settings/', CMSHomepageSettingsView.as_view(), name='cms-homepage-settings'),

    # Marquee items
    path('marquee/', CMSMarqueeItemListCreateView.as_view(), name='cms-marquee-list'),
    path('marquee/reorder/', CMSMarqueeReorderView.as_view(), name='cms-marquee-reorder'),
    path('marquee/<int:pk>/', CMSMarqueeDetailView.as_view(), name='cms-marquee-detail'),

    # Industries
    path('industries/', CMSIndustryListCreateView.as_view(), name='cms-industry-list'),
    path('industries/reorder/', CMSIndustryReorderView.as_view(), name='cms-industry-reorder'),
    path('industries/<int:pk>/', CMSIndustryDetailView.as_view(), name='cms-industry-detail'),

    # Section configs
    path('sections/', CMSSectionConfigListCreateView.as_view(), name='cms-section-config-list'),
    path('sections/<int:pk>/', CMSSectionConfigDetailView.as_view(), name='cms-section-config-detail'),
]
