/**
 * CMS Static SEO Page — /cms/static-seo
 *
 * Manages SEO metadata for code-controlled static pages.
 * Left: list of valid page keys (cards with canonical path + has_record indicator).
 * Right: edit form for the selected page's SEO record.
 *
 * Endpoints:
 *   GET  /api/v1/cms/static-page-seo/            → list of page keys
 *   GET  /api/v1/cms/static-page-seo/<key>/      → single SEO record
 *   PUT  /api/v1/cms/static-page-seo/<key>/      → update SEO record
 */

import { useState, useEffect, useCallback } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getStaticSEOList, getStaticSEO, updateStaticSEO } from '../../services/cms/staticSeoApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

export default function CMSStaticSEOPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canView = hasCapability('site_settings.view');
  const canEdit = hasCapability('site_settings.update');

  const [pages, setPages] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [selectedKey, setSelectedKey] = useState(null);
  const [formData, setFormData] = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  // ── Load page list ──
  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await getStaticSEOList();
      const list = Array.isArray(data) ? data : data.page_keys || data.results || [];
      setPages(list);
      if (list.length > 0 && !selectedKey) {
        setSelectedKey(list[0].page_key);
      }
    } catch (err) {
      setListError(parseApiError(err));
    } finally {
      setListLoading(false);
    }
  }, [selectedKey]);

  // ── Load selected page SEO ──
  const loadPage = useCallback(async (pageKey) => {
    if (!pageKey) return;
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await getStaticSEO(pageKey);
      setFormData(data);
      setOriginal(data);
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
      setFormData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) loadList();
  }, [canView, loadList]);

  useEffect(() => {
    if (selectedKey) loadPage(selectedKey);
  }, [selectedKey, loadPage]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (!selectedKey || !formData) return;
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = {
        seo_title_en: formData.seo_title_en || '',
        seo_title_ar: formData.seo_title_ar || '',
        meta_description_en: formData.meta_description_en || '',
        meta_description_ar: formData.meta_description_ar || '',
        og_title_en: formData.og_title_en || '',
        og_title_ar: formData.og_title_ar || '',
        og_description_en: formData.og_description_en || '',
        og_description_ar: formData.og_description_ar || '',
        og_image_id: formData.og_image_id || null,
        robots_index: formData.robots_index ?? true,
        robots_follow: formData.robots_follow ?? true,
      };
      const updated = await updateStaticSEO(selectedKey, payload);
      setFormData(updated);
      setOriginal(updated);
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

  const handleCancel = () => {
    setFormData(original);
    setDirty(false);
    setFieldErrors({});
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
        title={t('nav.staticSeo') !== 'nav.staticSeo' ? t('nav.staticSeo') : 'Static Page SEO'}
        subtitle="Manage SEO metadata for code-controlled static pages"
      />

      {listLoading && <CMSLoadingState />}
      {listError && <CMSErrorState message={listError} onRetry={loadList} />}

      {!listLoading && !listError && (
        <div style={styles.layout}>
          {/* ── Left: page list ── */}
          <div style={styles.sidebar}>
            {pages.length === 0 ? (
              <p style={styles.muted}>No static pages available.</p>
            ) : (
              pages.map((page) => {
                const isActive = page.page_key === selectedKey;
                return (
                  <button
                    key={page.page_key}
                    type="button"
                    onClick={() => setSelectedKey(page.page_key)}
                    style={{
                      ...styles.pageCard,
                      ...(isActive ? styles.pageCardActive : {}),
                    }}
                  >
                    <div style={styles.pageCardHeader}>
                      <span style={styles.pageName}>{page.display_name || page.page_key}</span>
                      {page.has_record ? (
                        <span style={styles.badgeConfigured}>Configured</span>
                      ) : (
                        <span style={styles.badgeEmpty}>Empty</span>
                      )}
                    </div>
                    {page.canonical_path && (
                      <code style={styles.canonicalPath}>{page.canonical_path}</code>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* ── Right: edit form ── */}
          <div style={styles.formArea}>
            {!selectedKey && (
              <p style={styles.muted}>Select a page from the left to edit its SEO.</p>
            )}

            {selectedKey && loading && <CMSLoadingState />}

            {selectedKey && !loading && error && (
              <CMSErrorState message={error} onRetry={() => loadPage(selectedKey)} />
            )}

            {selectedKey && !loading && !error && formData && (
              <div style={styles.formContainer}>
                {/* Page info */}
                <div style={styles.section}>
                  <div style={styles.pageInfoRow}>
                    <div>
                      <div style={styles.pageInfoLabel}>Page</div>
                      <div style={styles.pageInfoValue}>
                        {formData.display_name || formData.page_key || selectedKey}
                      </div>
                    </div>
                    <div>
                      <div style={styles.pageInfoLabel}>Canonical Path</div>
                      <code style={styles.canonicalPathLarge}>
                        {formData.canonical_path || '—'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* SEO Title */}
                <Section title={t('form.seoTitle')}>
                  <div className="cms-form-grid">
                    <CMSInput
                      label={`${t('form.seoTitle')} (${t('form.english')})`}
                      value={formData.seo_title_en || ''}
                      onChange={(e) => handleChange('seo_title_en', e.target.value)}
                      error={fieldErrors.seo_title_en}
                      disabled={!canEdit}
                      maxLength={120}
                      hint={`${(formData.seo_title_en || '').length}/${TITLE_MAX} chars (recommended max ${TITLE_MAX})`}
                    />
                    <CMSInput
                      label={`${t('form.seoTitle')} (${t('form.arabic')})`}
                      value={formData.seo_title_ar || ''}
                      onChange={(e) => handleChange('seo_title_ar', e.target.value)}
                      error={fieldErrors.seo_title_ar}
                      disabled={!canEdit}
                      dir="rtl"
                      maxLength={120}
                      hint={`${(formData.seo_title_ar || '').length}/${TITLE_MAX} chars (recommended max ${TITLE_MAX})`}
                    />
                  </div>
                </Section>

                {/* Meta Description */}
                <Section title={t('form.seoDescription')}>
                  <CMSTextarea
                    label={`${t('form.seoDescription')} (${t('form.english')})`}
                    value={formData.meta_description_en || ''}
                    onChange={(e) => handleChange('meta_description_en', e.target.value)}
                    error={fieldErrors.meta_description_en}
                    disabled={!canEdit}
                    rows={3}
                    hint={`${(formData.meta_description_en || '').length}/${DESCRIPTION_MAX} chars (recommended max ${DESCRIPTION_MAX})`}
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <CMSTextarea
                      label={`${t('form.seoDescription')} (${t('form.arabic')})`}
                      value={formData.meta_description_ar || ''}
                      onChange={(e) => handleChange('meta_description_ar', e.target.value)}
                      error={fieldErrors.meta_description_ar}
                      disabled={!canEdit}
                      dir="rtl"
                      rows={3}
                      hint={`${(formData.meta_description_ar || '').length}/${DESCRIPTION_MAX} chars (recommended max ${DESCRIPTION_MAX})`}
                    />
                  </div>
                </Section>

                {/* Open Graph */}
                <Section title={t('form.openGraph')}>
                  <div className="cms-form-grid">
                    <CMSInput
                      label={`${t('form.ogTitle')} (${t('form.english')})`}
                      value={formData.og_title_en || ''}
                      onChange={(e) => handleChange('og_title_en', e.target.value)}
                      error={fieldErrors.og_title_en}
                      disabled={!canEdit}
                      hint={t('form.ogTitleHint')}
                    />
                    <CMSInput
                      label={`${t('form.ogTitle')} (${t('form.arabic')})`}
                      value={formData.og_title_ar || ''}
                      onChange={(e) => handleChange('og_title_ar', e.target.value)}
                      error={fieldErrors.og_title_ar}
                      disabled={!canEdit}
                      dir="rtl"
                      hint={t('form.ogTitleHint')}
                    />
                  </div>
                  <div className="cms-form-grid" style={{ marginTop: '1rem' }}>
                    <CMSTextarea
                      label={`${t('form.ogDescription')} (${t('form.english')})`}
                      value={formData.og_description_en || ''}
                      onChange={(e) => handleChange('og_description_en', e.target.value)}
                      error={fieldErrors.og_description_en}
                      disabled={!canEdit}
                      rows={2}
                    />
                    <CMSTextarea
                      label={`${t('form.ogDescription')} (${t('form.arabic')})`}
                      value={formData.og_description_ar || ''}
                      onChange={(e) => handleChange('og_description_ar', e.target.value)}
                      error={fieldErrors.og_description_ar}
                      disabled={!canEdit}
                      dir="rtl"
                      rows={2}
                    />
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <CMSMediaField
                      label={t('form.ogImage')}
                      value={formData.og_image}
                      onChange={(id, asset) => {
                        handleChange('og_image_id', id);
                        handleChange('og_image', asset);
                      }}
                      usageLabel="static-seo-og-image"
                      hint={t('siteSettings.ogHint')}
                    />
                  </div>
                </Section>

                {/* Robots Directives */}
                <Section title={t('form.robotsDirectives')}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <CMSCheckbox
                      label={t('form.robotsIndex')}
                      checked={formData.robots_index ?? true}
                      onChange={(e) => handleChange('robots_index', e.target.checked)}
                      disabled={!canEdit}
                    />
                    <CMSCheckbox
                      label={t('form.robotsFollow')}
                      checked={formData.robots_follow ?? true}
                      onChange={(e) => handleChange('robots_follow', e.target.checked)}
                      disabled={!canEdit}
                    />
                  </div>
                </Section>

                {/* Save bar */}
                {canEdit && (
                  <div style={styles.saveBar}>
                    <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty}>
                      {t('action.save')}
                    </CMSButton>
                    {dirty && (
                      <CMSButton variant="ghost" onClick={handleCancel} disabled={saving}>
                        {t('action.cancel')}
                      </CMSButton>
                    )}
                    {dirty && <span style={styles.dirtyIndicator}>{t('msg.unsavedIndicator')}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  pageCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    padding: '0.875rem 1rem',
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-md)',
    cursor: 'pointer',
    textAlign: 'start',
    fontFamily: 'inherit',
    transition: 'border-color var(--cms-transition-fast), background var(--cms-transition-fast)',
  },
  pageCardActive: {
    borderColor: 'var(--cms-accent)',
    background: 'var(--cms-accent-bg)',
  },
  pageCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pageName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--cms-text-primary)',
  },
  badgeConfigured: {
    fontSize: '0.625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--cms-accent)',
    background: 'var(--cms-accent-bg)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--cms-radius-sm)',
    flexShrink: 0,
  },
  badgeEmpty: {
    fontSize: '0.625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--cms-text-muted)',
    background: 'var(--cms-bg-surface-alt)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--cms-radius-sm)',
    flexShrink: 0,
  },
  canonicalPath: {
    fontSize: '0.6875rem',
    color: 'var(--cms-text-muted)',
    background: 'var(--cms-bg-surface-alt)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--cms-radius-sm)',
    fontFamily: 'monospace',
    alignSelf: 'flex-start',
  },
  formArea: {
    minWidth: 0,
  },
  formContainer: {
    maxWidth: '760px',
  },
  section: {
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-accent)',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  pageInfoRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  pageInfoLabel: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--cms-text-muted)',
    marginBottom: '0.25rem',
  },
  pageInfoValue: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--cms-text-primary)',
  },
  canonicalPathLarge: {
    fontSize: '0.8125rem',
    color: 'var(--cms-text-secondary)',
    background: 'var(--cms-bg-surface-alt)',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--cms-radius-sm)',
    fontFamily: 'monospace',
  },
  saveBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 0',
  },
  dirtyIndicator: {
    fontSize: '0.75rem',
    color: 'var(--cms-warning, #f59e0b)',
  },
  muted: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.875rem',
  },
};
