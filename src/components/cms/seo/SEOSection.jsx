/**
 * Reusable collapsible SEO section for CMS content edit forms.
 * Includes: SEO title (bilingual), SEO description (bilingual),
 * canonical URL, OG title (bilingual), OG description (bilingual),
 * OG image picker, robots index/follow toggles, and search preview.
 *
 * Props:
 *   formData    — the form state object containing SEO fields
 *   onChange    — (field, value) => void
 *   fieldErrors — object of field-level errors
 *   canEdit     — boolean
 *   t           — translation function
 *   slug        — content slug for preview URL
 *   siteName    — site name for preview
 *   ogImageValue — current og_image asset object or null
 */
import { useState } from 'react';
import { CMSInput, CMSTextarea, CMSCheckbox } from '../ui/CMSFormInputs';
import CMSMediaField from '../ui/CMSMediaField';
import SEOSearchPreview from './SEOSearchPreview';

function SEOSection({
  formData,
  onChange,
  fieldErrors = {},
  canEdit = true,
  t,
  slug = '',
  basePath = '/insights',
  siteName = 'Sidrah Soft',
}) {
  const [expanded, setExpanded] = useState(false);

  const seoTitle = formData.seo_title_en || '';
  const seoDescription = formData.seo_description_en || '';
  const previewUrl = slug ? `${basePath}/${slug}` : basePath;
  const previewTitle = seoTitle || formData.title_en || '';
  const previewDesc = seoDescription || formData.excerpt_en || formData.short_description_en || '';

  const arrow = expanded ? '▼' : '▶';

  return (
    <div style={styles.section}>
      <button
        type="button"
        style={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={styles.arrow}>{arrow}</span>
        <span>{t('form.seo')}</span>
      </button>

      {expanded && (
        <div style={styles.body}>
          <SEOSearchPreview
            title={previewTitle}
            description={previewDesc}
            url={previewUrl}
            siteName={siteName}
          />

          <div className="cms-bilingual-row">
            <CMSInput
              label={`${t('form.seoTitle')} (${t('form.english')})`}
              value={formData.seo_title_en || ''}
              onChange={(e) => onChange('seo_title_en', e.target.value)}
              error={fieldErrors.seo_title_en}
              disabled={!canEdit}
              hint={t('form.seoTitleHint')}
            />
            <CMSInput
              label={`${t('form.seoTitle')} (${t('form.arabic')})`}
              value={formData.seo_title_ar || ''}
              onChange={(e) => onChange('seo_title_ar', e.target.value)}
              error={fieldErrors.seo_title_ar}
              disabled={!canEdit}
              dir="rtl"
            />
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea
              label={`${t('form.seoDescription')} (${t('form.english')})`}
              value={formData.seo_description_en || ''}
              onChange={(e) => onChange('seo_description_en', e.target.value)}
              error={fieldErrors.seo_description_en}
              disabled={!canEdit}
              rows={2}
              hint={t('form.seoDescriptionHint')}
            />
            <CMSTextarea
              label={`${t('form.seoDescription')} (${t('form.arabic')})`}
              value={formData.seo_description_ar || ''}
              onChange={(e) => onChange('seo_description_ar', e.target.value)}
              error={fieldErrors.seo_description_ar}
              disabled={!canEdit}
              rows={2}
              dir="rtl"
            />
          </div>

          <CMSInput
            label={t('form.canonicalUrl')}
            value={formData.canonical_url || ''}
            onChange={(e) => onChange('canonical_url', e.target.value)}
            error={fieldErrors.canonical_url}
            disabled={!canEdit}
            hint={t('form.canonicalUrlHint')}
          />

          <div style={styles.subGroup}>
            <h4 style={styles.subTitle}>{t('form.openGraph')}</h4>

            <div className="cms-bilingual-row">
              <CMSInput
                label={`${t('form.ogTitle')} (${t('form.english')})`}
                value={formData.og_title_en || ''}
                onChange={(e) => onChange('og_title_en', e.target.value)}
                error={fieldErrors.og_title_en}
                disabled={!canEdit}
                hint={t('form.ogTitleHint')}
              />
              <CMSInput
                label={`${t('form.ogTitle')} (${t('form.arabic')})`}
                value={formData.og_title_ar || ''}
                onChange={(e) => onChange('og_title_ar', e.target.value)}
                error={fieldErrors.og_title_ar}
                disabled={!canEdit}
                dir="rtl"
              />
            </div>

            <div className="cms-bilingual-row">
              <CMSTextarea
                label={`${t('form.ogDescription')} (${t('form.english')})`}
                value={formData.og_description_en || ''}
                onChange={(e) => onChange('og_description_en', e.target.value)}
                error={fieldErrors.og_description_en}
                disabled={!canEdit}
                rows={2}
              />
              <CMSTextarea
                label={`${t('form.ogDescription')} (${t('form.arabic')})`}
                value={formData.og_description_ar || ''}
                onChange={(e) => onChange('og_description_ar', e.target.value)}
                error={fieldErrors.og_description_ar}
                disabled={!canEdit}
                rows={2}
                dir="rtl"
              />
            </div>

            <CMSMediaField
              label={t('form.ogImage')}
              value={formData.og_image}
              onChange={(_id, asset) => onChange('og_image', asset)}
              usageLabel="seo-og-image"
              hint={t('form.ogImageHint')}
            />
          </div>

          <div style={styles.subGroup}>
            <h4 style={styles.subTitle}>{t('form.robotsDirectives')}</h4>
            <div style={styles.checkboxes}>
              <CMSCheckbox
                label={t('form.robotsIndex')}
                checked={formData.robots_index ?? true}
                onChange={(e) => onChange('robots_index', e.target.checked)}
                disabled={!canEdit}
              />
              <CMSCheckbox
                label={t('form.robotsFollow')}
                checked={formData.robots_follow ?? true}
                onChange={(e) => onChange('robots_follow', e.target.checked)}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  section: {
    background: '#12121e',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'transparent',
    border: 'none',
    color: '#c9a96e',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    textAlign: 'left',
  },
  arrow: {
    fontSize: '0.6rem',
  },
  body: {
    padding: '0 1.25rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  subGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #1e1e2e',
    marginTop: '0.5rem',
  },
  subTitle: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#8b8b9e',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
    paddingTop: '0.5rem',
  },
  checkboxes: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
};

export default SEOSection;
