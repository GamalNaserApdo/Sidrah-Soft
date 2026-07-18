import { useMemo } from 'react';
import { useJobs } from '../../hooks/useJobs';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import getBilingual from '../../utils/getBilingual';
import getBilingualField from '../../utils/getBilingualField';
import SectionHeading from '../ui/SectionHeading';

const careerCards = [
  {
    title: 'Software Engineering',
    title_ar: 'هندسة البرمجيات',
    description:
      'Build scalable web platforms, enterprise applications, and next-generation digital products.',
    description_ar:
      'بناء منصات ويب قابلة للتوسع وتطبيقات مؤسسية ومنتجات رقمية من الجيل القادم.',
  },
  {
    title: 'AI & Automation',
    title_ar: 'الذكاء الاصطناعي والأتمتة',
    description:
      'Design intelligent systems, automation workflows, and AI-powered solutions.',
    description_ar:
      'تصميم أنظمة ذكية وسير عمل مؤتمت وحلول مدعومة بالذكاء الاصطناعي.',
  },
  {
    title: 'UI/UX Design',
    title_ar: 'تصميم واجهات وتجربة المستخدم',
    description:
      'Craft intuitive experiences, interfaces, and digital journeys that users love.',
    description_ar:
      'صياغة تجارب بديهية وواجهات ورحلات رقمية يحبها المستخدمون.',
  },
  {
    title: 'Business & Operations',
    title_ar: 'الأعمال والعمليات',
    description:
      'Support growth, partnerships, project delivery, and operational excellence.',
    description_ar:
      'دعم النمو والشراكات وتسليم المشاريع والتميز التشغيلي.',
  },
];

