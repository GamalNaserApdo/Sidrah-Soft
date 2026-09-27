"""Public API URL patterns for Training & Education."""
from django.urls import path

from . import views

urlpatterns = [
    path('programs/', views.ProgramListView.as_view(), name='program-list'),
    path('programs/<slug:slug>/preview/', views.ProgramPreviewView.as_view(), name='program-preview'),
    path('programs/<slug:slug>/', views.ProgramDetailView.as_view(), name='program-detail'),
    path('programs/<slug:slug>/register/', views.WebsiteRegistrationView.as_view(), name='website-registration'),
    path('starter-form-config/', views.StarterCampaignConfigView.as_view(), name='starter-form-config'),
    path('starter-page/', views.StarterLandingPageView.as_view(), name='starter-landing-page'),
    path('starter-page/preview/', views.StarterLandingPagePreviewView.as_view(), name='starter-landing-preview'),
    path('offers/', views.OfferListView.as_view(), name='offer-list'),
    path('apps-script/submission/', views.AppsScriptSubmissionView.as_view(), name='apps-script-submission'),
    path('certificates/<str:reference>/verify/', views.CertificateVerifyView.as_view(), name='certificate-verify'),
]
