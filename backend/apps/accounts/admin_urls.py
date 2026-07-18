"""
URL configuration for the protected CMS Admin API namespace.

All endpoints under /api/v1/admin/ require authentication and CMS access.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .admin_views import DashboardAccessView
from .user_views import UserManagementViewSet

app_name = 'cms_admin'

router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='cms-user')

urlpatterns = [
    path('dashboard/access/', DashboardAccessView.as_view(), name='dashboard-access'),
    path('', include(router.urls)),
]
