"""Public URL configuration for the Dynamic Form Builder."""
from django.urls import path

from . import views

urlpatterns = [
    path('forms/<slug:slug>/', views.FormDefinitionDetailView.as_view(), name='form-detail'),
    path('forms/<slug:slug>/submit/', views.FormSubmitView.as_view(), name='form-submit'),
    path('forms/assigned/<str:target>/', views.AssignedFormView.as_view(), name='form-assigned'),
]
