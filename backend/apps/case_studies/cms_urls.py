"""CMS URL configuration for the case_studies app."""
from django.urls import path

from .cms_views import (
    CMSCaseStudyListCreateView,
    CMSCaseStudyDetailView,
    CMSCaseStudyReorderView,
)

urlpatterns = [
    path('', CMSCaseStudyListCreateView.as_view(), name='cms-case-study-list'),
    path('reorder/', CMSCaseStudyReorderView.as_view(), name='cms-case-study-reorder'),
    path('<int:pk>/', CMSCaseStudyDetailView.as_view(), name='cms-case-study-detail'),
]
