export const CASE_STUDY_INDUSTRIES = {
  all: 'All',
  enterprise: 'Enterprise Operations',
  education: 'Education Technology',
  ai: 'AI & Automation',
  healthcare: 'Healthcare',
  logistics: 'Logistics',
};

export const CASE_STUDY_INDUSTRIES_AR = {
  all: 'الكل',
  enterprise: 'عمليات المؤسسات',
  education: 'تقنية التعليم',
  ai: 'الذكاء الاصطناعي والأتمتة',
  healthcare: 'الرعاية الصحية',
  logistics: 'الخدمات اللوجستية',
};

export function getBilingualCaseStudyIndustry(industry, lang) {
  if (lang === 'ar') {
    const entry = Object.entries(CASE_STUDY_INDUSTRIES).find(([, v]) => v === industry);
    if (entry) return CASE_STUDY_INDUSTRIES_AR[entry[0]] || industry;
  }
  return industry;
}

export const CASE_STUDY_SORT_OPTIONS = {
  newest: 'Newest',
  oldest: 'Oldest',
  featured: 'Featured',
};

export const caseStudies = [
  {
    id: '1',
    slug: 'enterprise-erp-transformation',
    title: 'Enterprise ERP Transformation',
    title_ar: 'تحويل نظام تخطيط موارد المؤسسة',
    clientName: 'Confidential Enterprise Client',
    industry: CASE_STUDY_INDUSTRIES.enterprise,
    excerpt:
      'Unified disconnected processes into a centralized ERP and workflow automation platform.',
    excerpt_ar:
      'توحيد العمليات غير المتصلة في منصة مركزية لتخطيط الموارد وأتمتة سير العمل.',
    problem: 'Disconnected processes and fragmented data.',
    problem_ar: 'عمليات غير متصلة وبيانات مجزأة.',
    solution: 'Centralized ERP and workflow automation.',
    solution_ar: 'نظام مركزي لتخطيط الموارد وأتمتة سير العمل.',
    technologies: ['ERP', 'Integrations', 'Automation'],
    outcome: 'Improved visibility and faster operational decisions.',
    outcome_ar: 'تحسين الرؤية واتخاذ قرارات تشغيلية أسرع.',
    metrics: ['40% faster reporting', 'Unified data layer'],
    coverImage: '/assets/case-studies/placeholder.png',
    featured: true,
    publishDate: '2026-01-10',
    language: 'en',
    seo: {
      title: 'Enterprise ERP Transformation | Sidrah Soft',
      description:
        'How Sidrah Soft unified disconnected processes into a centralized ERP and workflow automation platform.',
    },
  },
  {
    id: '2',
    slug: 'education-learning-platform',
    title: 'Education Learning Platform',
    title_ar: 'منصة التعلم التعليمية',
    clientName: 'Vision & AlQalam Education Network',
    industry: CASE_STUDY_INDUSTRIES.education,
    excerpt:
      'Unified learning and student management platform for modern academic institutions.',
    excerpt_ar:
      'منصة موحدة للتعلم وإدارة الطلاب للمؤسسات الأكاديمية الحديثة.',
    problem: 'Manual academic workflows and limited digital access.',
    problem_ar: 'سير عمل أكاديمي يدوي ووصول رقمي محدود.',
    solution: 'Unified learning and student management platform.',
    solution_ar: 'منصة موحدة للتعلم وإدارة الطلاب.',
    technologies: ['Web Platform', 'Student Systems', 'Cloud'],
    outcome: 'Better accessibility and streamlined academic operations.',
    outcome_ar: 'إمكانية وصول أفضل وعمليات أكاديمية مبسطة.',
    metrics: ['3x student engagement', 'Paperless admissions'],
    coverImage: '/assets/case-studies/placeholder.png',
    featured: true,
    publishDate: '2026-01-22',
    language: 'en',
    seo: {
      title: 'Education Learning Platform | Sidrah Soft',
      description:
        'How Sidrah Soft built a unified learning and student management platform for academic institutions.',
    },
  },
  {
    id: '3',
    slug: 'ai-assisted-workflows',
    title: 'AI-Assisted Workflow Automation',
    title_ar: 'أتمتة سير العمل بمساعدة الذكاء الاصطناعي',
    clientName: 'Confidential Operations Client',
    industry: CASE_STUDY_INDUSTRIES.ai,
    excerpt:
      'Automated repetitive manual tasks using AI-assisted workflows and process intelligence.',
    excerpt_ar:
      'أتمتة المهام اليدوية المتكررة باستخدام سير العمل بمساعدة الذكاء الاصطناعي وذكاء العمليات.',
    problem: 'Repetitive manual tasks consuming team resources.',
    problem_ar: 'مهام يدوية متكررة تستهلك موارد الفريق.',
    solution: 'AI-assisted workflows and automated processes.',
    solution_ar: 'سير عمل بمساعدة الذكاء الاصطناعي وعمليات مؤتمتة.',
    technologies: ['AI', 'Automation', 'Analytics'],
    outcome: 'Reduced operational overhead and improved efficiency.',
    outcome_ar: 'تقليل العبء التشغيلي وتحسين الكفاءة.',
    metrics: ['60% time savings', '24/7 automated processing'],
    coverImage: '/assets/case-studies/placeholder.png',
    featured: true,
    publishDate: '2026-02-05',
    language: 'en',
    seo: {
      title: 'AI-Assisted Workflow Automation | Sidrah Soft',
      description:
        'How Sidrah Soft used AI-assisted workflows to reduce operational overhead and improve efficiency.',
    },
  },
  {
    id: '4',
    slug: 'healthcare-appointment-system',
    title: 'Healthcare Appointment & Records System',
    title_ar: 'نظام المواعيد والسجلات الصحية',
    clientName: 'Regional Healthcare Provider',
    industry: CASE_STUDY_INDUSTRIES.healthcare,
    excerpt:
      'Modernized patient scheduling and records access for a regional healthcare provider.',
    excerpt_ar:
      'تحديث جدولة المرضى والوصول إلى السجلات لمقدم رعاية صحية إقليمي.',
    problem: 'Manual appointment scheduling and fragmented patient records.',
    problem_ar: 'جدولة مواعيد يدوية وسجلات مرضى مجزأة.',
    solution: 'Integrated appointment and electronic records system.',
    solution_ar: 'نظام متكامل للمواعيد والسجلات الإلكترونية.',
    technologies: ['Web Platform', 'HIPAA-ready Cloud', 'Integrations'],
    outcome: 'Shorter wait times and more reliable record access.',
    outcome_ar: 'أوقات انتظار أقصر ووصول أكثر موثوقية للسجلات.',
    metrics: ['50% fewer no-shows', 'Centralized records'],
    coverImage: '/assets/case-studies/placeholder.png',
    featured: false,
    publishDate: '2026-02-18',
    language: 'en',
    seo: {
      title: 'Healthcare Appointment & Records System | Sidrah Soft',
      description:
        'How Sidrah Soft modernized patient scheduling and records access for a regional healthcare provider.',
    },
  },
  {
    id: '5',
    slug: 'logistics-tracking-platform',
    title: 'Logistics Tracking Platform',
    title_ar: 'منصة تتبع الخدمات اللوجستية',
    clientName: 'Regional Logistics Operator',
    industry: CASE_STUDY_INDUSTRIES.logistics,
    excerpt:
      'Real-time shipment tracking and fleet coordination platform for a logistics operator.',
    excerpt_ar:
      'منصة تتبع الشحنات في الوقت الفعلي وتنسيق الأسطول لمشغل لوجستي.',
    problem: 'Limited visibility into shipment status and fleet coordination.',
    problem_ar: 'رؤية محدودة لحالة الشحنات وتنسيق الأسطول.',
    solution: 'Real-time tracking platform with fleet dashboards.',
    solution_ar: 'منصة تتبع في الوقت الفعلي مع لوحات تحكم للأسطول.',
    technologies: ['Mobile Apps', 'Maps API', 'Cloud'],
    outcome: 'Improved delivery reliability and fleet utilization.',
    outcome_ar: 'تحسين موثوقية التوصيل واستغلال الأسطول.',
    metrics: ['30% faster deliveries', 'Live fleet visibility'],
    coverImage: '/assets/case-studies/placeholder.png',
    featured: false,
    publishDate: '2026-03-02',
    language: 'en',
    seo: {
      title: 'Logistics Tracking Platform | Sidrah Soft',
      description:
        'How Sidrah Soft delivered real-time shipment tracking and fleet coordination for a logistics operator.',
    },
  },
];

export default caseStudies;
