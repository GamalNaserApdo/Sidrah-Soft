"""Public API URL patterns for Training & Education."""
from django.urls import path

from . import views

urlpatterns = [
    path('programs/', views.ProgramListView.as_view(), name='program-list'),
    path('programs/<slug:slug>/', views.ProgramDetailView.as_view(), name='program-detail'),
]
