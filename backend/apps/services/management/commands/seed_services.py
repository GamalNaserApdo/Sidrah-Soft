"""Seed the canonical Sidrah service catalog.

This command is idempotent and safe to run against existing environments.
It reconciles the approved seven-service catalog:

  1. Web Development              (web-development)
  2. Mobile App Development       (mobile-app-development)
  3. ERP & Business Systems       (erp-business-systems)
  4. AI & Automation              (ai-automation)
  5. Custom Software Development  (custom-software-development)
  6. Data & Analytics             (data-analytics)
  7. System Integration           (system-integration)

Legacy slug mapping (old → canonical):
  web-applications     → web-development
  mobile-applications  → mobile-app-development
  erp-solutions        → erp-business-systems
  ai-solutions         → ai-automation (merged)
  automation-solutions → ai-automation (merged)

Legacy services that don't map to a canonical slug are deactivated
(is_active=False), not deleted, to preserve referential integrity
with CaseStudy.services M2M and ContactSubmission.related_service FK.

Training Programs is NOT a service and is never created here.
"""
from django.core.management.base import BaseCommand

from apps.services.models import Service


# Canonical seven-service catalog (approved by PM).
CANONICAL_SERVICES = [
    {
        'name_en': 'Web Development',
        'name_ar': 'تطوير الويب',
        'slug': 'web-development',
        'short_description_en': 'Custom web platforms built for scale, performance, and long-term growth.',
        'short_description_ar': 'منصات ويب مخصصة مبنية للتوسع والأداء والنمو طويل المدى.',
        'description_en': 'We design and build custom web platforms — from customer-facing applications to internal dashboards — engineered for scale, performance, and long-term maintainability.',
        'description_ar': 'نصمم ونبني منصات ويب مخصصة — من تطبيقات العملاء إلى لوحات التحكم الداخلية — مهندسة للتوسع والأداء والصيانة طويلة المدى.',
        'display_order': 1,
        'is_featured': True,
        'show_on_homepage': True,
        'seo_title_en': 'Web Development Services | Sidrah Soft',
        'seo_title_ar': 'خدمات تطوير الويب | Sidrah Soft',
        'seo_description_en': 'Custom web application development services from Sidrah Soft — scalable platforms built for real business use.',
        'seo_description_ar': 'خدمات تطوير تطبيقات الويب المخصصة من Sidrah Soft — منصات قابلة للتوسع مبنية لاستخدامات عملية.',
    },
    {
        'name_en': 'Mobile App Development',
        'name_ar': 'تطوير تطبيقات الجوال',
        'slug': 'mobile-app-development',
        'short_description_en': 'Native and cross-platform mobile apps for iOS and Android.',
        'short_description_ar': 'تطبيقات جوال أصلية ومتعددة المنصات لنظامي iOS وAndroid.',
        'description_en': 'We build native and cross-platform mobile applications that deliver consistent, high-performance experiences across iOS and Android devices.',
        'description_ar': 'نبني تطبيقات جوال أصلية ومتعددة المنصات تقدم تجارب متسقة وعالية الأداء عبر أجهزة iOS وAndroid.',
        'display_order': 2,
        'is_featured': True,
        'show_on_homepage': True,
        'seo_title_en': 'Mobile App Development Services | Sidrah Soft',
        'seo_title_ar': 'خدمات تطوير تطبيقات الجوال | Sidrah Soft',
        'seo_description_en': 'Native and cross-platform mobile app development for iOS and Android from Sidrah Soft.',
        'seo_description_ar': 'تطوير تطبيقات الجوال الأصلية ومتعددة المنصات لنظامي iOS وAndroid من Sidrah Soft.',
    },
    {
        'name_en': 'ERP & Business Systems',
        'name_ar': 'أنظمة ERP وحلول الأعمال',
        'slug': 'erp-business-systems',
        'short_description_en': 'Integrated systems that connect operations, finance, and data.',
        'short_description_ar': 'أنظمة متكاملة تربط العمليات والمالية والبيانات.',
        'description_en': 'We implement and customize ERP and business management systems that unify operations, finance, inventory, and reporting into a single source of truth.',
        'description_ar': 'ننفذ ونخصص أنظمة ERP وإدارة الأعمال التي توحد العمليات والمالية والمخزون والتقارير في مصدر بيانات واحد.',
        'display_order': 3,
        'is_featured': True,
        'show_on_homepage': True,
        'seo_title_en': 'ERP & Business Systems | Sidrah Soft',
        'seo_title_ar': 'أنظمة ERP وحلول الأعمال | Sidrah Soft',
        'seo_description_en': 'Integrated ERP and business system solutions that connect operations, finance, and data from Sidrah Soft.',
        'seo_description_ar': 'حلول أنظمة ERP والأعمال المتكاملة التي تربط العمليات والمالية والبيانات من Sidrah Soft.',
    },
    {
        'name_en': 'AI & Automation',
        'name_ar': 'الذكاء الاصطناعي والأتمتة',
        'slug': 'ai-automation',
        'short_description_en': 'Intelligent workflows that reduce manual work and surface insights.',
        'short_description_ar': 'سير عمل ذكي يقلل العمل اليدوي ويكشف الرؤى.',
        'description_en': 'We build AI-powered automation systems — workflow automation, AI agents, business process automation, and intelligent integration with existing systems.',
        'description_ar': 'نبني أنظمة أتمتة مدعومة بالذكاء الاصطناعي — أتمتة سير العمل، وكلاء الذكاء الاصطناعي، أتمتة العمليات، والتكامل الذكي مع الأنظمة الحالية.',
        'display_order': 4,
        'is_featured': True,
        'show_on_homepage': True,
        'detail_url_override': '/services/ai-automation',
        'seo_title_en': 'AI Automation Services in Egypt | Sidrah Soft',
        'seo_title_ar': 'خدمات أتمتة الذكاء الاصطناعي | Sidrah Soft',
        'seo_description_en': 'AI automation services — workflow automation, AI agents, business process automation, and intelligent integration with your existing systems.',
        'seo_description_ar': 'خدمات أتمتة الذكاء الاصطناعي — أتمتة سير العمل، وكلاء الذكاء الاصطناعي، أتمتة العمليات، والتكامل الذكي مع أنظمتك الحالية.',
    },
    {
        'name_en': 'Custom Software Development',
        'name_ar': 'تطوير البرمجيات المخصصة',
        'slug': 'custom-software-development',
        'short_description_en': 'Tailored software for specific business requirements.',
        'short_description_ar': 'برمجيات مخصصة لمتطلبات أعمال محددة.',
        'description_en': 'We build custom software solutions tailored to specific business requirements that off-the-shelf products cannot address — from internal tools to specialized platforms.',
        'description_ar': 'نبني حلول برمجية مخصصة لمتطلبات أعمال محددة لا تستطيع المنتجات الجاهزة معالجتها — من الأدوات الداخلية إلى المنصات المتخصصة.',
        'display_order': 5,
        'is_featured': False,
        'show_on_homepage': True,
        'seo_title_en': 'Custom Software Development | Sidrah Soft',
        'seo_title_ar': 'تطوير البرمجيات المخصصة | Sidrah Soft',
        'seo_description_en': 'Tailored software development for specific business requirements from Sidrah Soft.',
        'seo_description_ar': 'تطوير برمجيات مخصصة لمتطلبات أعمال محددة من Sidrah Soft.',
    },
    {
        'name_en': 'Data & Analytics',
        'name_ar': 'البيانات والتحليلات',
        'slug': 'data-analytics',
        'short_description_en': 'Data pipelines, dashboards, and analytics that turn raw data into decisions.',
        'short_description_ar': 'خطوط بيانات ولوحات تحكم وتحليلات تحول البيانات الخام إلى قرارات.',
        'description_en': 'We design data pipelines, dashboards, and analytics systems that transform raw operational data into actionable business intelligence.',
        'description_ar': 'نصمم خطوط البيانات ولوحات التحكم وأنظمة التحليلات التي تحول البيانات التشغيلية الخام إلى ذكاء أعمال قابل للتنفيذ.',
        'display_order': 6,
        'is_featured': False,
        'show_on_homepage': True,
        'seo_title_en': 'Data & Analytics Services | Sidrah Soft',
        'seo_title_ar': 'خدمات البيانات والتحليلات | Sidrah Soft',
        'seo_description_en': 'Data pipelines, dashboards, and analytics systems from Sidrah Soft — turn raw data into decisions.',
        'seo_description_ar': 'خطوط البيانات ولوحات التحكم وأنظمة التحليلات من Sidrah Soft — حوّل البيانات الخام إلى قرارات.',
    },
    {
        'name_en': 'System Integration',
        'name_ar': 'تكامل الأنظمة',
        'slug': 'system-integration',
        'short_description_en': 'Connect disparate systems into a unified, reliable workflow.',
        'short_description_ar': 'ربط الأنظمة المتباينة في سير عمل موحد وموثوق.',
        'description_en': 'We integrate disparate systems — APIs, legacy software, third-party services, and internal tools — into cohesive, reliable workflows that eliminate data silos.',
        'description_ar': 'ندمج الأنظمة المتباينة — واجهات API والبرمجيات القديمة والخدمات الخارجية والأدوات الداخلية — في سير عمل متماسك وموثوق يزيل عزل البيانات.',
        'display_order': 7,
        'is_featured': False,
        'show_on_homepage': True,
        'seo_title_en': 'System Integration Services | Sidrah Soft',
        'seo_title_ar': 'خدمات تكامل الأنظمة | Sidrah Soft',
        'seo_description_en': 'Connect disparate systems into unified workflows with Sidrah Soft system integration services.',
        'seo_description_ar': 'اربط الأنظمة المتباينة في سير عمل موحد مع خدمات تكامل الأنظمة من Sidrah Soft.',
    },
]

