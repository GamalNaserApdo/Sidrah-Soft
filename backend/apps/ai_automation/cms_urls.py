"""CMS URL configuration for the AI Automation app."""
from django.urls import path

from .cms_views import (
    CMSAIAutomationPageView,
    CMSAIAutomationItemListView,
    CMSAIAutomationItemDetailView,
    CMSAIAutomationProcessStepListView,
    CMSAIAutomationProcessStepDetailView,
    CMSAIAutomationFAQListView,
    CMSAIAutomationFAQDetailView,
)

urlpatterns = [
    path('', CMSAIAutomationPageView.as_view(), name='cms-ai-automation-page'),
    path('items/', CMSAIAutomationItemListView.as_view(), name='cms-ai-automation-items'),
    path('items/<int:pk>/', CMSAIAutomationItemDetailView.as_view(), name='cms-ai-automation-item-detail'),
    path('process-steps/', CMSAIAutomationProcessStepListView.as_view(), name='cms-ai-automation-process-steps'),
    path('process-steps/<int:pk>/', CMSAIAutomationProcessStepDetailView.as_view(), name='cms-ai-automation-process-step-detail'),
    path('faqs/', CMSAIAutomationFAQListView.as_view(), name='cms-ai-automation-faqs'),
    path('faqs/<int:pk>/', CMSAIAutomationFAQDetailView.as_view(), name='cms-ai-automation-faq-detail'),
]
