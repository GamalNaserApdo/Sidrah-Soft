/**
 * CMS Article Form Page — /cms/insights/new and /cms/insights/:id
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
import { getArticle, createArticle, updateArticle } from '../../services/cms/insightsApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

const EMPTY = {
  title_en: '', title_ar: '', slug: '',
  excerpt_en: '', excerpt_ar: '',
  body_en: '', body_ar: '',
  content_type: 'insight', status: 'draft', published_at: '',
  author_name_en: '', author_name_ar: '', category_en: '', category_ar: '',
  featured_image: null,
  display_order: 0, is_featured: false, show_on_homepage: false,
  read_time_minutes: 3,
  seo_title_en: '', seo_title_ar: '', seo_description_en: '', seo_description_ar: '',
  canonical_url: '',
  og_title_en: '', og_title_ar: '', og_description_en: '', og_description_ar: '',
  og_image: null,
  robots_index: true, robots_follow: true,
};

export default function CMSArticleFormPage() {
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
      const data = await getArticle(id);
      setFormData({
        ...EMPTY,
        title_en: data.title_en || '', title_ar: data.title_ar || '', slug: data.slug || '',
        excerpt_en: data.excerpt_en || '', excerpt_ar: data.excerpt_ar || '',
        body_en: data.body_en || '', body_ar: data.body_ar || '',
        content_type: data.content_type || 'insight', status: data.status || 'draft',
        author_name_en: data.author_name_en || '', author_name_ar: data.author_name_ar || '',
        category_en: data.category_en || '', category_ar: data.category_ar || '',
        featured_image: data.featured_image || null,
        published_at: data.published_at ? data.published_at.slice(0, 16) : '',
        display_order: data.display_order || 0, is_featured: data.is_featured ?? false,
        show_on_homepage: data.show_on_homepage ?? false,
        read_time_minutes: data.read_time_minutes || 3,
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
      if (payload.featured_image && typeof payload.featured_image === 'object') payload.featured_image = payload.featured_image.id;
      if (payload.og_image && typeof payload.og_image === 'object') payload.og_image = payload.og_image.id;
      // status and published_at are read-only on write serializer; workflow actions manage them.
      delete payload.status;
      delete payload.published_at;
      if (isEdit) await updateArticle(id, payload);
      else await createArticle(payload);
      setDirty(false);
      showSuccess(t('msg.saved'));
      navigate('/cms/insights');
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally { setSaving(false); }
  };

  if (isEdit && !hasCapability('insights.update') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;
  if (!isEdit && !hasCapability('insights.create') && !loading)
    return <CMSLayout><CMSErrorState message="Permission denied." /></CMSLayout>;

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isEdit ? `${t('action.edit')} ${formData.title_en || 'Article'}` : `${t('action.addNew')} ${t('nav.insights')}`}
        actions={
          <>
            <Link to="/cms/insights"><CMSButton variant="secondary">{t('action.cancel')}</CMSButton></Link>
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
          <div className="cms-form-grid">
            <CMSSelect label={t('form.contentType')} value={formData.content_type} onChange={(e) => handleChange('content_type', e.target.value)} error={fieldErrors.content_type}>
              <option value="insight">Insight</option>
              <option value="article">Article</option>
              <option value="news">News</option>
              <option value="announcement">Announcement</option>
            </CMSSelect>
            <CMSSelect label={t('form.status')} value={formData.status} onChange={(e) => handleChange('status', e.target.value)} error={fieldErrors.status} disabled>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </CMSSelect>
          </div>
          <div className="cms-form-grid">
            <CMSInput label={`${t('form.author')} (${t('form.english')})`} value={formData.author_name_en} onChange={(e) => handleChange('author_name_en', e.target.value)} />
            <CMSInput label={`${t('form.author')} (${t('form.arabic')})`} value={formData.author_name_ar} onChange={(e) => handleChange('author_name_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.category')} (${t('form.english')})`} value={formData.category_en} onChange={(e) => handleChange('category_en', e.target.value)} />
            <CMSInput label={`${t('form.category')} (${t('form.arabic')})`} value={formData.category_ar} onChange={(e) => handleChange('category_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.excerpt')} (${t('form.english')})`} value={formData.excerpt_en} onChange={(e) => handleChange('excerpt_en', e.target.value)} rows={2} />
            <CMSTextarea label={`${t('form.excerpt')} (${t('form.arabic')})`} value={formData.excerpt_ar} onChange={(e) => handleChange('excerpt_ar', e.target.value)} rows={2} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.body')} (${t('form.english')})`} value={formData.body_en} onChange={(e) => handleChange('body_en', e.target.value)} rows={10} />
            <CMSTextarea label={`${t('form.body')} (${t('form.arabic')})`} value={formData.body_ar} onChange={(e) => handleChange('body_ar', e.target.value)} rows={10} dir="rtl" />
          </div>
          <CMSMediaField label={t('form.featuredImage')} value={formData.featured_image} onChange={(_id, asset) => handleChange('featured_image', asset)} usageLabel="article-featured-image" />
          <div className="cms-form-grid">
            <CMSInput label={t('form.publishedAt')} type="datetime-local" value={formData.published_at} onChange={(e) => handleChange('published_at', e.target.value)} disabled />
            <CMSInput label={t('form.readTime')} type="number" value={formData.read_time_minutes} onChange={(e) => handleChange('read_time_minutes', parseInt(e.target.value) || 0)} />
            <CMSInput label={t('form.order')} type="number" value={formData.display_order} onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)} />
          </div>
          <div style={styles.checkboxes}>
            <CMSCheckbox label={t('form.featured')} checked={formData.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} />
            <CMSCheckbox label={t('form.homepage')} checked={formData.show_on_homepage} onChange={(e) => handleChange('show_on_homepage', e.target.checked)} />
          </div>
          <SEOSection
            formData={formData}
            onChange={handleChange}
            fieldErrors={fieldErrors}
            canEdit={true}
            t={t}
            slug={formData.slug}
            basePath="/insights"
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
