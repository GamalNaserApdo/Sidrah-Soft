export const SITE = {
  name: 'Sidrah Soft',
  baseUrl: 'https://sidrahsoft.com',
  defaultTitle: 'Sidrah Soft | Business Automation',
  defaultDescription:
    'SidrahSoft helps organizations accelerate growth through business automation, ERP systems, AI solutions, software development, digital transformation, and professional training programs.',
  keywords:
    'Business Automation, ERP Systems, AI Solutions, Software Development, Digital Transformation, Training Programs, Enterprise Software, SidrahSoft',
  ogImage: '/assets/og-default.png',
  twitterCard: 'summary_large_image',
  email: 'sidrahsoft@gmail.com',
  logo: '/assets/logo.svg',
  sameAs: [
    'https://linkedin.com/company/PLACEHOLDER',
    'https://wa.me/PLACEHOLDER',
  ],
};

export const PAGES = {
  home: {
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    keywords: SITE.keywords,
    ogImage: SITE.ogImage,
    canonical: '/',
  },
  training: {
    title: 'Professional Training Programs | Sidrah Soft',
    description:
      'Practical technology training designed to prepare students and professionals for real-world software development and digital transformation projects.',
    keywords:
      'Training Programs, Software Development Training, Python, React, Flutter, C++, Digital Transformation',
    ogImage: '/assets/og-training.png',
    canonical: '/training',
  },
  insights: {
    title: 'Insights | Sidrah Soft',
    description:
      'Thoughts, updates, and technical insights from the Sidrah Soft team.',
    keywords: 'Insights, Blog, Technology, Business Automation',
    ogImage: '/assets/og-insights.png',
    canonical: '/insights',
  },
  caseStudies: {
    title: 'Case Studies | Sidrah Soft',
    description:
      'Explore how Sidrah Soft helps organizations automate, transform, and grow with custom software and AI solutions.',
    keywords:
      'Case Studies, Software Development, Digital Transformation, Business Automation',
    ogImage: '/assets/og-case-studies.png',
    canonical: '/case-studies',
  },
  careers: {
    title: 'Careers | Sidrah Soft',
    description:
      'Join the Sidrah Soft team. Explore open positions in software engineering, AI automation, and digital transformation.',
    keywords:
      'Careers, Jobs, Software Engineering, AI Automation, Digital Transformation',
    ogImage: '/assets/og-careers.png',
    canonical: '/careers',
  },
};

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
