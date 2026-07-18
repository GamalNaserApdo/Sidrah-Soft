"""URL configuration for the navigation app."""
from django.urls import path

from . import views

app_name = 'navigation'

urlpatterns = [
    path('', views.NavigationMenuListView.as_view(), name='menu-list'),
    path('<slug:slug>/', views.NavigationMenuDetailView.as_view(), name='menu-detail'),
]
