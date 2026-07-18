"""Public serializers for the case studies API."""
from rest_framework import serializers

from apps.media_library.models import MediaAsset
from apps.services.models import Service

from .models import CaseStudy


class CaseStudyMediaAssetSerializer(serializers.ModelSerializer):
    """Public representation of a MediaAsset used for a case study."""

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


class CaseStudyServiceSerializer(serializers.ModelSerializer):
    """Minimal public representation of a related service."""

    name = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'slug', 'name']

    def get_name(self, obj):
        return {
            'en': obj.name_en,
            'ar': obj.name_ar or obj.name_en,
        }


class CaseStudyListSerializer(serializers.ModelSerializer):
    """Card-ready public representation of a case study."""

    title = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    industry = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudy
        fields = [
            'id',
            'slug',
            'title',
            'client',
            'short_description',
            'industry',
            'featured_image',
            'logo',
            'services',
            'project_year',
            'project_url',
            'open_in_new_tab',
            'display_order',
            'is_featured',
            'show_on_homepage',
        ]

    def get_title(self, obj):
        return {
            'en': obj.title_en,
            'ar': obj.title_ar or obj.title_en,
        }

    def get_client(self, obj):
        if obj.partner:
            return {
                'name': {
                    'en': obj.partner.name_en,
                    'ar': obj.partner.name_ar or obj.partner.name_en,
                },
                'partner_slug': obj.partner.slug,
            }
        return {
            'name': {
                'en': obj.client_name_en,
                'ar': obj.client_name_ar or obj.client_name_en,
            },
            'partner_slug': None,
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
            return CaseStudyMediaAssetSerializer(
                obj.featured_image,
                context=self.context,
            ).data
        return None

    def get_logo(self, obj):
        if obj.logo:
            return CaseStudyMediaAssetSerializer(
                obj.logo,
                context=self.context,
            ).data
        return None

    def get_services(self, obj):
        queryset = obj.services.filter(is_active=True).order_by('display_order', 'name_en')
        return CaseStudyServiceSerializer(
            queryset,
            many=True,
            context=self.context,
        ).data


class CaseStudyDetailSerializer(CaseStudyListSerializer):
    """Full public representation of a case study."""

    problem = serializers.SerializerMethodField()
    solution = serializers.SerializerMethodField()
    technology = serializers.SerializerMethodField()
    outcome = serializers.SerializerMethodField()
    seo = serializers.SerializerMethodField()

    class Meta(CaseStudyListSerializer.Meta):
        fields = CaseStudyListSerializer.Meta.fields + [
            'problem',
            'solution',
            'technology',
            'outcome',
            'seo',
        ]

    def get_problem(self, obj):
        return {
            'en': obj.problem_en,
            'ar': obj.problem_ar or obj.problem_en,
        }

    def get_solution(self, obj):
        return {
            'en': obj.solution_en,
            'ar': obj.solution_ar or obj.solution_en,
        }

    def get_technology(self, obj):
        return {
            'en': obj.technology_en,
            'ar': obj.technology_ar or obj.technology_en,
        }

    def get_outcome(self, obj):
        return {
            'en': obj.outcome_en,
            'ar': obj.outcome_ar or obj.outcome_en,
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
            'canonical_url': obj.canonical_url,
            'og_title': {
                'en': obj.og_title_en,
                'ar': obj.og_title_ar or obj.og_title_en,
            },
            'og_description': {
                'en': obj.og_description_en,
                'ar': obj.og_description_ar or obj.og_description_en,
            },
            'og_image': CaseStudyMediaAssetSerializer(obj.og_image, context=self.context).data if obj.og_image else None,
            'robots_index': obj.robots_index,
            'robots_follow': obj.robots_follow,
        }
