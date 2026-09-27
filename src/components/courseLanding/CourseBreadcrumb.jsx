import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Simple Breadcrumb for the course landing page.
 * Home > Training > Course Title
 */
function CourseBreadcrumb({ course }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const title = isAr ? course.titleAr : course.titleEn;

  const homeLabel = isAr ? 'الرئيسية' : 'Home';
  const trainingLabel = isAr ? 'التدريب' : 'Training';

  return (
    <nav className="course-landing-breadcrumb" dir={dir} aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}>
      <Link to="/" className="course-landing-breadcrumb__link">{homeLabel}</Link>
      <span className="course-landing-breadcrumb__sep" aria-hidden="true">/</span>
      <Link to="/training" className="course-landing-breadcrumb__link">{trainingLabel}</Link>
      <span className="course-landing-breadcrumb__sep" aria-hidden="true">/</span>
      <span className="course-landing-breadcrumb__current">{title}</span>
    </nav>
  );
}

export default CourseBreadcrumb;
