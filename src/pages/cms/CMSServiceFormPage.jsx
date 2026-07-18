/**
 * CMS Service Form Page — /cms/services/new and /cms/services/:id
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getService, createService, updateService } from '../../services/cms/servicesApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

const EMPTY = {
  name_en: '', name_ar: '', slug: '',
  short_description_en: '', short_description_ar: '',
  description_en: '', description_ar: '',
  icon: null, featured_image: null,
  display_order: 0, is_active: true, is_featured: false, show_on_homepage: false,
  cta_label_en: '', cta_label_ar: '', cta_url: '',
  seo_title_en: '', seo_title_ar: '', seo_description_en: '', seo_description_ar: '',
};

export default function CMSServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const isEdit = !!id;

  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getService(id);
      setFormData({
        ...EMPTY,
        name_en: data.name_en || '', name_ar: data.name_ar || '', slug: data.slug || '',
        short_description_en: data.short_description_en || '', short_description_ar: data.short_description_ar || '',
        description_en: data.description_en || '', description_ar: data.description_ar || '',
        icon: data.icon || null, featured_image: data.featured_image || null,
        display_order: data.display_order || 0, is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false, show_on_homepage: data.show_on_homepage ?? false,
        cta_label_en: data.cta_label_en || '', cta_label_ar: data.cta_label_ar || '', cta_url: data.cta_url || '',
        seo_title_en: data.seo_title_en || '', seo_title_ar: data.seo_title_ar || '',
        seo_description_en: data.seo_description_en || '', seo_description_ar: data.seo_description_ar || '',
      });
      setDirty(false);
    } catch (err) { setError(parseApiError(err)); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { if (isEdit) load(); }, [isEdit, load]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    setSaving(true); setFieldErrors({});
    try {
      const payload = { ...formData };
      if (payload.icon && typeof payload.icon === 'object') payload.icon = payload.icon.id;
      if (payload.featured_image && typeof payload.featured_image === 'object') payload.featured_image = payload.featured_image.id;
      if (isEdit) await updateService(id, payload);
      else await createService(payload);
      setDirty(false);
      showSuccess(t('msg.saved'));
      navigate('/cms/services');
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally { setSaving(false); }
  };

  if (isEdit && !hasCapability('services.update') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;
  if (!isEdit && !hasCapability('services.create') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isEdit ? `${t('action.edit')} ${formData.name_en || 'Service'}` : `${t('action.addNew')} ${t('nav.services')}`}
        actions={
          <>
            <Link to="/cms/services"><CMSButton variant="secondary">{t('action.cancel')}</CMSButton></Link>
            <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty && isEdit}>{t('action.save')}</CMSButton>
          </>
        }
      />
      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}
      {!loading && !error && (
        <div style={styles.form}>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.name')} (${t('form.english')})`} required value={formData.name_en} onChange={(e) => handleChange('name_en', e.target.value)} error={fieldErrors.name_en} />
            <CMSInput label={`${t('form.name')} (${t('form.arabic')})`} value={formData.name_ar} onChange={(e) => handleChange('name_ar', e.target.value)} error={fieldErrors.name_ar} dir="rtl" />
          </div>
          <CMSInput label={t('form.slug')} required value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} error={fieldErrors.slug} />
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.english')})`} value={formData.short_description_en} onChange={(e) => handleChange('short_description_en', e.target.value)} error={fieldErrors.short_description_en} rows={2} />
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.arabic')})`} value={formData.short_description_ar} onChange={(e) => handleChange('short_description_ar', e.target.value)} error={fieldErrors.short_description_ar} rows={2} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.description')} (${t('form.english')})`} value={formData.description_en} onChange={(e) => handleChange('description_en', e.target.value)} error={fieldErrors.description_en} rows={6} />
            <CMSTextarea label={`${t('form.description')} (${t('form.arabic')})`} value={formData.description_ar} onChange={(e) => handleChange('description_ar', e.target.value)} error={fieldErrors.description_ar} rows={6} dir="rtl" />
          </div>
          <div className="cms-form-grid">
            <CMSMediaField label={t('form.icon')} value={formData.icon} onChange={(_id, asset) => handleChange('icon', asset)} usageLabel="service-icon" />
            <CMSMediaField label={t('form.featuredImage')} value={formData.featured_image} onChange={(_id, asset) => handleChange('featured_image', asset)} usageLabel="service-featured-image" />
          </div>
          <div className="cms-form-grid">
            <CMSInput label={t('form.order')} type="number" value={formData.display_order} onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)} error={fieldErrors.display_order} />
            <CMSInput label={t('form.ctaUrl')} value={formData.cta_url} onChange={(e) => handleChange('cta_url', e.target.value)} error={fieldErrors.cta_url} />
          </div>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.ctaLabel')} (${t('form.english')})`} value={formData.cta_label_en} onChange={(e) => handleChange('cta_label_en', e.target.value)} />
            <CMSInput label={`${t('form.ctaLabel')} (${t('form.arabic')})`} value={formData.cta_label_ar} onChange={(e) => handleChange('cta_label_ar', e.target.value)} dir="rtl" />
          </div>
          <div style={styles.checkboxes}>
            <CMSCheckbox label={t('form.active')} checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
            <CMSCheckbox label={t('form.featured')} checked={formData.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} />
            <CMSCheckbox label={t('form.homepage')} checked={formData.show_on_homepage} onChange={(e) => handleChange('show_on_homepage', e.target.checked)} />
          </div>
          <SEOSection formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} t={t} />
        </div>
      )}
    </CMSLayout>
  );
}

function SEOSection({ formData, handleChange, fieldErrors, t }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{t('form.seo')}</h3>
      <div className="cms-bilingual-row">
        <CMSInput label={`${t('form.seoTitle')} (${t('form.english')})`} value={formData.seo_title_en} onChange={(e) => handleChange('seo_title_en', e.target.value)} error={fieldErrors.seo_title_en} />
        <CMSInput label={`${t('form.seoTitle')} (${t('form.arabic')})`} value={formData.seo_title_ar} onChange={(e) => handleChange('seo_title_ar', e.target.value)} error={fieldErrors.seo_title_ar} dir="rtl" />
      </div>
      <div className="cms-bilingual-row">
        <CMSTextarea label={`${t('form.seoDescription')} (${t('form.english')})`} value={formData.seo_description_en} onChange={(e) => handleChange('seo_description_en', e.target.value)} error={fieldErrors.seo_description_en} rows={2} />
        <CMSTextarea label={`${t('form.seoDescription')} (${t('form.arabic')})`} value={formData.seo_description_ar} onChange={(e) => handleChange('seo_description_ar', e.target.value)} error={fieldErrors.seo_description_ar} rows={2} dir="rtl" />
      </div>
    </div>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' },
  checkboxes: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  section: { background: '#12121e', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  sectionTitle: { fontSize: '0.75rem', fontWeight: '600', color: '#c9a96e', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 },
};
