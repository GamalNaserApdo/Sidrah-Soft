"""CMS URL configuration for the site_settings app."""
from django.urls import path

from .cms_views import CMSSiteSettingView

urlpatterns = [
    path('', CMSSiteSettingView.as_view(), name='cms-site-settings'),
]