DEFAULT_CTA = {
    'cta_label_en': 'Learn More',
    'cta_label_ar': 'اعرف المزيد',
    'cta_url': '#contact',
}

# Legacy slug → canonical slug mapping.
# Services with these old slugs are renamed to the canonical slug.
LEGACY_SLUG_MAP = {
    'web-applications': 'web-development',
    'mobile-applications': 'mobile-app-development',
    'erp-solutions': 'erp-business-systems',
    'ai-solutions': 'ai-automation',
    'automation-solutions': 'ai-automation',
}

CANONICAL_SLUGS = {s['slug'] for s in CANONICAL_SERVICES}


class Command(BaseCommand):
    help = 'Seed the canonical seven-service Sidrah catalog (idempotent).'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        renamed_count = 0
        deactivated_count = 0

        # Phase 1: Rename legacy slugs to canonical slugs.
        for old_slug, new_slug in LEGACY_SLUG_MAP.items():
            if old_slug == new_slug:
                continue
            existing = Service.objects.filter(slug=old_slug).first()
            if not existing:
                continue
            canonical = Service.objects.filter(slug=new_slug).first()
            if canonical:
                # Both exist — the legacy record is a duplicate; deactivate it
                # to preserve referential integrity without losing data.
                if existing.is_active:
                    existing.is_active = False
                    existing.save(update_fields=['is_active'])
                    deactivated_count += 1
            else:
                existing.slug = new_slug
                existing.save(update_fields=['slug'])
                renamed_count += 1

        # Phase 2: Upsert canonical services.
        for data in CANONICAL_SERVICES:
            defaults = {
                'is_active': True,
                **DEFAULT_CTA,
                **data,
            }
            _, created = Service.objects.update_or_create(
                slug=data['slug'],
                defaults=defaults,
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        # Phase 3: Deactivate non-canonical services (preserve data + FKs).
        non_canonical = Service.objects.exclude(slug__in=CANONICAL_SLUGS)
        for service in non_canonical:
            if service.is_active:
                service.is_active = False
                service.save(update_fields=['is_active'])
                deactivated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Canonical services reconciled: '
                f'{created_count} created, {updated_count} updated, '
                f'{renamed_count} renamed, {deactivated_count} deactivated.'
            )
        )
