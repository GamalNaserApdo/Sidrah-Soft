"""Central CMS Admin API URL router.

Includes all module CMS URLs under the /api/v1/cms/ namespace.
"""
from django.urls import include, path

urlpatterns = [
    path('dashboard/', include('apps.accounts.cms_urls')),
    path('site-settings/', include('apps.site_settings.cms_urls')),
    path('navigation/', include('apps.navigation.cms_urls')),
    path('partners/', include('apps.partners.cms_urls')),
    path('services/', include('apps.services.cms_urls')),
    path('case-studies/', include('apps.case_studies.cms_urls')),
    path('insights/', include('apps.insights.cms_urls')),
    path('careers/', include('apps.careers.cms_urls')),
    path('contact/', include('apps.contact.cms_urls')),
    path('media/', include('apps.media_library.cms_urls')),
    path('homepage/', include('apps.homepage.cms_urls')),
]
