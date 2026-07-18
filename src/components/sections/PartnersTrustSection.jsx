import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { usePartners } from '../../hooks/usePartners';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import getBilingual from '../../utils/getBilingual';
import SectionHeading from '../ui/SectionHeading';

import eurofinsLogo from '../../assets/partiners/eurofins.png';
import orangeTheoryLogo from '../../assets/partiners/Orangetheory-Fitness-Logo.png';
import clubPilatesLogo from '../../assets/partiners/club-pilates-logo-g2gsvcvaj31u80ap.png';
import safaLogo from '../../assets/partiners/safa.webp';
import visionLogo from '../../assets/partiners/vision.png';
import alqalamLogo from '../../assets/partiners/alqalam.png';

const fallbackPartners = [
  {
    name: 'Eurofins',
    logo: eurofinsLogo,
    website: 'https://www.eurofins.com/',
  },
  {
    name: 'Orangetheory Fitness KSA',
    logo: orangeTheoryLogo,
    website: 'https://join.otfksa.com/',
  },
  {
    name: 'Club Pilates Saudi Arabia',
    logo: clubPilatesLogo,
    website: 'https://clubpilates.sa/',
  },
  {
    name: 'Safa Invest',
    logo: safaLogo,
    website: 'https://safainvest.com/',
  },
  {
    name: 'Vision',
    logo: visionLogo,
    website: 'https://vision.edu.sa/',
  },
  {
    name: 'AlQalam Schools',
    logo: alqalamLogo,
    website: 'https://alqalamschools.com/',
  },
];

function PartnersTrustSection() {
  const [failedLogos, setFailedLogos] = useState(new Set());
  const { lang } = useI18n();
  const { partners: cmsPartners } = usePartners();
  const { config } = useHomepageConfig();

  const displayPartners = cmsPartners || fallbackPartners;

  const partnersHeading = config?.headings?.partners;
  const heading = lang === 'ar'
    ? (partnersHeading?.heading_ar || 'موثوق به من شركاء في التعليم والمؤسسات والأعمال العالمية')
    : (partnersHeading?.heading_en || 'Trusted by partners across education, enterprise, and global business.');

  const description = lang === 'ar'
    ? (partnersHeading?.description_ar || 'تبني SidrahSoft أنظمة رقمية للمؤسسات التي تقدّر التقنية الموثوقة والمعمارية القابلة للتوسع والشراكات طويلة الأمد.')
    : (partnersHeading?.description_en || 'SidrahSoft builds digital systems for organizations that value reliable technology, scalable architecture, and long-term partnerships.');

  const handleLogoError = (key) => {
    setFailedLogos((prev) => new Set(prev).add(key));
  };

  return (
    <section id="partners" className="partners-section" aria-labelledby="partners-heading">
      <div className="partners-content">
        <SectionHeading
          id="partners-heading"
          index="07"
          eyebrow={lang === 'ar' ? 'شركاء موثوقون' : 'Trusted Partners'}
          title={heading}
          description={description}
          className="partners-heading-block motion-clip-reveal is-visible"
        />

        <div className="partners-grid" role="list">
          {displayPartners.map((partner, index) => {
            const name = getBilingual(partner.name, lang);
            const logoUrl = partner.logoUrl || partner.logo;
            const websiteUrl = partner.websiteUrl || partner.website;
            const openInNewTab = partner.openInNewTab ?? true;
            const altText = getBilingual(partner.altText, lang) || name;
            const key = partner.slug || name || index;
            const isFailed = failedLogos.has(key);
            const CardTag = websiteUrl ? 'a' : 'article';
            const linkProps = websiteUrl
              ? {
                  href: websiteUrl,
                  target: openInNewTab ? '_blank' : undefined,
                  rel: openInNewTab ? 'noopener noreferrer' : undefined,
                  'aria-label': `${lang === 'ar' ? 'زيارة موقع' : 'Visit'} ${name}${openInNewTab ? ` ${lang === 'ar' ? '(يفتح في نافذة جديدة)' : '(opens in new tab)'}` : ''}`,
                }
              : {};

            return (
              <CardTag
                key={key}
                className={`partner-card card-base card-surface-solid card-edge-gold card-edge-gradient card-hover-lift card-padding-md motion-fade-up is-visible stagger-${Math.min(index + 1, 6)}`}
                role="listitem"
                {...linkProps}
              >
                <div className="partner-logo-frame">
                  {!isFailed && logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${altText} logo`}
                      className="partner-logo"
                      loading="lazy"
                      decoding="async"
                      onError={() => handleLogoError(key)}
                    />
                  ) : (
                    <span className="partner-logo-fallback" aria-hidden="true">{name}</span>
                  )}
                </div>
                <span className="partner-name">{name}</span>
              </CardTag>
            );
          })}
        </div>

        <p className="partners-note">
          {lang === 'ar'
            ? 'تعكس كل شراكة التزامًا مشتركًا بأنظمة تؤدي وتتكيف وتستمر.'
            : 'Each partnership reflects a shared commitment to systems that perform, scale, and endure.'}
        </p>
      </div>
    </section>
  );
}

export default PartnersTrustSection;
