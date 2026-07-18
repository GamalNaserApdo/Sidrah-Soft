"""Seed default inquiry types for the Contact Management CMS."""
from django.core.management.base import BaseCommand

from ...models import InquiryType


INQUIRY_TYPE_SEED_DATA = [
    {
        'slug': 'general',
        'name_en': 'General Inquiry',
        'name_ar': 'استفسار عام',
        'description_en': 'General questions about Sidrah Soft.',
        'description_ar': 'أسئلة عامة حول سِدرة سوفت.',
        'order': 0,
    },
    {
        'slug': 'project-consultation',
        'name_en': 'Project Consultation',
        'name_ar': 'استشارة مشروع',
        'description_en': 'Discuss a specific project or digital initiative.',
        'description_ar': 'مناقشة مشروع محدد أو مبادرة رقمية.',
        'order': 1,
    },
    {
        'slug': 'consultation',
        'name_en': 'Consultation',
        'name_ar': 'استشارة',
        'description_en': 'General consultation and advisory services.',
        'description_ar': 'استشارات وخدمات استشارية عامة.',
        'order': 2,
    },
    {
        'slug': 'website-development',
        'name_en': 'Website Development',
        'name_ar': 'تطوير مواقع الويب',
        'description_en': 'Custom web applications and platforms.',
        'description_ar': 'تطبيقات ومنصات ويب مخصصة.',
        'order': 3,
    },
    {
        'slug': 'mobile-applications',
        'name_en': 'Mobile Application Development',
        'name_ar': 'تطوير تطبيقات الجوال',
        'description_en': 'Native and cross-platform mobile apps.',
        'description_ar': 'تطبيقات الجوال الأصلية والمتعددة المنصات.',
        'order': 4,
    },
    {
        'slug': 'ai-automation',
        'name_en': 'AI and Automation',
        'name_ar': 'الذكاء الاصطناعي والأتمتة',
        'description_en': 'Intelligent systems and workflow automation.',
        'description_ar': 'الأنظمة الذكية وأتمتة سير العمل.',
        'order': 5,
    },
    {
        'slug': 'erp-business-system',
        'name_en': 'ERP / Business System',
        'name_ar': 'نظام تخطيط الموارد / نظام أعمال',
        'description_en': 'ERP and business management systems.',
        'description_ar': 'أنظمة تخطيط الموارد وأنظمة إدارة الأعمال.',
        'order': 6,
    },
    {
        'slug': 'enterprise-software',
        'name_en': 'Enterprise Software',
        'name_ar': 'البرمجيات المؤسسية',
        'description_en': 'ERP and scalable enterprise solutions.',
        'description_ar': 'أنظمة تخطيط الموارد المؤسسية وحلول قابلة للتوسع.',
        'order': 7,
    },
    {
        'slug': 'partnership',
        'name_en': 'Partnership',
        'name_ar': 'شراكة',
        'description_en': 'Explore strategic or commercial partnerships.',
        'description_ar': 'استكشاف شراكات استراتيجية أو تجارية.',
        'order': 8,
    },
    {
        'slug': 'academic-collaboration',
        'name_en': 'Academic Collaboration',
        'name_ar': 'تعاون أكاديمي',
        'description_en': 'Collaboration with universities and educational institutions.',
        'description_ar': 'التعاون مع الجامعات والمؤسسات التعليمية.',
        'order': 9,
    },
    {
        'slug': 'training-courses',
        'name_en': 'Training and Courses',
        'name_ar': 'التدريب والدورات',
        'description_en': 'Information about training programs and courses.',
        'description_ar': 'معلومات حول البرامج التدريبية والدورات.',
        'order': 10,
    },
    {
        'slug': 'training',
        'name_en': 'Training',
        'name_ar': 'تدريب',
        'description_en': 'Training programs and professional workshops.',
        'description_ar': 'برامج تدريبية وورش عمل مهنية.',
        'order': 11,
    },
    {
        'slug': 'careers',
        'name_en': 'Careers',
        'name_ar': 'الوظائف',
        'description_en': 'Career and job opportunities.',
        'description_ar': 'فرص العمل والتوظيف.',
        'order': 12,
    },
    {
        'slug': 'technical-support',
        'name_en': 'Technical Support',
        'name_ar': 'الدعم الفني',
        'description_en': 'Support requests for existing products or services.',
        'description_ar': 'طلبات الدعم للمنتجات أو الخدمات الحالية.',
        'order': 13,
    },
    {
        'slug': 'other',
        'name_en': 'Other',
        'name_ar': 'أخرى',
        'description_en': 'Anything that does not fit the categories above.',
        'description_ar': 'أي شيء لا يناسب الفئات أعلاه.',
        'order': 14,
    },
]


class Command(BaseCommand):
    help = 'Seed default contact inquiry types if they do not already exist.'

    def handle(self, *args, **options):
        created_count = 0
        existing_count = 0

        for item in INQUIRY_TYPE_SEED_DATA:
            inquiry_type, created = InquiryType.objects.get_or_create(
                slug=item['slug'],
                defaults={
                    'name_en': item['name_en'],
                    'name_ar': item['name_ar'],
                    'description_en': item['description_en'],
                    'description_ar': item['description_ar'],
                    'order': item['order'],
                    'is_active': True,
                },
            )
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded contact inquiry types: {created_count} created, '
                f'{existing_count} already existed.'
            )
        )
