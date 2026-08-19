import MagneticLink from '../MagneticLink';
import SectionHeading from '../ui/SectionHeading';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import getBilingual from '../../utils/getBilingual';

const FALLBACK_PROOF_POINTS_EN = [
  'Academic & Enterprise Focus',
  'Custom Software & ERP',
  'AI, Automation & Future-Ready Architecture',
];

const FALLBACK_PROOF_POINTS_AR = [
  'تركيز أكاديمي ومؤسسي',
  'برمجيات مخصصة وأنظمة ERP',
  'ذكاء اصطناعي وأتمتة ومعماريات جاهزة للمستقبل',
];

function FoundationSection() {
  const { config } = useHomepageConfig();
  const { lang } = useI18n();

  const foundation = config?.foundation;
  const isEnabled = foundation?.enabled !== false;

  if (!isEnabled) return null;

  const headline = lang === 'ar'
    ? (foundation?.heading_ar || 'شركة واحدة. ثلاثة مسارات.')
    : (foundation?.heading_en || 'One company. Three paths.');

  const subheadline = lang === 'ar'
    ? (foundation?.description_ar || 'سِدرة سوفت تبني البرمجيات، تؤهل المهنيين، وتدخل التقنية إلى تعليم الثانوية والبكالوريا.')
    : (foundation?.description_en || 'Sidrah Soft builds software, trains professionals, and brings technology into secondary and baccalaureate education.');

  const proofPoints = lang === 'ar'
    ? (foundation?.proof_points_ar?.length ? foundation.proof_points_ar : FALLBACK_PROOF_POINTS_AR)
    : (foundation?.proof_points_en?.length ? foundation.proof_points_en : FALLBACK_PROOF_POINTS_EN);

  const ctaLabel = lang === 'ar'
    ? (foundation?.cta_label_ar || 'اكتشف ما نبنيه')
    : (foundation?.cta_label_en || 'Explore What We Build');

  const ctaTarget = foundation?.cta_target || '#capabilities';

  return (
    <section id="foundation" className="foundation-section" aria-labelledby="foundation-heading">
      <div className="foundation-content">
        <div className="foundation-statement motion-fade-up is-visible">
          <SectionHeading
            id="foundation-heading"
            title={headline}
            description={subheadline}
            as="h2"
          />
          <MagneticLink className="foundation-cta" href={ctaTarget}>
            <span>{ctaLabel}</span>
            <span className="foundation-cta-arrow" aria-hidden="true">↓</span>
          </MagneticLink>
        </div>
        <ul className="foundation-proof-points" aria-label={lang === 'ar' ? 'مجالات التركيز' : 'Focus areas'}>
          {proofPoints.map((point, index) => (
            <li
              key={point}
              className={`foundation-proof-point card-base card-surface-gold card-edge-gold motion-fade-up is-visible stagger-${index + 1}`}
            >
              <span className="foundation-proof-point__index" aria-hidden="true">0{index + 1}</span>
              <span className="foundation-proof-point__text">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FoundationSection;
