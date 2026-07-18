"""CMS URL configuration for the media library app."""
from django.urls import path

from .cms_views import (
    CMSMediaListCreateView,
    CMSMediaDetailView,
    CMSMediaUsageView,
)

app_name = 'media_library_cms'

urlpatterns = [
    path('', CMSMediaListCreateView.as_view(), name='media-list-create'),
    path('<int:pk>/', CMSMediaDetailView.as_view(), name='media-detail'),
    path('<int:pk>/usage/', CMSMediaUsageView.as_view(), name='media-usage'),
]
