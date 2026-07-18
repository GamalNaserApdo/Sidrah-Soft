"""URL configuration for the case studies app."""
from django.urls import path

from . import views

app_name = 'case_studies'

urlpatterns = [
    path('', views.CaseStudyListView.as_view(), name='case-study-list'),
    path('<slug:slug>/', views.CaseStudyDetailView.as_view(), name='case-study-detail'),
]
