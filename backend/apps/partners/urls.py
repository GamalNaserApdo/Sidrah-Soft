"""URL configuration for the partners app."""
from django.urls import path

from . import views

app_name = 'partners'

urlpatterns = [
    path('', views.PartnerListView.as_view(), name='partner-list'),
    path('<slug:slug>/', views.PartnerDetailView.as_view(), name='partner-detail'),
]
