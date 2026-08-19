import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';

function TrainingEducationEntry() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <section className="training-education-entry" id="training-education">
      <div className="training-education-entry__content">
        <span className="training-education-entry__eyebrow">
          {isAr ? 'التدريب والتعليم' : 'Training & Education'}
        </span>
        <h2 className="training-education-entry__title">
          {isAr
            ? 'نبني الكفاءات التقنية للمستقبل'
            : 'We Build Technical Capabilities for the Future'}
        </h2>
        <p className="training-education-entry__text">
          {isAr
            ? 'من تدريب المهنيين على أحدث التقنيات إلى إعداد طلاب الثانوية والبكالوريا داخل بيئة شركة برمجيات حقيقية.'
            : 'From training professionals on the latest technologies to preparing secondary and baccalaureate students inside a real software company environment.'}
        </p>
        <div className="training-education-entry__links">
          <Link to="/training" className="training-education-entry__link">
            {isAr ? 'استكشف التدريب' : 'Explore Training'}
            <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
          </Link>
          <Link to="/training/secondary" className="training-education-entry__link training-education-entry__link--secondary">
            {isAr ? 'تعليم الثانوية / البكالوريا' : 'Secondary / Baccalaureate'}
            <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TrainingEducationEntry;
