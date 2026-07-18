"""URL configuration for the site_settings app."""
from django.urls import path

from . import views

app_name = 'site_settings'

urlpatterns = [
    path('site-settings/', views.SiteSettingsView.as_view(), name='site-settings'),
]
