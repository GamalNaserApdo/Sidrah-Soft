"""Public serializers for the insights API."""
from rest_framework import serializers

from apps.media_library.models import MediaAsset

from .models import Article


class ArticleMediaAssetSerializer(serializers.ModelSerializer):
    """Public representation of a MediaAsset used for an article."""

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


class ArticleListSerializer(serializers.ModelSerializer):
    """Card-ready public representation of an article."""

    title = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id',
            'slug',
            'content_type',
            'title',
            'excerpt',
            'category',
            'author',
            'featured_image',
            'read_time_minutes',
            'published_at',
            'is_featured',
            'show_on_homepage',
            'display_order',
            'updated_at',
        ]

    def get_title(self, obj):
        return {
            'en': obj.title_en,
            'ar': obj.title_ar or obj.title_en,
        }

    def get_excerpt(self, obj):
        return {
            'en': obj.excerpt_en,
            'ar': obj.excerpt_ar or obj.excerpt_en,
        }

    def get_category(self, obj):
        return {
            'en': obj.category_en,
            'ar': obj.category_ar or obj.category_en,
        }

    def get_author(self, obj):
        return {
            'name': {
                'en': obj.author_name_en,
                'ar': obj.author_name_ar or obj.author_name_en,
            },
        }

    def get_featured_image(self, obj):
        if obj.featured_image:
            return ArticleMediaAssetSerializer(
                obj.featured_image,
                context=self.context,
            ).data
        return None


class ArticleDetailSerializer(ArticleListSerializer):
    """Full public representation of an article."""

    body = serializers.SerializerMethodField()
    seo = serializers.SerializerMethodField()

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + [
            'body',
            'seo',
            'created_at',
        ]

    def get_body(self, obj):
        return {
            'en': obj.body_en,
            'ar': obj.body_ar or obj.body_en,
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
            'og_image': ArticleMediaAssetSerializer(obj.og_image, context=self.context).data if obj.og_image else None,
            'robots_index': obj.robots_index,
            'robots_follow': obj.robots_follow,
        }
