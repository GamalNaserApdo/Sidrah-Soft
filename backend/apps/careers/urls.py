"""URL configuration for the careers app."""
from django.urls import path

from . import views

app_name = 'careers'

urlpatterns = [
    path('', views.JobListView.as_view(), name='job-list'),
    path('<slug:slug>/', views.JobDetailView.as_view(), name='job-detail'),
]
