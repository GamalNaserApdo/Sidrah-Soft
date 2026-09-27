"""CMS URL configuration for the Dynamic Form Builder."""
from django.urls import path

from .cms_views import (
    CMSFormListCreateView,
    CMSFormDetailView,
    CMSFormFieldListCreateView,
    CMSFormFieldDetailView,
    CMSFormFieldOptionListCreateView,
    CMSFormFieldOptionDetailView,
    CMSFormAssignmentListCreateView,
    CMSFormAssignmentDetailView,
    CMSFormAssignmentTargetsView,
    CMSSubmissionListView,
    CMSSubmissionDetailView,
    CMSSubmissionExportView,
)

urlpatterns = [
    # Form definitions
    path('definitions/', CMSFormListCreateView.as_view(), name='cms-form-list'),
    path('definitions/<int:form_id>/', CMSFormDetailView.as_view(), name='cms-form-detail'),
    # Form fields (nested under form)
    path('definitions/<int:form_id>/fields/', CMSFormFieldListCreateView.as_view(), name='cms-form-field-list'),
    path('definitions/<int:form_id>/fields/<int:field_id>/', CMSFormFieldDetailView.as_view(), name='cms-form-field-detail'),
    # Field options (nested under field)
    path('fields/<int:field_id>/options/', CMSFormFieldOptionListCreateView.as_view(), name='cms-form-option-list'),
    path('fields/<int:field_id>/options/<int:option_id>/', CMSFormFieldOptionDetailView.as_view(), name='cms-form-option-detail'),
    # Assignments
    path('assignments/', CMSFormAssignmentListCreateView.as_view(), name='cms-form-assignment-list'),
    path('assignments/targets/', CMSFormAssignmentTargetsView.as_view(), name='cms-form-assignment-targets'),
    path('assignments/<int:assignment_id>/', CMSFormAssignmentDetailView.as_view(), name='cms-form-assignment-detail'),
    # Submissions
    path('submissions/', CMSSubmissionListView.as_view(), name='cms-form-submission-list'),
    path('submissions/<int:submission_id>/', CMSSubmissionDetailView.as_view(), name='cms-form-submission-detail'),
    path('submissions/export/', CMSSubmissionExportView.as_view(), name='cms-form-submission-export'),
]
