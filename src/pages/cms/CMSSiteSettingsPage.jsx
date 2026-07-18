/**
 * CMS Site Settings Page — /cms/site-settings
 *
 * Singleton settings — GET and PUT only.
 * Media fields use CMSMediaField for asset picker integration.
 */

import { useState, useEffect, useCallback } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { fetchSiteSettings, updateSiteSettings } from '../../services/cms/siteSettingsApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

export default function CMSSiteSettingsPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canView = hasCapability('site_settings.view');
  const canEdit = hasCapability('site_settings.update');

  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSiteSettings();
      setSettings(data);
      setFormData(data);
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      // Build payload with only writable fields — exclude read-only nested media objects
      const payload = {};
      const writableFields = [
        'site_name', 'site_tagline', 'default_language', 'supported_languages',
        'contact_email', 'recipient_email', 'phone',
        'whatsapp_url', 'telegram_url',
        'facebook_url', 'linkedin_url', 'instagram_url', 'youtube_url', 'x_url',
        'address', 'google_maps_url', 'map_embed_url',
        'latitude', 'longitude', 'working_hours',
        'default_meta_title', 'default_meta_description',
        'default_og_title', 'default_og_description',
        'default_og_image_id',
        'twitter_card_type', 'canonical_base_url',
        'robots_index', 'organization_description',
        'primary_logo_id', 'secondary_logo_id', 'favicon_id',
        'is_active',
      ];
      for (const field of writableFields) {
        if (formData[field] !== undefined) {
          payload[field] = formData[field];
        }
      }
      const updated = await updateSiteSettings(payload);
      setSettings(updated);
      setFormData(updated);
      setDirty(false);
      showSuccess(t('msg.saved'));
    } catch (err) {
      const fieldErrs = extractFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) setFieldErrors(fieldErrs);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <CMSLayout>
        <CMSErrorState message={t('siteSettings.permissionDenied')} />
      </CMSLayout>
    );
  }

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={t('nav.siteSettings')}
        actions={
          canEdit && (
            <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty}>
              {t('action.save')}
            </CMSButton>
          )
        }
      />

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}

      {formData && !loading && !error && (
        <div style={styles.formContainer}>
          {/* General */}
          <Section title={t('siteSettings.general')}>
            <div className="cms-form-grid">
              <CMSInput label={t('siteSettings.siteName')} value={formData.site_name || ''} onChange={(e) => handleChange('site_name', e.target.value)} error={fieldErrors.site_name} disabled={!canEdit} />
              <CMSInput label={t('siteSettings.siteTagline')} value={formData.site_tagline || ''} onChange={(e) => handleChange('site_tagline', e.target.value)} error={fieldErrors.site_tagline} disabled={!canEdit} />
              <CMSSelect label={t('siteSettings.defaultLanguage')} value={formData.default_language || 'en'} onChange={(e) => handleChange('default_language', e.target.value)} error={fieldErrors.default_language} disabled={!canEdit}>
                <option value="en">{t('form.english')}</option>
                <option value="ar">{t('form.arabic')}</option>
              </CMSSelect>
              <CMSInput label={t('siteSettings.supportedLanguages')} value={formData.supported_languages || ''} onChange={(e) => handleChange('supported_languages', e.target.value)} error={fieldErrors.supported_languages} disabled={!canEdit} hint={t('siteSettings.supportedHint')} />
            </div>
          </Section>

          {/* Contact */}
          <Section title={t('siteSettings.contact')}>
            <div className="cms-form-grid">
              <CMSInput label={t('siteSettings.contactEmail')} type="email" value={formData.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} error={fieldErrors.contact_email} disabled={!canEdit} />
              <CMSInput label={t('siteSettings.recipientEmail')} type="email" value={formData.recipient_email || ''} onChange={(e) => handleChange('recipient_email', e.target.value)} error={fieldErrors.recipient_email} disabled={!canEdit} />
              <CMSInput label={t('siteSettings.phone')} value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} error={fieldErrors.phone} disabled={!canEdit} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea label={t('siteSettings.address')} value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} error={fieldErrors.address} disabled={!canEdit} rows={2} />
            </div>
          </Section>

          {/* Social Media */}
          <Section title={t('siteSettings.social')}>
            <div className="cms-form-grid">
              <CMSInput label={`WhatsApp ${t('form.url')}`} value={formData.whatsapp_url || ''} onChange={(e) => handleChange('whatsapp_url', e.target.value)} error={fieldErrors.whatsapp_url} disabled={!canEdit} />
              <CMSInput label={`Telegram ${t('form.url')}`} value={formData.telegram_url || ''} onChange={(e) => handleChange('telegram_url', e.target.value)} error={fieldErrors.telegram_url} disabled={!canEdit} />
              <CMSInput label={`Facebook ${t('form.url')}`} value={formData.facebook_url || ''} onChange={(e) => handleChange('facebook_url', e.target.value)} error={fieldErrors.facebook_url} disabled={!canEdit} />
              <CMSInput label={`LinkedIn ${t('form.url')}`} value={formData.linkedin_url || ''} onChange={(e) => handleChange('linkedin_url', e.target.value)} error={fieldErrors.linkedin_url} disabled={!canEdit} />
              <CMSInput label={`Instagram ${t('form.url')}`} value={formData.instagram_url || ''} onChange={(e) => handleChange('instagram_url', e.target.value)} error={fieldErrors.instagram_url} disabled={!canEdit} />
              <CMSInput label={`YouTube ${t('form.url')}`} value={formData.youtube_url || ''} onChange={(e) => handleChange('youtube_url', e.target.value)} error={fieldErrors.youtube_url} disabled={!canEdit} />
              <CMSInput label={`X (Twitter) ${t('form.url')}`} value={formData.x_url || ''} onChange={(e) => handleChange('x_url', e.target.value)} error={fieldErrors.x_url} disabled={!canEdit} />
            </div>
          </Section>

          {/* Maps */}
          <Section title={t('siteSettings.maps')}>
            <div className="cms-form-grid">
              <CMSInput label={t('siteSettings.googleMapsUrl')} value={formData.google_maps_url || ''} onChange={(e) => handleChange('google_maps_url', e.target.value)} error={fieldErrors.google_maps_url} disabled={!canEdit} />
              <CMSInput label={t('siteSettings.mapEmbedUrl')} value={formData.map_embed_url || ''} onChange={(e) => handleChange('map_embed_url', e.target.value)} error={fieldErrors.map_embed_url} disabled={!canEdit} />
              <CMSInput label={t('siteSettings.latitude')} type="number" value={formData.latitude ?? ''} onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : null)} error={fieldErrors.latitude} disabled={!canEdit} />
              <CMSInput label={t('siteSettings.longitude')} type="number" value={formData.longitude ?? ''} onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : null)} error={fieldErrors.longitude} disabled={!canEdit} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSInput label={t('siteSettings.workingHours')} value={formData.working_hours || ''} onChange={(e) => handleChange('working_hours', e.target.value)} error={fieldErrors.working_hours} disabled={!canEdit} />
            </div>
          </Section>

          {/* SEO */}
          <Section title={t('siteSettings.seo')}>
            <div className="cms-form-grid">
              <CMSInput label={t('siteSettings.metaTitle')} value={formData.default_meta_title || ''} onChange={(e) => handleChange('default_meta_title', e.target.value)} error={fieldErrors.default_meta_title} disabled={!canEdit} hint={t('siteSettings.metaTitleHint')} />
              <CMSInput label={t('siteSettings.metaDescription')} value={formData.default_meta_description || ''} onChange={(e) => handleChange('default_meta_description', e.target.value)} error={fieldErrors.default_meta_description} disabled={!canEdit} hint={t('siteSettings.metaDescriptionHint')} />
            </div>
            <div className="cms-form-grid" style={{ marginTop: '1rem' }}>
              <CMSInput label={t('siteSettings.ogTitle')} value={formData.default_og_title || ''} onChange={(e) => handleChange('default_og_title', e.target.value)} error={fieldErrors.default_og_title} disabled={!canEdit} hint={t('siteSettings.ogTitleHint')} />
              <CMSInput label={t('siteSettings.ogDescription')} value={formData.default_og_description || ''} onChange={(e) => handleChange('default_og_description', e.target.value)} error={fieldErrors.default_og_description} disabled={!canEdit} />
            </div>
            <div className="cms-form-grid" style={{ marginTop: '1rem' }}>
              <CMSSelect label={t('siteSettings.twitterCardType')} value={formData.twitter_card_type || 'summary_large_image'} onChange={(e) => handleChange('twitter_card_type', e.target.value)} error={fieldErrors.twitter_card_type} disabled={!canEdit}>
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
                <option value="player">player</option>
              </CMSSelect>
              <CMSInput label={t('siteSettings.canonicalBaseUrl')} value={formData.canonical_base_url || ''} onChange={(e) => handleChange('canonical_base_url', e.target.value)} error={fieldErrors.canonical_base_url} disabled={!canEdit} hint={t('siteSettings.canonicalBaseUrlHint')} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea label={t('siteSettings.organizationDescription')} value={formData.organization_description || ''} onChange={(e) => handleChange('organization_description', e.target.value)} error={fieldErrors.organization_description} disabled={!canEdit} rows={2} hint={t('siteSettings.organizationDescriptionHint')} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSCheckbox
                label={t('siteSettings.robotsIndex')}
                checked={formData.robots_index ?? true}
                onChange={(e) => handleChange('robots_index', e.target.checked)}
                disabled={!canEdit}
              />
            </div>
          </Section>

          {/* Media Assets */}
          <Section title={t('siteSettings.media')}>
            <div className="cms-form-grid">
              <CMSMediaField
                label={t('siteSettings.ogImage')}
                value={formData.default_og_image}
                onChange={(id, asset) => { handleChange('default_og_image_id', id); handleChange('default_og_image', asset); }}
                usageLabel="site-settings-og-image"
                hint={t('siteSettings.ogHint')}
              />
              <CMSMediaField
                label={t('siteSettings.primaryLogo')}
                value={formData.primary_logo}
                onChange={(id, asset) => { handleChange('primary_logo_id', id); handleChange('primary_logo', asset); }}
                usageLabel="site-settings-primary-logo"
              />
              <CMSMediaField
                label={t('siteSettings.secondaryLogo')}
                value={formData.secondary_logo}
                onChange={(id, asset) => { handleChange('secondary_logo_id', id); handleChange('secondary_logo', asset); }}
                usageLabel="site-settings-secondary-logo"
              />
              <CMSMediaField
                label={t('siteSettings.favicon')}
                value={formData.favicon}
                onChange={(id, asset) => { handleChange('favicon_id', id); handleChange('favicon', asset); }}
                usageLabel="site-settings-favicon"
                acceptedMimeTypes={['image/x-icon', 'image/png']}
              />
            </div>
          </Section>

          {/* Status */}
          <Section title={t('form.status')}>
            <CMSCheckbox
              label={t('siteSettings.active')}
              checked={formData.is_active ?? false}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              disabled={!canEdit}
            />
          </Section>

          {canEdit && (
            <div style={styles.saveBar}>
              <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty}>
                {t('action.save')}
              </CMSButton>
              {dirty && <span style={styles.dirtyIndicator}>● {t('msg.unsavedIndicator')}</span>}
            </div>
          )}
        </div>
      )}
    </CMSLayout>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

const styles = {
  formContainer: { maxWidth: '800px' },
  section: {
    background: '#12121e',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#c9a96e',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  saveBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 0',
  },
  dirtyIndicator: {
    fontSize: '0.75rem',
    color: '#f59e0b',
  },
};
