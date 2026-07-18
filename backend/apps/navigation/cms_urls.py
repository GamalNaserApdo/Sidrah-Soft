"""CMS URL configuration for the navigation app."""
from django.urls import path

from .cms_views import (
    CMSNavigationMenuListCreateView,
    CMSNavigationMenuDetailView,
    CMSNavigationItemListCreateView,
    CMSNavigationItemDetailView,
    CMSNavigationReorderView,
)

urlpatterns = [
    path('menus/', CMSNavigationMenuListCreateView.as_view(), name='cms-nav-menu-list'),
    path('menus/<int:pk>/', CMSNavigationMenuDetailView.as_view(), name='cms-nav-menu-detail'),
    path('items/', CMSNavigationItemListCreateView.as_view(), name='cms-nav-item-list'),
    path('items/<int:pk>/', CMSNavigationItemDetailView.as_view(), name='cms-nav-item-detail'),
    path('reorder/', CMSNavigationReorderView.as_view(), name='cms-nav-reorder'),
]
