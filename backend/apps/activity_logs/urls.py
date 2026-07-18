"""URL configuration for the activity logs admin API."""
from django.urls import path

from . import views

app_name = 'activity_logs'

urlpatterns = [
    path('', views.ActivityLogListView.as_view(), name='activity-log-list'),
    path('<int:pk>/', views.ActivityLogDetailView.as_view(), name='activity-log-detail'),
]
