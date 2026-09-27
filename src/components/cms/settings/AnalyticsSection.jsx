/**
 * CMS Analytics & Integrations section.
 *
 * Centralizes configuration for Meta Pixel, Google Tag Manager, Google Analytics 4,
 * and Google Search Console. No arbitrary JavaScript or HTML can be injected —
 * only structured, validated string fields are used.
 */
import { CMSInput, CMSSelect, CMSCheckbox } from '../ui/CMSFormInputs';

function SubSection({ title, children }) {
  return (
    <div style={{ marginTop: '1.25rem' }}>
      <h4 style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--cms-text-primary)',
        marginBottom: '0.75rem',
      }}>{title}</h4>
      {children}
    </div>
  );
}

export default function AnalyticsSection({
  formData,
  fieldErrors,
  canEdit,
  onChange,
  t,
}) {
  return (
    <div>
      <SubSection title={t('siteSettings.metaPixel')}>
        <div className="cms-form-grid">
          <CMSCheckbox
            label={t('siteSettings.metaPixelEnabled')}
            checked={formData.meta_pixel_enabled ?? false}
            onChange={(e) => onChange('meta_pixel_enabled', e.target.checked)}
            disabled={!canEdit}
          />
          <CMSInput
            label={t('siteSettings.metaPixelId')}
            value={formData.meta_pixel_id || ''}
            onChange={(e) => onChange('meta_pixel_id', e.target.value)}
            error={fieldErrors.meta_pixel_id}
            disabled={!canEdit}
            hint={t('siteSettings.metaPixelIdHint')}
          />
        </div>
      </SubSection>

      <SubSection title={t('siteSettings.googleTagManager')}>
        <div className="cms-form-grid">
          <CMSCheckbox
            label={t('siteSettings.googleTagManagerEnabled')}
            checked={formData.google_tag_manager_enabled ?? false}
            onChange={(e) => onChange('google_tag_manager_enabled', e.target.checked)}
            disabled={!canEdit}
          />
          <CMSInput
            label={t('siteSettings.googleTagManagerContainerId')}
            value={formData.google_tag_manager_container_id || ''}
            onChange={(e) => onChange('google_tag_manager_container_id', e.target.value)}
            error={fieldErrors.google_tag_manager_container_id}
            disabled={!canEdit}
            hint={t('siteSettings.googleTagManagerContainerIdHint')}
          />
        </div>
      </SubSection>

      <SubSection title={t('siteSettings.googleAnalytics')}>
        <div className="cms-form-grid">
          <CMSCheckbox
            label={t('siteSettings.googleAnalyticsEnabled')}
            checked={formData.google_analytics_enabled ?? false}
            onChange={(e) => onChange('google_analytics_enabled', e.target.checked)}
            disabled={!canEdit}
          />
          <CMSInput
            label={t('siteSettings.googleAnalyticsMeasurementId')}
            value={formData.google_analytics_measurement_id || ''}
            onChange={(e) => onChange('google_analytics_measurement_id', e.target.value)}
            error={fieldErrors.google_analytics_measurement_id}
            disabled={!canEdit}
            hint={t('siteSettings.googleAnalyticsMeasurementIdHint')}
          />
        </div>
      </SubSection>

      <SubSection title={t('siteSettings.googleSearchConsole')}>
        <div className="cms-form-grid">
          <CMSSelect
            label={t('siteSettings.googleSearchConsoleVerificationMethod')}
            value={formData.google_search_console_verification_method || 'dns'}
            onChange={(e) => onChange('google_search_console_verification_method', e.target.value)}
            error={fieldErrors.google_search_console_verification_method}
            disabled={!canEdit}
            hint={t('siteSettings.googleSearchConsoleVerificationMethodHint')}
          >
            <option value="dns">{t('siteSettings.googleSearchConsoleVerificationDns')}</option>
            <option value="html_meta">{t('siteSettings.googleSearchConsoleVerificationHtmlMeta')}</option>
            <option value="html_file">{t('siteSettings.googleSearchConsoleVerificationHtmlFile')}</option>
          </CMSSelect>
          <CMSInput
            label={t('siteSettings.googleSearchConsoleVerificationToken')}
            value={formData.google_search_console_verification_token || ''}
            onChange={(e) => onChange('google_search_console_verification_token', e.target.value)}
            error={fieldErrors.google_search_console_verification_token}
            disabled={!canEdit}
            hint={t('siteSettings.googleSearchConsoleVerificationTokenHint')}
          />
          <CMSInput
            label={t('siteSettings.googleSearchConsoleSitemapUrl')}
            value={formData.google_search_console_sitemap_url || ''}
            onChange={(e) => onChange('google_search_console_sitemap_url', e.target.value)}
            error={fieldErrors.google_search_console_sitemap_url}
            disabled={!canEdit}
            hint={t('siteSettings.googleSearchConsoleSitemapUrlHint')}
          />
        </div>
      </SubSection>
    </div>
  );
}
