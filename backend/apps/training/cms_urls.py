"""CMS admin URL patterns for Training & Education."""
from django.urls import path

from .cms_views import (
    CMSProgramListCreateView,
    CMSProgramDetailView,
    CMSProgramReorderView,
)

urlpatterns = [
    path('', CMSProgramListCreateView.as_view(), name='cms-program-list'),
    path('reorder/', CMSProgramReorderView.as_view(), name='cms-program-reorder'),
    path('<int:pk>/', CMSProgramDetailView.as_view(), name='cms-program-detail'),
]
