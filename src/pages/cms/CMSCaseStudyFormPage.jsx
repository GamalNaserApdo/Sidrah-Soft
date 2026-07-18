/**
 * CMS Case Study Form Page — /cms/case-studies/new and /cms/case-studies/:id
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import SEOSection from '../../components/cms/seo/SEOSection';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getCaseStudy, createCaseStudy, updateCaseStudy } from '../../services/cms/caseStudiesApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

const EMPTY = {
  title_en: '', title_ar: '', slug: '',
  client_name_en: '', client_name_ar: '',
  industry_en: '', industry_ar: '',
  short_description_en: '', short_description_ar: '',
  problem_en: '', problem_ar: '',
  solution_en: '', solution_ar: '',
  technology_en: '', technology_ar: '',
  outcome_en: '', outcome_ar: '',
  project_url: '', project_year: '', open_in_new_tab: false,
  partner: null, logo: null, featured_image: null, services: [],
  display_order: 0, is_active: true, is_featured: false, show_on_homepage: false,
  seo_title_en: '', seo_title_ar: '', seo_description_en: '', seo_description_ar: '',
  canonical_url: '',
  og_title_en: '', og_title_ar: '', og_description_en: '', og_description_ar: '',
  og_image: null,
  robots_index: true, robots_follow: true,
};

export default function CMSCaseStudyFormPage() {
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
      const data = await getCaseStudy(id);
      setFormData({
        ...EMPTY,
        title_en: data.title_en || '', title_ar: data.title_ar || '', slug: data.slug || '',
        client_name_en: data.client_name_en || '', client_name_ar: data.client_name_ar || '',
        industry_en: data.industry_en || '', industry_ar: data.industry_ar || '',
        short_description_en: data.short_description_en || '', short_description_ar: data.short_description_ar || '',
        problem_en: data.problem_en || '', problem_ar: data.problem_ar || '',
        solution_en: data.solution_en || '', solution_ar: data.solution_ar || '',
        technology_en: data.technology_en || '', technology_ar: data.technology_ar || '',
        outcome_en: data.outcome_en || '', outcome_ar: data.outcome_ar || '',
        project_url: data.project_url || '', project_year: data.project_year || '',
        open_in_new_tab: data.open_in_new_tab ?? false,
        partner: data.partner || null, logo: data.logo || null, featured_image: data.featured_image || null,
        services: (data.services || []).map(s => typeof s === 'object' ? s.id : s),
        display_order: data.display_order || 0, is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false, show_on_homepage: data.show_on_homepage ?? false,
        seo_title_en: data.seo_title_en || '', seo_title_ar: data.seo_title_ar || '',
        seo_description_en: data.seo_description_en || '', seo_description_ar: data.seo_description_ar || '',
        canonical_url: data.canonical_url || '',
        og_title_en: data.og_title_en || '', og_title_ar: data.og_title_ar || '',
        og_description_en: data.og_description_en || '', og_description_ar: data.og_description_ar || '',
        og_image: data.og_image || null,
        robots_index: data.robots_index ?? true, robots_follow: data.robots_follow ?? true,
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
      if (payload.partner && typeof payload.partner === 'object') payload.partner = payload.partner.id;
      if (payload.logo && typeof payload.logo === 'object') payload.logo = payload.logo.id;
      if (payload.featured_image && typeof payload.featured_image === 'object') payload.featured_image = payload.featured_image.id;
      if (payload.og_image && typeof payload.og_image === 'object') payload.og_image = payload.og_image.id;
      if (isEdit) await updateCaseStudy(id, payload);
      else await createCaseStudy(payload);
      setDirty(false);
      showSuccess(t('msg.saved'));
      navigate('/cms/case-studies');
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally { setSaving(false); }
  };

  if (isEdit && !hasCapability('case_studies.update') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;
  if (!isEdit && !hasCapability('case_studies.create') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isEdit ? `${t('action.edit')} ${formData.title_en || 'Case Study'}` : `${t('action.addNew')} ${t('nav.caseStudies')}`}
        actions={
          <>
            <Link to="/cms/case-studies"><CMSButton variant="secondary">{t('action.cancel')}</CMSButton></Link>
            <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty && isEdit}>{t('action.save')}</CMSButton>
          </>
        }
      />
      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}
      {!loading && !error && (
        <div style={styles.form}>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.title')} (${t('form.english')})`} required value={formData.title_en} onChange={(e) => handleChange('title_en', e.target.value)} error={fieldErrors.title_en} />
            <CMSInput label={`${t('form.title')} (${t('form.arabic')})`} value={formData.title_ar} onChange={(e) => handleChange('title_ar', e.target.value)} error={fieldErrors.title_ar} dir="rtl" />
          </div>
          <CMSInput label={t('form.slug')} required value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} error={fieldErrors.slug} />
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.clientName')} (${t('form.english')})`} value={formData.client_name_en} onChange={(e) => handleChange('client_name_en', e.target.value)} />
            <CMSInput label={`${t('form.clientName')} (${t('form.arabic')})`} value={formData.client_name_ar} onChange={(e) => handleChange('client_name_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.industry')} (${t('form.english')})`} value={formData.industry_en} onChange={(e) => handleChange('industry_en', e.target.value)} />
            <CMSInput label={`${t('form.industry')} (${t('form.arabic')})`} value={formData.industry_ar} onChange={(e) => handleChange('industry_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.english')})`} value={formData.short_description_en} onChange={(e) => handleChange('short_description_en', e.target.value)} rows={2} />
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.arabic')})`} value={formData.short_description_ar} onChange={(e) => handleChange('short_description_ar', e.target.value)} rows={2} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.problem')} (${t('form.english')})`} value={formData.problem_en} onChange={(e) => handleChange('problem_en', e.target.value)} rows={3} />
            <CMSTextarea label={`${t('form.problem')} (${t('form.arabic')})`} value={formData.problem_ar} onChange={(e) => handleChange('problem_ar', e.target.value)} rows={3} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.solution')} (${t('form.english')})`} value={formData.solution_en} onChange={(e) => handleChange('solution_en', e.target.value)} rows={3} />
            <CMSTextarea label={`${t('form.solution')} (${t('form.arabic')})`} value={formData.solution_ar} onChange={(e) => handleChange('solution_ar', e.target.value)} rows={3} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.technology')} (${t('form.english')})`} value={formData.technology_en} onChange={(e) => handleChange('technology_en', e.target.value)} rows={3} />
            <CMSTextarea label={`${t('form.technology')} (${t('form.arabic')})`} value={formData.technology_ar} onChange={(e) => handleChange('technology_ar', e.target.value)} rows={3} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.outcome')} (${t('form.english')})`} value={formData.outcome_en} onChange={(e) => handleChange('outcome_en', e.target.value)} rows={3} />
            <CMSTextarea label={`${t('form.outcome')} (${t('form.arabic')})`} value={formData.outcome_ar} onChange={(e) => handleChange('outcome_ar', e.target.value)} rows={3} dir="rtl" />
          </div>
          <div className="cms-form-grid">
            <CMSMediaField label={t('form.logo')} value={formData.logo} onChange={(_id, asset) => handleChange('logo', asset)} usageLabel="case-study-logo" />
            <CMSMediaField label={t('form.featuredImage')} value={formData.featured_image} onChange={(_id, asset) => handleChange('featured_image', asset)} usageLabel="case-study-featured-image" />
          </div>
          <div className="cms-form-grid">
            <CMSInput label={t('form.partnerId')} type="number" value={formData.partner?.id ?? formData.partner ?? ''} onChange={(e) => handleChange('partner', e.target.value ? parseInt(e.target.value) : null)} />
            <CMSInput label={t('form.projectUrl')} value={formData.project_url} onChange={(e) => handleChange('project_url', e.target.value)} />
            <CMSInput label={t('form.projectYear')} type="number" value={formData.project_year} onChange={(e) => handleChange('project_year', e.target.value ? parseInt(e.target.value) : '')} />
          </div>
          <div className="cms-form-grid">
            <CMSInput label={t('form.order')} type="number" value={formData.display_order} onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)} />
          </div>
          <div style={styles.checkboxes}>
            <CMSCheckbox label={t('form.active')} checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
            <CMSCheckbox label={t('form.featured')} checked={formData.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} />
            <CMSCheckbox label={t('form.homepage')} checked={formData.show_on_homepage} onChange={(e) => handleChange('show_on_homepage', e.target.checked)} />
            <CMSCheckbox label={t('form.openInNewTab')} checked={formData.open_in_new_tab} onChange={(e) => handleChange('open_in_new_tab', e.target.checked)} />
          </div>
          <SEOSection
            formData={formData}
            onChange={handleChange}
            fieldErrors={fieldErrors}
            canEdit={true}
            t={t}
            slug={formData.slug}
            basePath="/case-studies"
          />
        </div>
      )}
    </CMSLayout>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' },
  checkboxes: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  section: { background: '#12121e', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  sectionTitle: { fontSize: '0.75rem', fontWeight: '600', color: '#c9a96e', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 },
};
