"""CMS URL configuration for the contact app."""
from django.urls import path

from .cms_views import (
    CMSInquiryTypeListCreateView,
    CMSInquiryTypeDetailView,
    CMSContactSubmissionListView,
    CMSContactSubmissionDetailView,
    CMSContactSubmissionStatsView,
)

urlpatterns = [
    path('inquiry-types/', CMSInquiryTypeListCreateView.as_view(), name='cms-inquiry-type-list'),
    path('inquiry-types/<int:pk>/', CMSInquiryTypeDetailView.as_view(), name='cms-inquiry-type-detail'),
    path('submissions-stats/', CMSContactSubmissionStatsView.as_view(), name='cms-contact-submission-stats'),
    path('submissions/', CMSContactSubmissionListView.as_view(), name='cms-contact-submission-list'),
    path('submissions/<int:pk>/', CMSContactSubmissionDetailView.as_view(), name='cms-contact-submission-detail'),
]
