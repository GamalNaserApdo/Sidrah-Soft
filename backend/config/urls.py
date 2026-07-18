"""URL configuration for SidrahSoft CMS backend."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from apps.core.seo_views import robots_txt, sitemap_xml

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.core.urls')),
    path('api/v1/', include('apps.site_settings.urls')),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/admin/', include('apps.accounts.admin_urls')),
    path('api/v1/admin/activity-logs/', include('apps.activity_logs.urls')),
    path('api/v1/navigation/', include('apps.navigation.urls')),
    path('api/v1/partners/', include('apps.partners.urls')),
    path('api/v1/services/', include('apps.services.urls')),
    path('api/v1/case-studies/', include('apps.case_studies.urls')),
    path('api/v1/insights/', include('apps.insights.urls')),
    path('api/v1/jobs/', include('apps.careers.urls')),
    path('api/v1/contact/', include('apps.contact.urls')),
    path('api/v1/homepage/', include('apps.homepage.urls')),
    path('api/v1/cms/', include('apps.core.cms_urls')),
    path('robots.txt', robots_txt, name='robots-txt'),
    path('sitemap.xml', sitemap_xml, name='sitemap-xml'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
