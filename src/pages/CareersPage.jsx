import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';
import { useJobs } from '../hooks/useJobs';
import getBilingualField from '../utils/getBilingualField';

const careerCards = [
  {
    slug: 'software-engineering',
    title: 'Software Engineering',
    title_ar: 'هندسة البرمجيات',
    department: 'Software Engineering',
    department_ar: 'هندسة البرمجيات',
    location: '',
    employmentType: 'other',
    workplaceType: 'hybrid',
    experienceLevel: 'unspecified',
    shortDescription:
      'Build scalable web platforms, enterprise applications, and next-generation digital products.',
    shortDescription_ar:
      'بناء منصات ويب قابلة للتوسع وتطبيقات مؤسسية ومنتجات رقمية من الجيل القادم.',
    applicationMethod: 'contact_page',
    applicationUrl: '#contact',
    applicationEmail: '',
  },
  {
    slug: 'ai-automation',
    title: 'AI & Automation',
    title_ar: 'الذكاء الاصطناعي والأتمتة',
    department: 'AI & Automation',
    department_ar: 'الذكاء الاصطناعي والأتمتة',
    location: '',
    employmentType: 'other',
    workplaceType: 'hybrid',
    experienceLevel: 'unspecified',
    shortDescription:
      'Design intelligent systems, automation workflows, and AI-powered solutions.',
    shortDescription_ar:
      'تصميم أنظمة ذكية وسير عمل مؤتمت وحلول مدعومة بالذكاء الاصطناعي.',
    applicationMethod: 'contact_page',
    applicationUrl: '#contact',
    applicationEmail: '',
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    title_ar: 'تصميم واجهات وتجربة المستخدم',
    department: 'UI/UX Design',
    department_ar: 'تصميم واجهات وتجربة المستخدم',
    location: '',
    employmentType: 'other',
    workplaceType: 'hybrid',
    experienceLevel: 'unspecified',
    shortDescription:
      'Craft intuitive experiences, interfaces, and digital journeys that users love.',
    shortDescription_ar:
      'صياغة تجارب بديهية وواجهات ورحلات رقمية يحبها المستخدمون.',
    applicationMethod: 'contact_page',
    applicationUrl: '#contact',
    applicationEmail: '',
  },
  {
    slug: 'business-operations',
    title: 'Business & Operations',
    title_ar: 'الأعمال والعمليات',
    department: 'Business & Operations',
    department_ar: 'الأعمال والعمليات',
    location: '',
    employmentType: 'other',
    workplaceType: 'hybrid',
    experienceLevel: 'unspecified',
    shortDescription:
      'Support growth, partnerships, project delivery, and operational excellence.',
    shortDescription_ar:
      'دعم النمو والشراكات وتسليم المشاريع والتميز التشغيلي.',
    applicationMethod: 'contact_page',
    applicationUrl: '#contact',
    applicationEmail: '',
  },
];

const employmentTypeLabels = {
  en: {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
    temporary: 'Temporary',
    other: 'Other',
  },
  ar: {
    full_time: 'دوام كامل',
    part_time: 'دوام جزئي',
    contract: 'عقد',
    internship: 'تدريب',
    freelance: 'عمل حر',
    temporary: 'مؤقت',
    other: 'أخرى',
  },
};

const workplaceTypeLabels = {
  en: {
    onsite: 'On-site',
    remote: 'Remote',
    hybrid: 'Hybrid',
  },
  ar: {
    onsite: 'في الموقع',
    remote: 'عن بُعد',
    hybrid: 'هجين',
  },
};

const experienceLevelLabels = {
  en: {
    entry: 'Entry-level',
    junior: 'Junior',
    mid: 'Mid-level',
    senior: 'Senior',
    lead: 'Lead',
    manager: 'Manager',
    unspecified: 'Unspecified',
  },
  ar: {
    entry: 'مبتدئ',
    junior: 'مبتدئ+',
    mid: 'متوسط',
    senior: 'خبير',
    lead: 'قائد فريق',
    manager: 'مدير',
    unspecified: 'غير محدد',
  },
};

function getBadgeLabel(labels, value, lang) {
  return labels[lang]?.[value] || labels.en?.[value] || value;
}

function CareersPage() {
  const { jobs, loading } = useJobs();
  const { lang, t, dir } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const displayJobs = jobs || careerCards;
  const hasCmsData = jobs !== null;

  const handleAnchorNav = (target) => {
    if (location.pathname !== '/') {
      navigate(`/#${target}`);
      return;
    }
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApply = (job) => {
    if (job.applicationMethod === 'external_url' && job.applicationUrl) {
      window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (job.applicationMethod === 'email' && job.applicationEmail) {
      window.location.href = `mailto:${job.applicationEmail}`;
      return;
    }
    handleAnchorNav('contact');
  };

  return (
    <>
      <SEO
        title={t('careers.pageTitle')}
        description={t('careers.pageIntro')}
        canonical="/careers"
        breadcrumbItems={[
          { name: 'Home', url: '/' },
          { name: 'Careers', url: '/careers' },
        ]}
      />
      <Header />
      <main className="careers-page" dir={dir}>
        <section className="careers-page-hero">
          <div className="careers-page-hero-content">
            <h1 className="careers-page-title">{t('careers.pageTitle')}</h1>
            <p className="careers-page-intro">{t('careers.pageIntro')}</p>
          </div>
        </section>

        <section className="careers-page-listing">
          <div className="careers-page-content">
            {hasCmsData && displayJobs.length === 0 ? (
              <div className="careers-empty-state">
                <h2 className="careers-empty-state__title">
                  {t('careers.noJobsTitle')}
                </h2>
                <p className="careers-empty-state__text">
                  {t('careers.noJobsText')}
                </p>
              </div>
            ) : (
              <div className="careers-page-grid">
                {displayJobs.map((job, index) => (
                  <article
                    key={job.slug}
                    className="career-listing-card"
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <div className="career-listing-card__header">
                      <h2 className="career-listing-card__title">
                        {(lang === 'ar' && job.title_ar) ? job.title_ar : job.title}
                      </h2>
                      {job.department && (
                        <span className="career-listing-card__department">
                          {getBilingualField(job, 'department', lang) || job.department}
                        </span>
                      )}
                    </div>

                    <div className="career-listing-card__meta">
                      {job.location && (
                        <span className="career-listing-card__meta-item">
                          {job.location}
                        </span>
                      )}
                      <span className="career-listing-card__meta-item">
                        {getBadgeLabel(employmentTypeLabels, job.employmentType, lang)}
                      </span>
                      <span className="career-listing-card__meta-item">
                        {getBadgeLabel(workplaceTypeLabels, job.workplaceType, lang)}
                      </span>
                      <span className="career-listing-card__meta-item">
                        {getBadgeLabel(experienceLevelLabels, job.experienceLevel, lang)}
                      </span>
                    </div>

                    {job.shortDescription && (
                      <p className="career-listing-card__description">
                        {(lang === 'ar' && job.shortDescription_ar) ? job.shortDescription_ar : job.shortDescription}
                      </p>
                    )}

                    <button
                      type="button"
                      className="career-listing-card__apply"
                      onClick={() => handleApply(job)}
                    >
                      {t('careers.applyButton')}
                    </button>
                  </article>
                ))}
              </div>
            )}

            {loading && hasCmsData === false && (
              <p className="careers-page-loading" aria-live="polite">
                {t('careers.loadingText')}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CareersPage;
