import brandLogo from '../assets/logo.png';

export const SITE = {
  name: 'Sidrah Soft',
  baseUrl: 'https://sidrahsoft.com',
  defaultTitle: 'Software Development Company in Egypt | Sidrah Soft',
  defaultDescription:
    'Sidrah Soft is a software development company in Egypt building custom software, web and mobile applications, AI automation, and business solutions for growing organizations.',
  keywords:
    'Software Development Company Egypt, Custom Software Development, Web Application Development, Mobile App Development, AI Automation, Business Automation, Software Solutions Egypt',
  ogImage: '/assets/og-default.png',
  twitterCard: 'summary_large_image',
  email: 'sidrahsoft@gmail.com',
  logo: brandLogo,
  sameAs: [
    'https://www.linkedin.com/company/sidrahsoft/',
    'https://wa.me/201027285487',
  ],
};

export const PAGES = {
  home: {
    title: 'Software Development Company in Egypt | Sidrah Soft',
    titleAr: 'شركة تطوير برمجيات في مصر | Sidrah Soft',
    description:
      'Sidrah Soft is a software development company in Egypt building custom software, web and mobile applications, AI automation, and business solutions for growing organizations.',
    descriptionAr:
      'سِدرة سوفت شركة تطوير برمجيات في مصر نبني الأنظمة البرمجية المخصصة وتطبيقات الويب والجوال وحلول الذكاء الاصطناعي والأتمتة للمؤسسات النامية.',
    keywords: SITE.keywords,
    ogImage: SITE.ogImage,
    canonical: '/',
  },
  aiAutomation: {
    title: 'AI Automation Services in Egypt | Sidrah Soft',
    titleAr: 'أتمتة الأعمال بالذكاء الاصطناعي | Sidrah Soft',
    description:
      'AI automation services in Egypt — workflow automation, AI agents, business process automation, and intelligent integration with your existing systems.',
    descriptionAr:
      'خدمات أتمتة الذكاء الاصطناعي في مصر — أتمتة سير العمل، وكلاء الذكاء الاصطناعي، أتمتة العمليات، والتكامل الذكي مع أنظمتك الحالية.',
    keywords:
      'AI Automation Services Egypt, Business Automation, Workflow Automation, AI Agents for Business, AI Integration Services, Business Process Automation',
    ogImage: '/assets/og-default.png',
    canonical: '/services/ai-automation',
  },
  services: {
    title: 'Software Development Services | Sidrah Soft',
    titleAr: 'خدمات تطوير البرمجيات | Sidrah Soft',
    description:
      'Explore Sidrah Soft services — web development, mobile apps, ERP systems, AI automation, custom software, data analytics, and system integration.',
    descriptionAr:
      'اكتشف خدمات Sidrah Soft — تطوير الويب، تطبيقات الجوال، أنظمة ERP، أتمتة الذكاء الاصطناعي، البرمجيات المخصصة، البيانات والتحليلات، وتكامل الأنظمة.',
    keywords:
      'Software Development Services, Web Development, Mobile Apps, ERP Systems, AI Automation, Custom Software, Data Analytics, System Integration',
    ogImage: '/assets/og-default.png',
    canonical: '/services',
  },
  training: {
    title: 'Programming & Technology Courses in Egypt | Sidrah Soft',
    titleAr: 'كورسات برمجة وتكنولوجيا في مصر | Sidrah Soft',
    description:
      'Practical programming and technology courses in Egypt. Learn frontend, backend, Flutter, Python, C++, problem solving, and DevOps with real-world project training.',
    descriptionAr:
      'كورسات برمجة وتكنولوجيا عملية في مصر. تعلّم تطوير الواجهات والواجهات الخلفية وFlutter وPython وC++ وحل المشكلات وDevOps بمشاريع حقيقية.',
    keywords:
      'Programming Courses Egypt, Technology Training Egypt, Software Development Courses, Practical Tech Training, Software Engineering Training',
    ogImage: '/assets/og-training.png',
    canonical: '/training',
  },
  trainingStarter: {
    title: 'Sidrah Starter Courses | Beginner Programming Courses | Sidrah Soft',
    titleAr: 'كورسات Sidrah للمبتدئين | كورسات برمجة للمبتدئين | Sidrah Soft',
    description:
      'Start a tech field from zero with Sidrah Starter Courses. 6-week beginner courses with 12 live sessions and a practical project.',
    descriptionAr:
      'ابدأ مجالك التقني من الصفر مع كورسات Sidrah للمبتدئين. كورسات 6 أسابيع للمبتدئين مع 12 جلسة مباشرة ومشروع عملي.',
    keywords:
      'Beginner Programming Courses Egypt, Starter Courses, Learn to Code Egypt, Python for Beginners, Frontend for Beginners, Data Analysis Course',
    ogImage: '/assets/og-training.png',
    canonical: '/training/starter',
  },
  trainingOffers: {
    title: 'Training Offers | Sidrah Soft',
    titleAr: 'عروض التدريب | Sidrah Soft',
    description:
      'Current training offers and promotions from Sidrah Soft — limited-time discounts on professional courses, starter courses, and summer training programs.',
    descriptionAr:
      'عروض التدريب الحالية من Sidrah Soft — خصومات لفترة محدودة على الكورسات الاحترافية وكورسات المبتدئين وبرامج التدريب الصيفي.',
    keywords:
      'Training Offers, Course Discounts, Programming Course Offers, Tech Training Deals',
    ogImage: '/assets/og-training.png',
    canonical: '/training/offers',
  },
  insights: {
    title: 'Insights | Sidrah Soft',
    description:
      'Thoughts, updates, and technical insights from the Sidrah Soft team.',
    titleAr: 'المدونة | Sidrah Soft',
    descriptionAr:
      'مقالات وتحديثات ورؤى تقنية من فريق Sidrah Soft.',
    keywords: 'Insights, Blog, Technology, Business Automation',
    ogImage: '/assets/og-insights.png',
    canonical: '/insights',
  },
  caseStudies: {
    title: 'Case Studies | Sidrah Soft',
    description:
      'Explore how Sidrah Soft helps organizations automate, transform, and grow with custom software and AI solutions.',
    titleAr: 'دراسات الحالة | Sidrah Soft',
    descriptionAr:
      'اكتشف كيف تساعد Sidrah Soft المؤسسات على الأتمتة والتحول والنمو عبر برمجيات مخصصة وحلول الذكاء الاصطناعي.',
    keywords:
      'Case Studies, Software Development, Digital Transformation, Business Automation',
    ogImage: '/assets/og-case-studies.png',
    canonical: '/case-studies',
  },
  careers: {
    title: 'Careers | Sidrah Soft',
    description:
      'Join the Sidrah Soft team. Explore open positions in software engineering, AI automation, and digital transformation.',
    titleAr: 'الوظائف | Sidrah Soft',
    descriptionAr:
      'انضم إلى فريق Sidrah Soft. استكشف الوظائف المتاحة في هندسة البرمجيات والذكاء الاصطناعي والأتمتة.',
    keywords:
      'Careers, Jobs, Software Engineering, AI Automation, Digital Transformation',
    ogImage: '/assets/og-careers.png',
    canonical: '/careers',
  },
};

// Snake_case alias so useStaticPageSEO('training_offers', lang) resolves.
// CMS static-page-seo API uses snake_case keys; seo.js PAGES uses camelCase.
PAGES.training_offers = PAGES.trainingOffers;

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.baseUrl,
    logo: `${SITE.baseUrl}${SITE.logo}`,
    email: SITE.email,
    sameAs: SITE.sameAs,
  };
}

/**
 * Resolve a PAGES entry to the active language's title/description.
 * Falls back to English if Arabic fields are not defined.
 */
export function resolvePageSEO(pageKey, lang) {
  const page = PAGES[pageKey];
  if (!page) return { title: '', description: '' };
  const isAr = lang === 'ar';
  return {
    title: isAr ? (page.titleAr || page.title) : page.title,
    description: isAr ? (page.descriptionAr || page.description) : page.description,
    keywords: page.keywords,
    ogImage: page.ogImage,
    canonical: page.canonical,
  };
}
