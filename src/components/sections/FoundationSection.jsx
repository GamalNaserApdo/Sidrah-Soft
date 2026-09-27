import MagneticLink from '../MagneticLink';
import SectionHeading from '../ui/SectionHeading';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import getBilingual from '../../utils/getBilingual';

const FALLBACK_PROOF_POINTS_EN = [
  'Custom Software, ERP & AI',
  'Automation & Future-Ready Architecture',
  'Practical Training & Technology Education',
];

const FALLBACK_PROOF_POINTS_AR = [
  'برمجيات مخصصة وأنظمة ERP وذكاء اصطناعي',
  'أتمتة ومعماريات جاهزة للمستقبل',
  'تدريب عملي وتعليم تقني',
];

function FoundationSection() {
  const { config } = useHomepageConfig();
  const { lang } = useI18n();

  const foundation = config?.foundation;
  const isEnabled = foundation?.enabled !== false;

  if (!isEnabled) return null;

  const headline = lang === 'ar'
    ? (foundation?.heading_ar || 'شريك تقني للمؤسسات والشركات.')
    : (foundation?.heading_en || 'Technology partner for institutions and enterprises.');

  const subheadline = lang === 'ar'
    ? (foundation?.description_ar || 'نبني البرمجيات المخصصة وأنظمة ERP والذكاء الاصطناعي والأتمتة لتصبح أنظمة قابلة للتوسع في منظومات رقمية مستقبلية.')
    : (foundation?.description_en || 'We build custom software, ERP, AI, and automation systems that scale into future digital ecosystems.');

  const proofPoints = lang === 'ar'
    ? (foundation?.proof_points_ar?.length ? foundation.proof_points_ar : FALLBACK_PROOF_POINTS_AR)
    : (foundation?.proof_points_en?.length ? foundation.proof_points_en : FALLBACK_PROOF_POINTS_EN);

  const ctaLabel = lang === 'ar'
    ? (foundation?.cta_label_ar || 'اكتشف خدماتنا')
    : (foundation?.cta_label_en || 'Explore Services');

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
