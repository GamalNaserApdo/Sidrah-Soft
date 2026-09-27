"""Public serializers for the services API."""
from rest_framework import serializers

from apps.media_library.models import MediaAsset

from .models import Service


class ServiceMediaAssetSerializer(serializers.ModelSerializer):
    """Public representation of a MediaAsset used for a service."""

    url = serializers.SerializerMethodField()
    alt_text = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ['id', 'url', 'alt_text']

    def get_url(self, obj):
        if obj and obj.file:
            request = self.context.get('request')
            url = obj.file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_alt_text(self, obj):
        value = obj.alt_text if obj else ''
        return {
            'en': value,
            'ar': value or '',
        }


class ServiceCaseStudyCardSerializer(serializers.ModelSerializer):
    """Minimal card representation of a case study related to a service."""

    title = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    industry = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()

    class Meta:
        from apps.case_studies.models import CaseStudy
        model = CaseStudy
        fields = ['id', 'slug', 'title', 'short_description', 'industry', 'featured_image', 'is_featured']

    def get_title(self, obj):
        return {
            'en': obj.title_en,
            'ar': obj.title_ar or obj.title_en,
        }

    def get_short_description(self, obj):
        return {
            'en': obj.short_description_en,
            'ar': obj.short_description_ar or obj.short_description_en,
        }

    def get_industry(self, obj):
        return {
            'en': obj.industry_en,
            'ar': obj.industry_ar or obj.industry_en,
        }

    def get_featured_image(self, obj):
        if obj.featured_image:
            return ServiceMediaAssetSerializer(
                obj.featured_image,
                context=self.context,
            ).data
        return None


class ServiceSerializer(serializers.ModelSerializer):
    """Public, frontend-friendly representation of a service."""

    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()
    cta = serializers.SerializerMethodField()
    seo = serializers.SerializerMethodField()
    detail_url = serializers.SerializerMethodField()
    case_studies = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id',
            'slug',
            'name',
            'short_description',
            'description',
            'icon',
            'featured_image',
            'cta',
            'seo',
            'detail_url',
            'case_studies',
            'display_order',
            'is_featured',
            'show_on_homepage',
        ]

    def get_name(self, obj):
        return {
            'en': obj.name_en,
            'ar': obj.name_ar or obj.name_en,
        }

    def get_short_description(self, obj):
        return {
            'en': obj.short_description_en,
            'ar': obj.short_description_ar or obj.short_description_en,
        }

    def get_description(self, obj):
        return {
            'en': obj.description_en,
            'ar': obj.description_ar or obj.description_en,
        }

    def get_icon(self, obj):
        if obj.icon:
            return ServiceMediaAssetSerializer(
                obj.icon,
                context=self.context,
            ).data
        return None

    def get_featured_image(self, obj):
        if obj.featured_image:
            return ServiceMediaAssetSerializer(
                obj.featured_image,
                context=self.context,
            ).data
        return None

    def get_cta(self, obj):
        return {
            'label': {
                'en': obj.cta_label_en,
                'ar': obj.cta_label_ar or obj.cta_label_en,
            },
            'url': obj.cta_url,
        }

    def get_seo(self, obj):
        return {
            'title': {
                'en': obj.seo_title_en,
                'ar': obj.seo_title_ar or obj.seo_title_en,
            },
            'description': {
                'en': obj.seo_description_en,
                'ar': obj.seo_description_ar or obj.seo_description_en,
            },
        }

    def get_detail_url(self, obj):
        """Return the public detail URL for this service.

        Uses ``detail_url_override`` when set (bespoke pages), otherwise
        falls back to the generic ``/services/<slug>`` route.
        """
        if obj.detail_url_override:
            return obj.detail_url_override
        return f'/services/{obj.slug}'

    def get_case_studies(self, obj):
        """Return related active case studies for this service."""
        queryset = obj.case_studies.filter(is_active=True).order_by(
            '-is_featured', 'display_order', 'title_en',
        )[:6]
        return ServiceCaseStudyCardSerializer(
            queryset,
            many=True,
            context=self.context,
        ).data
