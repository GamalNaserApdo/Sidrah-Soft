import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import MagneticButton from '../components/MagneticButton';
import { useI18n } from '../i18n/I18nProvider';
import { listPrograms } from '../services/trainingApi';

function SecondaryEducationPage() {
  const { lang, dir } = useI18n();
  const navigate = useNavigate();
  const isAr = lang === 'ar';

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await listPrograms({ branch: 'secondary' });
        if (mounted) {
          setPrograms(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setPrograms([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleContactClick = () => {
    navigate('/#contact');
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const audienceLevels = {
    first_secondary: isAr ? 'الصف الأول الثانوي' : 'First Secondary',
    second_secondary: isAr ? 'الصف الثاني الثانوي' : 'Second Secondary',
    baccalaureate: isAr ? 'البكالوريا' : 'Baccalaureate',
  };

  return (
    <>
      <SEO
        title={isAr ? 'تعليم الثانوية والبكالوريا | SidrahSoft' : 'Secondary & Baccalaureate Education | SidrahSoft'}
        description={isAr
          ? 'تعلّم البرمجة داخل بيئة شركة برمجيات حقيقية. برامج مصممة لطلاب الثانوية والبكالوريا.'
          : 'Learn programming inside a real software company ecosystem. Programs designed for secondary and baccalaureate students.'}
        canonical="/training/secondary"
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'التدريب والتعليم' : 'Training & Education', url: '/training' },
          { name: isAr ? 'الثانوية / البكالوريا' : 'Secondary / Baccalaureate' },
        ]}
      />
      <Header />
      <main className="secondary-page" dir={dir}>
        <section className="secondary-hero">
          <div className="secondary-hero__content">
            <span className="secondary-hero__eyebrow">
              {isAr ? 'سِدرة أكاديمي' : 'Sidrah Academy'}
            </span>
            <h1 className="secondary-hero__title">
              {isAr
                ? 'تعلّم البرمجة داخل شركة برمجيات حقيقية'
                : 'Learn Programming Inside a Real Software Company'}
            </h1>
            <p className="secondary-hero__subtitle">
              {isAr
                ? 'برامجنا للثانوية والبكالوريا لا تبدأ وتنتهي بالدروس النظرية. نفتح للطلاب نافذة حقيقية على طريقة تفكير المهندسين، وسير العمل، وحل المشكلات في مشاريع فعلية.'
                : 'Our secondary and baccalaureate programs do not begin and end with theory. We open a real window for students into engineering thinking, workflows, and problem-solving on real projects.'}
            </p>
            <div className="secondary-hero__ctas">
              <MagneticButton className="secondary-hero__cta" onClick={handleContactClick}>
                {isAr ? 'اسأل عن البرامج' : 'Ask About Programs'}
              </MagneticButton>
              <Link to="/training" className="secondary-hero__cta secondary-hero__cta--secondary">
                {isAr ? 'العودة إلى التدريب' : 'Back to Training'}
              </Link>
            </div>
          </div>
        </section>

        <section className="secondary-section">
          <div className="secondary-section__content">
            <h2 className="secondary-section__heading">
              {isAr ? 'لمن هذه البرامج؟' : 'Who Is This For?'}
            </h2>
            <div className="secondary-audience">
              {['first_secondary', 'second_secondary', 'baccalaureate'].map((level) => (
                <div key={level} className="secondary-audience-card">
                  <span className="secondary-audience-card__number">
                    {level === 'first_secondary' ? '01' : level === 'second_secondary' ? '02' : '03'}
                  </span>
                  <h3 className="secondary-audience-card__title">{audienceLevels[level]}</h3>
                  <p className="secondary-audience-card__text">
                    {level === 'first_secondary' && (isAr
                      ? 'خطواتك الأولى في البرمجة: منطق، أساسيات، وتفكير حاسوبي.'
                      : 'Your first steps in programming: logic, fundamentals, and computational thinking.')}
                    {level === 'second_secondary' && (isAr
                      ? 'بناء أساس برمجي أعمق مع لمسات من تطوير الويب والتطبيقات.'
                      : 'Building a deeper programming foundation with touches of web and app development.')}
                    {level === 'baccalaureate' && (isAr
                      ? 'تخصص أكثر، مشاريع عملية، واستعداد حقيقي للجامعة والسوق.'
                      : 'More specialization, practical projects, and real preparation for university and the market.')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="secondary-section secondary-section--alt">
          <div className="secondary-section__content">
            <h2 className="secondary-section__heading">
              {isAr ? 'لماذا سِدرة سوفت؟' : 'Why SidrahSoft?'}
            </h2>
            <div className="secondary-why-grid">
              {[
                {
                  title: isAr ? 'بيئة هندسية حقيقية' : 'A Real Engineering Environment',
                  text: isAr
                    ? 'الطلاب يرون كيف تُبنى الأنظمة، وكيف تُدار المهام، وكيف يعمل الفريق معاً.'
                    : 'Students see how systems are built, how tasks are managed, and how teams work together.',
                },
                {
                  title: isAr ? 'مدربون من صناعة البرمجيات' : 'Instructors From the Software Industry',
                  text: isAr
                    ? 'يُدرّس الطلاب مهندسون يعملون على مشاريع حقيقية، وليس فقط مدرّسين أكاديميين.'
                    : 'Students learn from engineers who work on real projects, not only academic instructors.',
                },
                {
                  title: isAr ? 'مشاكل حقيقية وتفكير عملي' : 'Real Problems & Practical Thinking',
                  text: isAr
                    ? 'نعلّم الطلاب كيف يحلّلون المشكلة ويفكّكونها بدلاً من حفظ خطوات جاهزة.'
                    : 'We teach students how to analyze and break down problems instead of memorizing ready steps.',
                },
                {
                  title: isAr ? 'أدوات وأساليب فرق العمل' : 'Team Tools & Workflows',
                  text: isAr
                    ? 'تعرّف على أدوات إدارة المهام، مراجعة الكود، والتحكم في الإصدارات كما تُستخدم في الشركات.'
                    : 'Get to know task management, code review, and version control tools as used in companies.',
                },
              ].map((item, idx) => (
                <div key={idx} className="secondary-why-card">
                  <h3 className="secondary-why-card__title">{item.title}</h3>
                  <p className="secondary-why-card__text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="secondary-section">
          <div className="secondary-section__content">
            <h2 className="secondary-section__heading">
              {isAr ? 'مسارات التعلم' : 'Learning Paths'}
            </h2>
            {loading && <p className="secondary-loading">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>}
            {error && (
              <div className="secondary-error">
                <p>{isAr ? 'تعذر تحميل البرامج. يرجى المحاولة لاحقاً.' : 'Could not load programs. Please try again later.'}</p>
              </div>
            )}
            {!loading && !error && programs.length === 0 && (
              <div className="secondary-empty">
                <p>{isAr ? 'البرامج قيد الإعداد. تواصل معنا لمعرفة المزيد.' : 'Programs are being prepared. Contact us to learn more.'}</p>
              </div>
            )}
            {programs.length > 0 && (
              <div className="secondary-programs-grid">
                {programs.map((program) => {
                  const title = isAr && program.title_ar ? program.title_ar : program.title_en;
                  const summary = isAr && program.short_description_ar ? program.short_description_ar : program.short_description_en;
                  const duration = isAr && program.duration_ar ? program.duration_ar : program.duration_en;
                  const format = isAr && program.format_ar ? program.format_ar : program.format_en;
                  return (
                    <Link to={`/training/secondary/${program.slug}`} key={program.slug} className="secondary-program-card">
                      {program.image_url && (
                        <div className="secondary-program-card__image-wrapper">
                          <img src={program.image_url} alt={title} className="secondary-program-card__image" loading="lazy" />
                        </div>
                      )}
                      <div className="secondary-program-card__body">
                        <h3 className="secondary-program-card__title">{title}</h3>
                        <p className="secondary-program-card__summary">{summary}</p>
                        <div className="secondary-program-card__meta">
                          {duration && <span className="secondary-program-card__meta-item">{duration}</span>}
                          {format && <span className="secondary-program-card__meta-item">{format}</span>}
                        </div>
                        <span className="secondary-program-card__cta">
                          {isAr ? 'اكتشف البرنامج' : 'Explore Program'}
                          <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="secondary-section secondary-section--alt">
          <div className="secondary-section__content">
            <h2 className="secondary-section__heading">
              {isAr ? 'منهجية التعلم' : 'Learning Approach'}
            </h2>
            <div className="secondary-approach">
              {[
                { step: '01', label: isAr ? 'أساسيات البرمجة' : 'Programming Fundamentals' },
                { step: '02', label: isAr ? 'حل المشكلات' : 'Problem Solving' },
                { step: '03', label: isAr ? 'تطبيق عملي' : 'Practical Application' },
                { step: '04', label: isAr ? 'مشروع حقيقي' : 'Real Project' },
              ].map((item) => (
                <div key={item.step} className="secondary-approach-step">
                  <span className="secondary-approach-step__number">{item.step}</span>
                  <span className="secondary-approach-step__label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="secondary-cta">
          <div className="secondary-cta__content">
            <h2 className="secondary-cta__title">
              {isAr ? 'ابدأ رحلة التعلم البرمجي' : 'Start Your Programming Journey'}
            </h2>
            <p className="secondary-cta__text">
              {isAr
                ? 'سواء كنت طالباً في الثانوية أو في البكالوريا، لدينا مسار يناسب مستواك ويحضّرك للمستقبل.'
                : 'Whether you are a secondary or baccalaureate student, we have a path that fits your level and prepares you for the future.'}
            </p>
            <MagneticButton className="secondary-cta__button" onClick={handleContactClick}>
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </MagneticButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default SecondaryEducationPage;
