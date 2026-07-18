"""Public URL configuration for the homepage app."""
from django.urls import path

from .views import HomepageView

urlpatterns = [
    path('', HomepageView.as_view(), name='homepage'),
]