function CareersSection() {
  const { jobs } = useJobs({ filters: { show_on_homepage: true } });
  const { config } = useHomepageConfig();
  const { lang } = useI18n();

  const careersHeading = config?.headings?.careers;
  const heading = lang === 'ar'
    ? (careersHeading?.heading_ar || 'ابنِ المستقبل مع SidrahSoft')
    : (careersHeading?.heading_en || 'Build the future with SidrahSoft');

  const description = lang === 'ar'
    ? (careersHeading?.description_ar || 'نبني أنظمة رقمية ومنصات تعليمية وحلول أتمتة للمؤسسات التي تستعد للمستقبل.')
    : (careersHeading?.description_en || 'We are building digital systems, learning platforms, and automation solutions for organizations preparing for the future.');

  const cultureStatement = lang === 'ar'
    ? 'نحن نبحث عن أشخاص يريدون أن يكون عملهم له معنى — مهندسون ومصممون ومفكرون يؤمنون بأن التكنولوجيا يجب أن تخدم الناس.'
    : 'We look for people who want their work to matter — engineers, designers, and thinkers who believe technology should serve people.';

  const cultureThemes = lang === 'ar'
    ? [
        { title: 'النمو', text: 'نتطور مع كل مشروع — مهارات جديدة، تحديات جديدة، حلول جديدة.' },
        { title: 'التعلم', text: 'التعلم المستمر جزء من ثقافتنا، ليس نشاطاً إضافياً.' },
        { title: 'الأثر', text: 'نبني أنظمة يستخدمها الناس فعلاً — منصات تعليمية، أدوات مؤسسية، حلول أتمتة.' },
      ]
    : [
        { title: 'Growth', text: 'We grow with every project — new skills, new challenges, new solutions.' },
        { title: 'Learning', text: 'Continuous learning is part of how we work, not an add-on.' },
        { title: 'Impact', text: 'We build systems people actually use — learning platforms, enterprise tools, automation solutions.' },
      ];

  const allJobs = useMemo(() => jobs || careerCards, [jobs]);

  const featuredJob = useMemo(() => {
    const featured = allJobs.find((j) => j.isFeatured || j.featured);
    return featured || allJobs[0];
  }, [allJobs]);

  const supportingJobs = useMemo(
    () => allJobs.filter((j) => j !== featuredJob).slice(0, 4),
    [allJobs, featuredJob]
  );

  const handleCtaClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const featuredTitle = (lang === 'ar' && featuredJob?.title_ar) ? featuredJob.title_ar : (featuredJob?.title || '');
  const featuredDept = getBilingualField(featuredJob, 'department', lang);
  const featuredLocation = featuredJob?.location || '';
  const featuredType = getBilingualField(featuredJob, 'employmentType', lang) || featuredJob?.employmentType || '';
  const featuredLevel = getBilingualField(featuredJob, 'level', lang) || getBilingualField(featuredJob, 'seniority', lang) || '';
  const featuredDesc = (lang === 'ar' && featuredJob?.description_ar) ? featuredJob.description_ar : (featuredJob?.shortDescription || featuredJob?.description || '');
  const featuredApplyUrl = featuredJob?.applicationUrl || '#contact';
  const featuredApplyMethod = featuredJob?.applicationMethod || 'contact_page';

  return (
    <section id="careers" className="careers-section" aria-labelledby="careers-heading">
      <div className="careers-content">
        <SectionHeading
          id="careers-heading"
          index="10"
          eyebrow={lang === 'ar' ? 'وظائف' : 'Careers'}
          title={heading}
          description={description}
          className="careers-heading-block motion-clip-reveal is-visible"
        />

        <div className="careers-showcase">
          <div className="careers-culture">
            <p className="careers-culture__statement motion-fade-up is-visible">
              {cultureStatement}
            </p>
            <div className="careers-culture__themes">
              {cultureThemes.map((theme, idx) => (
                <div
                  key={theme.title}
                  className={`careers-culture__theme motion-fade-up is-visible stagger-${Math.min(idx + 1, 6)}`}
                >
                  <span className="careers-culture__theme-title">{theme.title}</span>
                  <span className="careers-culture__theme-text">{theme.text}</span>
                </div>
              ))}
            </div>
          </div>

          {featuredJob && (
            <a
              href={featuredApplyMethod === 'external_url' ? featuredApplyUrl : '#contact'}
              onClick={featuredApplyMethod !== 'external_url' ? handleCtaClick : undefined}
              className="career-featured card-base card-surface-premium card-edge-copper card-hover-glow card-padding-lg motion-scale-in is-visible"
              aria-label={`${lang === 'ar' ? 'التقديم على' : 'Apply for'}: ${featuredTitle}`}
              {...(featuredApplyMethod === 'external_url' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <div className="career-featured__topline">
                <span className="career-featured__badge">
                  {lang === 'ar' ? 'فرصة مميزة' : 'Featured Opportunity'}
                </span>
                <span className="career-featured__number" aria-hidden="true">01</span>
              </div>
              <div className="career-featured__body">
                <h3 className="career-featured__title">{featuredTitle}</h3>
                <div className="career-featured__details">
                  {featuredDept && (
                    <span className="career-featured__detail">
                      <span className="career-featured__detail-label">{lang === 'ar' ? 'القسم' : 'Department'}</span>
                      <span className="career-featured__detail-value">{featuredDept}</span>
                    </span>
                  )}
                  {featuredLocation && (
                    <span className="career-featured__detail">
                      <span className="career-featured__detail-label">{lang === 'ar' ? 'الموقع' : 'Location'}</span>
                      <span className="career-featured__detail-value">{featuredLocation}</span>
                    </span>
                  )}
                  {featuredType && (
                    <span className="career-featured__detail">
                      <span className="career-featured__detail-label">{lang === 'ar' ? 'النوع' : 'Type'}</span>
                      <span className="career-featured__detail-value">{featuredType}</span>
                    </span>
                  )}
                  {featuredLevel && (
                    <span className="career-featured__detail">
                      <span className="career-featured__detail-label">{lang === 'ar' ? 'المستوى' : 'Level'}</span>
                      <span className="career-featured__detail-value">{featuredLevel}</span>
                    </span>
                  )}
                </div>
                {featuredDesc && (
                  <p className="career-featured__description">{featuredDesc}</p>
                )}
                <span className="career-featured__cta">
                  {lang === 'ar' ? 'تقديم الآن' : 'Apply Now'}
                  <span className="career-featured__cta-arrow" aria-hidden="true">→</span>
                </span>
              </div>
            </a>
          )}
        </div>

        {supportingJobs.length > 0 && (
          <div className="careers-open-positions">
            <h3 className="careers-open-positions__heading motion-fade-up is-visible">
              {lang === 'ar' ? 'المناصب الشاغرة' : 'Open Positions'}
            </h3>
            <div className="careers-open-positions__grid">
              {supportingJobs.map((job, idx) => {
                const title = (lang === 'ar' && job.title_ar) ? job.title_ar : (job.title || '');
                const dept = getBilingualField(job, 'department', lang);
                const location = job.location || '';
                const type = getBilingualField(job, 'employmentType', lang) || job.employmentType || '';
                const level = getBilingualField(job, 'level', lang) || getBilingualField(job, 'seniority', lang) || '';
                const desc = (lang === 'ar' && job.description_ar) ? job.description_ar : (job.shortDescription || job.description || '');
                const applyUrl = job.applicationUrl || '#contact';
                const applyMethod = job.applicationMethod || 'contact_page';
                const isExternal = applyMethod === 'external_url';

                return (
                  <a
                    key={job.slug || job.title || idx}
                    href={isExternal ? applyUrl : '#contact'}
                    onClick={isExternal ? undefined : handleCtaClick}
                    className={`career-position card-base card-surface-solid card-edge-gold card-hover-lift card-padding-md motion-fade-up is-visible stagger-${Math.min(idx + 1, 6)}`}
                    aria-label={`${lang === 'ar' ? 'التقديم على' : 'Apply for'}: ${title}`}
                    {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <div className="career-position__header">
                      <h4 className="career-position__title">{title}</h4>
                      <span className="career-position__arrow" aria-hidden="true">→</span>
                    </div>
                    <div className="career-position__meta">
                      {dept && <span className="career-position__meta-item">{dept}</span>}
                      {location && <span className="career-position__meta-item">{location}</span>}
                      {type && <span className="career-position__meta-item">{type}</span>}
                      {level && <span className="career-position__meta-item">{level}</span>}
                    </div>
                    {desc && <p className="career-position__description">{desc}</p>}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="careers-open-cta motion-fade-in is-visible">
          <p className="careers-open-cta__text">
            {lang === 'ar'
              ? 'لا ترى الدور المناسب؟ نحن دائماً مهتمون بمقابلة أشخاص استثنائيين.'
              : "Don't see the right role? We're always interested in meeting exceptional people."}
          </p>
          <a
            href="#contact"
            onClick={handleCtaClick}
            className="careers-open-cta__button"
          >
            {lang === 'ar' ? 'تواصل معنا' : 'Get In Touch'}
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default CareersSection;
