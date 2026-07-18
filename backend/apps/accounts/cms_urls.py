"""CMS URL configuration for the accounts app (dashboard)."""
from django.urls import path

from .cms_dashboard_views import CMSDashboardView

urlpatterns = [
    path('', CMSDashboardView.as_view(), name='cms-dashboard'),
]
