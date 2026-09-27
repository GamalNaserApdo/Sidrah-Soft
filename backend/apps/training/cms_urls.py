"""CMS admin URL patterns for Training & Education."""
from django.urls import path

from .cms_views import (
    CMSCertificateDetailView,
    CMSCertificateIssueView,
    CMSCertificateListCreateView,
    CMSCertificateRevokeView,
    CMSCertificateQRCodeView,
    CMSCertificatePDFView,
    CMSInstructorDetailView,
    CMSInstructorListCreateView,
    CMSModuleTopicDetailView,
    CMSModuleTopicListCreateView,
    CMSNestedReorderView,
    CMSOfferCampaignDetailView,
    CMSOfferCampaignListCreateView,
    CMSOfferItemDetailView,
    CMSOfferItemListCreateView,
    CMSOfferItemReorderView,
    CMSProgramArchiveView,
    CMSProgramDetailView,
    CMSProgramPreviewTokenView,
    CMSProgramFAQDetailView,
    CMSProgramFAQListCreateView,
    CMSProgramInstructorDetailView,
    CMSProgramInstructorListCreateView,
    CMSProgramListCreateView,
    CMSProgramModuleDetailView,
    CMSProgramModuleListCreateView,
    CMSProgramPublishView,
    CMSProgramReorderView,
    CMSProgramTestimonialApproveView,
    CMSProgramTestimonialDetailView,
    CMSProgramTestimonialListCreateView,
    CMSProgramUnpublishView,
    CMSStarterCampaignConfigView,
    CMSStarterLandingPreviewTokenView,
    CMSStarterLandingPublishView,
    CMSStarterLandingView,
    CMSTrainingRegistrationDetailView,
    CMSTrainingRegistrationTransitionView,
    CMSTrainingRegistrationOperationalStatusView,
    CMSTrainingRegistrationExportView,
    CMSTrainingRegistrationListCreateView,
    CMSTrainingRegistrationStatsView,
)

urlpatterns = [
    path('', CMSProgramListCreateView.as_view(), name='cms-program-list'),
    path('reorder/', CMSProgramReorderView.as_view(), name='cms-program-reorder'),
    path('reorder/<str:model>/', CMSNestedReorderView.as_view(), name='cms-nested-reorder'),

    # Courses Offers (OfferCampaign -> OfferItem -> Program)
    path('offers/', CMSOfferCampaignListCreateView.as_view(), name='cms-offer-campaign-list'),
    path('offers/<int:pk>/', CMSOfferCampaignDetailView.as_view(), name='cms-offer-campaign-detail'),
    path('offers/<int:campaign_id>/items/', CMSOfferItemListCreateView.as_view(), name='cms-offer-item-list'),
    path('offers/<int:campaign_id>/items/reorder/', CMSOfferItemReorderView.as_view(), name='cms-offer-item-reorder'),
    path('offer-items/<int:pk>/', CMSOfferItemDetailView.as_view(), name='cms-offer-item-detail'),

    path('<int:pk>/', CMSProgramDetailView.as_view(), name='cms-program-detail'),
    path('<int:pk>/publish/', CMSProgramPublishView.as_view(), name='cms-program-publish'),
    path('<int:pk>/unpublish/', CMSProgramUnpublishView.as_view(), name='cms-program-unpublish'),
    path('<int:pk>/archive/', CMSProgramArchiveView.as_view(), name='cms-program-archive'),
    path('<int:pk>/preview-token/', CMSProgramPreviewTokenView.as_view(), name='cms-program-preview-token'),

    # Nested resources under a program
    path('<int:program_id>/modules/', CMSProgramModuleListCreateView.as_view(), name='cms-program-module-list'),
    path('<int:program_id>/faqs/', CMSProgramFAQListCreateView.as_view(), name='cms-program-faq-list'),
    path('<int:program_id>/instructors/', CMSProgramInstructorListCreateView.as_view(), name='cms-program-instructor-list'),
    path('<int:program_id>/testimonials/', CMSProgramTestimonialListCreateView.as_view(), name='cms-program-testimonial-list'),

    # Standalone resource detail endpoints
    path('modules/<int:pk>/', CMSProgramModuleDetailView.as_view(), name='cms-module-detail'),
    path('modules/<int:module_id>/topics/', CMSModuleTopicListCreateView.as_view(), name='cms-module-topic-list'),
    path('topics/<int:pk>/', CMSModuleTopicDetailView.as_view(), name='cms-topic-detail'),
    path('faqs/<int:pk>/', CMSProgramFAQDetailView.as_view(), name='cms-faq-detail'),
    path('testimonials/<int:pk>/', CMSProgramTestimonialDetailView.as_view(), name='cms-testimonial-detail'),
    path('testimonials/<int:pk>/approve/', CMSProgramTestimonialApproveView.as_view(), name='cms-testimonial-approve'),
    path('program-instructors/<int:pk>/', CMSProgramInstructorDetailView.as_view(), name='cms-program-instructor-detail'),

    # Reusable instructor management
    path('instructors/', CMSInstructorListCreateView.as_view(), name='cms-instructor-list'),
    path('instructors/<int:pk>/', CMSInstructorDetailView.as_view(), name='cms-instructor-detail'),

    path('registrations/', CMSTrainingRegistrationListCreateView.as_view(), name='cms-registration-list'),
    path('registrations/stats/', CMSTrainingRegistrationStatsView.as_view(), name='cms-registration-stats'),
    path('registrations/export/', CMSTrainingRegistrationExportView.as_view(), name='cms-registration-export'),
    path('registrations/<int:pk>/', CMSTrainingRegistrationDetailView.as_view(), name='cms-registration-detail'),
    path('registrations/<int:pk>/transition/', CMSTrainingRegistrationTransitionView.as_view(), name='cms-registration-transition'),
    path('registrations/<int:pk>/operational-status/', CMSTrainingRegistrationOperationalStatusView.as_view(), name='cms-registration-operational-status'),

    path('certificates/', CMSCertificateListCreateView.as_view(), name='cms-certificate-list'),
    path('certificates/<int:pk>/', CMSCertificateDetailView.as_view(), name='cms-certificate-detail'),
    path('certificates/<int:pk>/issue/', CMSCertificateIssueView.as_view(), name='cms-certificate-issue'),
    path('certificates/<int:pk>/revoke/', CMSCertificateRevokeView.as_view(), name='cms-certificate-revoke'),
    path('certificates/<int:pk>/qr-code/', CMSCertificateQRCodeView.as_view(), name='cms-certificate-qr-code'),
    path('certificates/<int:pk>/pdf/', CMSCertificatePDFView.as_view(), name='cms-certificate-pdf'),

    # Starter campaign form configuration (singleton)
    path('starter-form-config/', CMSStarterCampaignConfigView.as_view(), name='cms-starter-form-config'),

    # Starter landing page builder (singleton draft/publish)
    path('starter-landing/', CMSStarterLandingView.as_view(), name='cms-starter-landing'),
    path('starter-landing/publish/', CMSStarterLandingPublishView.as_view(), name='cms-starter-landing-publish'),
    path('starter-landing/preview-token/', CMSStarterLandingPreviewTokenView.as_view(), name='cms-starter-landing-preview-token'),
]
