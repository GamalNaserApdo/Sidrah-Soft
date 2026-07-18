export const INSIGHT_CATEGORIES = {
  all: 'All',
  ai: 'AI',
  softwareDevelopment: 'Software Development',
  mobileApps: 'Mobile Apps',
  automation: 'Automation',
  educationTechnology: 'Education Technology',
};

export const INSIGHT_CATEGORIES_AR = {
  all: 'الكل',
  ai: 'الذكاء الاصطناعي',
  softwareDevelopment: 'تطوير البرمجيات',
  mobileApps: 'تطبيقات الجوال',
  automation: 'الأتمتة',
  educationTechnology: 'تقنية التعليم',
};

export function getBilingualInsightCategory(category, lang) {
  if (lang === 'ar') {
    const entry = Object.entries(INSIGHT_CATEGORIES).find(([, v]) => v === category);
    if (entry) return INSIGHT_CATEGORIES_AR[entry[0]] || category;
  }
  return category;
}

export const INSIGHT_SORT_OPTIONS = {
  newest: 'Newest',
  oldest: 'Oldest',
  featured: 'Featured',
};

export const insights = [
  {
    id: '1',
    slug: 'building-systems-that-scale',
    title: 'Building systems that scale beyond the first launch',
    title_ar: 'بناء أنظمة تتوسع بما يتجاوز الإطلاق الأول',
    excerpt:
      'Why successful digital products need architecture, operations, and long-term maintainability from day one.',
    excerpt_ar:
      'لماذا تحتاج المنتجات الرقمية الناجحة إلى بنية وتشغيل وقابلية صيانة طويلة الأمد منذ اليوم الأول.',
    category: INSIGHT_CATEGORIES.softwareDevelopment,
    category_ar: INSIGHT_CATEGORIES_AR.softwareDevelopment,
    coverImage: '/assets/insights/placeholder.png',
    publishDate: '2026-01-15',
    readingTime: '5 min read',
    featured: true,
    language: 'en',
    seo: {
      title: 'Building systems that scale beyond the first launch | Sidrah Soft',
      description:
        'Why successful digital products need architecture, operations, and long-term maintainability from day one.',
    },
  },
  {
    id: '2',
    slug: 'where-automation-creates-real-business-value',
    title: 'Where automation creates real business value',
    title_ar: 'حيث تخلق الأتمتة قيمة أعمال حقيقية',
    excerpt:
      'How organizations can identify repeatable workflows and turn them into measurable operational efficiency.',
    excerpt_ar:
      'كيف يمكن للمؤسسات تحديد سير العمل القابل للتكرار وتحويله إلى كفاءة تشغيلية قابلة للقياس.',
    category: INSIGHT_CATEGORIES.automation,
    category_ar: INSIGHT_CATEGORIES_AR.automation,
    coverImage: '/assets/insights/placeholder.png',
    publishDate: '2026-02-03',
    readingTime: '4 min read',
    featured: true,
    language: 'en',
    seo: {
      title: 'Where automation creates real business value | Sidrah Soft',
      description:
        'How organizations can identify repeatable workflows and turn them into measurable operational efficiency.',
    },
  },
  {
    id: '3',
    slug: 'designing-digital-foundations-for-modern-learning',
    title: 'Designing digital foundations for modern learning',
    title_ar: 'تصميم أسس رقمية للتعلم الحديث',
    excerpt:
      'How academic institutions can prepare platforms, student systems, and future learning experiences.',
    excerpt_ar:
      'كيف يمكن للمؤسسات الأكاديمية إعداد المنصات وأنظمة الطلاب وتجارب التعلم المستقبلية.',
    category: INSIGHT_CATEGORIES.educationTechnology,
    category_ar: INSIGHT_CATEGORIES_AR.educationTechnology,
    coverImage: '/assets/insights/placeholder.png',
    publishDate: '2026-02-20',
    readingTime: '6 min read',
    featured: true,
    language: 'en',
    seo: {
      title: 'Designing digital foundations for modern learning | Sidrah Soft',
      description:
        'How academic institutions can prepare platforms, student systems, and future learning experiences.',
    },
  },
  {
    id: '4',
    slug: 'ai-from-experiment-to-production',
    title: 'Moving AI from experiment to production',
    title_ar: 'نقل الذكاء الاصطناعي من التجربة إلى الإنتاج',
    excerpt:
      'Practical steps for taking machine-learning prototypes into reliable, maintainable production systems.',
    excerpt_ar:
      'خطوات عملية لنقل نماذج تعلم الآلة من النماذج الأولية إلى أنظمة إنتاج موثوقة وقابلة للصيانة.',
    category: INSIGHT_CATEGORIES.ai,
    category_ar: INSIGHT_CATEGORIES_AR.ai,
    coverImage: '/assets/insights/placeholder.png',
    publishDate: '2026-03-05',
    readingTime: '7 min read',
    featured: false,
    language: 'en',
    seo: {
      title: 'Moving AI from experiment to production | Sidrah Soft',
      description:
        'Practical steps for taking machine-learning prototypes into reliable, maintainable production systems.',
    },
  },
  {
    id: '5',
    slug: 'mobile-apps-that-enterprises-actually-use',
    title: 'Mobile apps that enterprises actually use',
    title_ar: 'تطبيقات جوال تستخدمها المؤسسات فعلياً',
    excerpt:
      'What makes internal and customer-facing mobile applications succeed inside large organizations.',
    excerpt_ar:
      'ما الذي يجعل تطبيقات الجوال الداخلية والموجهة للعملاء تنجح داخل المؤسسات الكبيرة.',
    category: INSIGHT_CATEGORIES.mobileApps,
    category_ar: INSIGHT_CATEGORIES_AR.mobileApps,
    coverImage: '/assets/insights/placeholder.png',
    publishDate: '2026-03-18',
    readingTime: '5 min read',
    featured: false,
    language: 'en',
    seo: {
      title: 'Mobile apps that enterprises actually use | Sidrah Soft',
      description:
        'What makes internal and customer-facing mobile applications succeed inside large organizations.',
    },
  },
];

export default insights;
