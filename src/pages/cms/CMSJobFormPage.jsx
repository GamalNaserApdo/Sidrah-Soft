/**
 * CMS Job Form Page — /cms/careers/new and /cms/careers/:id
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getJob, createJob, updateJob } from '../../services/cms/careersApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

const EMPTY = {
  title_en: '', title_ar: '', slug: '',
  department_en: '', department_ar: '',
  location_en: '', location_ar: '',
  short_description_en: '', short_description_ar: '',
  description_en: '', description_ar: '',
  responsibilities_en: '', responsibilities_ar: '',
  requirements_en: '', requirements_ar: '',
  preferred_qualifications_en: '', preferred_qualifications_ar: '',
  benefits_en: '', benefits_ar: '',
  employment_type: 'full_time', workplace_type: 'onsite', experience_level: 'mid_level',
  application_method: 'email', external_apply_url: '', application_email: '',
  posted_date: '', closing_date: '',
  display_order: 0, is_active: true, is_featured: false, show_on_homepage: false,
  seo_title_en: '', seo_title_ar: '', seo_description_en: '', seo_description_ar: '',
};

export default function CMSJobFormPage() {
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
      const data = await getJob(id);
      setFormData({
        ...EMPTY,
        title_en: data.title_en || '', title_ar: data.title_ar || '', slug: data.slug || '',
        department_en: data.department_en || '', department_ar: data.department_ar || '',
        location_en: data.location_en || '', location_ar: data.location_ar || '',
        short_description_en: data.short_description_en || '', short_description_ar: data.short_description_ar || '',
        description_en: data.description_en || '', description_ar: data.description_ar || '',
        responsibilities_en: data.responsibilities_en || '', responsibilities_ar: data.responsibilities_ar || '',
        requirements_en: data.requirements_en || '', requirements_ar: data.requirements_ar || '',
        preferred_qualifications_en: data.preferred_qualifications_en || '', preferred_qualifications_ar: data.preferred_qualifications_ar || '',
        benefits_en: data.benefits_en || '', benefits_ar: data.benefits_ar || '',
        employment_type: data.employment_type || 'full_time', workplace_type: data.workplace_type || 'onsite',
        experience_level: data.experience_level || 'mid_level',
        application_method: data.application_method || 'email', external_apply_url: data.external_apply_url || '',
        application_email: data.application_email || '',
        posted_date: data.posted_date || '', closing_date: data.closing_date || '',
        display_order: data.display_order || 0, is_active: data.is_active ?? true, is_featured: data.is_featured ?? false,
        show_on_homepage: data.show_on_homepage ?? false,
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
      if (isEdit) await updateJob(id, formData);
      else await createJob(formData);
      setDirty(false);
      showSuccess(t('msg.saved'));
      navigate('/cms/careers');
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally { setSaving(false); }
  };

  if (isEdit && !hasCapability('careers.update') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;
  if (!isEdit && !hasCapability('careers.create') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isEdit ? `${t('action.edit')} ${formData.title_en || 'Job'}` : `${t('action.addNew')} ${t('nav.careers')}`}
        actions={
          <>
            <Link to="/cms/careers"><CMSButton variant="secondary">{t('action.cancel')}</CMSButton></Link>
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
            <CMSInput label={`${t('form.department')} (${t('form.english')})`} value={formData.department_en} onChange={(e) => handleChange('department_en', e.target.value)} />
            <CMSInput label={`${t('form.department')} (${t('form.arabic')})`} value={formData.department_ar} onChange={(e) => handleChange('department_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.location')} (${t('form.english')})`} value={formData.location_en} onChange={(e) => handleChange('location_en', e.target.value)} />
            <CMSInput label={`${t('form.location')} (${t('form.arabic')})`} value={formData.location_ar} onChange={(e) => handleChange('location_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.english')})`} value={formData.short_description_en} onChange={(e) => handleChange('short_description_en', e.target.value)} rows={2} />
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.arabic')})`} value={formData.short_description_ar} onChange={(e) => handleChange('short_description_ar', e.target.value)} rows={2} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.description')} (${t('form.english')})`} value={formData.description_en} onChange={(e) => handleChange('description_en', e.target.value)} rows={4} />
            <CMSTextarea label={`${t('form.description')} (${t('form.arabic')})`} value={formData.description_ar} onChange={(e) => handleChange('description_ar', e.target.value)} rows={4} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.responsibilities')} (${t('form.english')})`} value={formData.responsibilities_en} onChange={(e) => handleChange('responsibilities_en', e.target.value)} rows={4} />
            <CMSTextarea label={`${t('form.responsibilities')} (${t('form.arabic')})`} value={formData.responsibilities_ar} onChange={(e) => handleChange('responsibilities_ar', e.target.value)} rows={4} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.requirements')} (${t('form.english')})`} value={formData.requirements_en} onChange={(e) => handleChange('requirements_en', e.target.value)} rows={4} />
            <CMSTextarea label={`${t('form.requirements')} (${t('form.arabic')})`} value={formData.requirements_ar} onChange={(e) => handleChange('requirements_ar', e.target.value)} rows={4} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.preferredQualifications')} (${t('form.english')})`} value={formData.preferred_qualifications_en} onChange={(e) => handleChange('preferred_qualifications_en', e.target.value)} rows={3} />
            <CMSTextarea label={`${t('form.preferredQualifications')} (${t('form.arabic')})`} value={formData.preferred_qualifications_ar} onChange={(e) => handleChange('preferred_qualifications_ar', e.target.value)} rows={3} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.benefits')} (${t('form.english')})`} value={formData.benefits_en} onChange={(e) => handleChange('benefits_en', e.target.value)} rows={3} />
            <CMSTextarea label={`${t('form.benefits')} (${t('form.arabic')})`} value={formData.benefits_ar} onChange={(e) => handleChange('benefits_ar', e.target.value)} rows={3} dir="rtl" />
          </div>
          <div className="cms-form-grid">
            <CMSSelect label={t('form.employmentType')} value={formData.employment_type} onChange={(e) => handleChange('employment_type', e.target.value)}>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
              <option value="volunteer">Volunteer</option>
            </CMSSelect>
            <CMSSelect label={t('form.workplaceType')} value={formData.workplace_type} onChange={(e) => handleChange('workplace_type', e.target.value)}>
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </CMSSelect>
            <CMSSelect label={t('form.experienceLevel')} value={formData.experience_level} onChange={(e) => handleChange('experience_level', e.target.value)}>
              <option value="entry_level">Entry Level</option>
              <option value="associate">Associate</option>
              <option value="mid_level">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
              <option value="executive">Executive</option>
            </CMSSelect>
          </div>
          <div className="cms-form-grid">
            <CMSSelect label={t('form.applicationMethod')} value={formData.application_method} onChange={(e) => handleChange('application_method', e.target.value)}>
              <option value="email">Email</option>
              <option value="external_url">External URL</option>
            </CMSSelect>
            <CMSInput label={t('form.applicationEmail')} type="email" value={formData.application_email} onChange={(e) => handleChange('application_email', e.target.value)} disabled={formData.application_method !== 'email'} />
            <CMSInput label={t('form.externalApplyUrl')} value={formData.external_apply_url} onChange={(e) => handleChange('external_apply_url', e.target.value)} disabled={formData.application_method !== 'external_url'} />
          </div>
          <div className="cms-form-grid">
            <CMSInput label={t('form.postedDate')} type="date" value={formData.posted_date} onChange={(e) => handleChange('posted_date', e.target.value)} />
            <CMSInput label={t('form.closingDate')} type="date" value={formData.closing_date} onChange={(e) => handleChange('closing_date', e.target.value)} />
            <CMSInput label={t('form.order')} type="number" value={formData.display_order} onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)} />
          </div>
          <div style={styles.checkboxes}>
            <CMSCheckbox label={t('form.active')} checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
            <CMSCheckbox label={t('form.featured')} checked={formData.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} />
            <CMSCheckbox label={t('form.homepage')} checked={formData.show_on_homepage} onChange={(e) => handleChange('show_on_homepage', e.target.checked)} />
          </div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('form.seo')}</h3>
            <div className="cms-bilingual-row">
              <CMSInput label={`${t('form.seoTitle')} (${t('form.english')})`} value={formData.seo_title_en} onChange={(e) => handleChange('seo_title_en', e.target.value)} />
              <CMSInput label={`${t('form.seoTitle')} (${t('form.arabic')})`} value={formData.seo_title_ar} onChange={(e) => handleChange('seo_title_ar', e.target.value)} dir="rtl" />
            </div>
            <div className="cms-bilingual-row">
              <CMSTextarea label={`${t('form.seoDescription')} (${t('form.english')})`} value={formData.seo_description_en} onChange={(e) => handleChange('seo_description_en', e.target.value)} rows={2} />
              <CMSTextarea label={`${t('form.seoDescription')} (${t('form.arabic')})`} value={formData.seo_description_ar} onChange={(e) => handleChange('seo_description_ar', e.target.value)} rows={2} dir="rtl" />
            </div>
          </div>
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
