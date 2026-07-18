"""CMS URL configuration for the careers app."""
from django.urls import path

from .cms_views import CMSJobListCreateView, CMSJobDetailView

urlpatterns = [
    path('', CMSJobListCreateView.as_view(), name='cms-job-list'),
    path('<int:pk>/', CMSJobDetailView.as_view(), name='cms-job-detail'),
]
