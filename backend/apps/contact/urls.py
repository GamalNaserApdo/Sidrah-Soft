"""URL configuration for the contact app."""
from django.urls import path

from . import views

app_name = 'contact'

urlpatterns = [
    path('inquiry-types/', views.InquiryTypeListView.as_view(), name='inquiry-type-list'),
    path('submissions/', views.ContactSubmissionCreateView.as_view(), name='submission-create'),
]
