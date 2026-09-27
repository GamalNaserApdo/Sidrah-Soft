import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSSelect, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import {
  getProgram,
  updateProgram,
  publishProgram,
  unpublishProgram,
  archiveProgram,
  listModules,
  createModule,
  updateModule,
  deleteModule,
  createTopic,
  updateTopic,
  deleteTopic,
  listFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
  listInstructors,
  createInstructor,
  listProgramInstructors,
  assignInstructor,
  removeProgramInstructor,
  reorderNested,
} from '../../services/cms/trainingApi';
import { parseApiError, extractFieldErrors, cmsFetch } from '../../services/cms/cmsFetch';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'content', label: 'Content' },
  { id: 'instructors', label: 'Instructors' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'seo', label: 'SEO' },
  { id: 'preview', label: 'Preview' },
];

const VIDEO_TYPE_OPTIONS = [
  { value: 'none', label: 'No video' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'uploaded', label: 'Uploaded file' },
];

function jsonListToString(items) {
  if (!items) return '';
  const list = items.en || items;
  if (!Array.isArray(list)) return '';
  return list.filter(Boolean).join('\n');
}

function stringToJsonList(str) {
  return {
    en: str.split('\n').map((s) => s.trim()).filter(Boolean),
    ar: [],
  };
}

export default function CMSTrainingLandingPage() {
  const { id } = useParams();
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canUpdate = hasCapability('training.update');
  const [activeTab, setActiveTab] = useState('overview');
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  // Landing form data (flat fields matching API)
  const [landingData, setLandingData] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProgram(id);
      setProgram(data);
      const l = data.landing || {};
      setLandingData({
        headline_en: l.headline_en || '',
        headline_ar: l.headline_ar || '',
        intro_video_type: l.intro_video_type || 'none',
        intro_video_url: l.intro_video_url || '',
        intro_video_file: l.intro_video_file || null,
        video_poster: l.video_poster || null,
        video_title_en: l.video_title_en || '',
        video_title_ar: l.video_title_ar || '',
        quick_facts: l.quick_facts || {},
        current_price: l.current_price || '',
        original_price: l.original_price || '',
        currency: l.currency || 'EGP',
        included_items: l.included_items || { en: [], ar: [] },
        show_pricing: l.show_pricing !== false,
        target_audience: l.target_audience || { en: [], ar: [] },
        prerequisites: l.prerequisites || { en: [], ar: [] },
        tools: l.tools || { en: [], ar: [] },
        practical_training_en: l.practical_training_en || '',
        practical_training_ar: l.practical_training_ar || '',
        final_project_en: l.final_project_en || '',
        final_project_ar: l.final_project_ar || '',
        seo_title_en: l.seo_title_en || '',
        seo_title_ar: l.seo_title_ar || '',
        seo_meta_description_en: l.seo_meta_description_en || '',
        seo_meta_description_ar: l.seo_meta_description_ar || '',
        og_image: l.og_image || null,
        canonical_slug: l.canonical_slug || '',
        seo_noindex: l.seo_noindex || false,
      });
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLandingChange = (field, value) => {
    setLandingData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSaveLanding = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = { landing: { ...landingData } };
      // Convert media assets to IDs
      if (payload.landing.intro_video_file && typeof payload.landing.intro_video_file === 'object') {
        payload.landing.intro_video_file = payload.landing.intro_video_file.id;
      }
      if (payload.landing.video_poster && typeof payload.landing.video_poster === 'object') {
        payload.landing.video_poster = payload.landing.video_poster.id;
      }
      if (payload.landing.og_image && typeof payload.landing.og_image === 'object') {
        payload.landing.og_image = payload.landing.og_image.id;
      }
      // Convert price strings to numbers
      if (payload.landing.current_price) payload.landing.current_price = parseFloat(payload.landing.current_price);
      if (payload.landing.original_price) payload.landing.original_price = parseFloat(payload.landing.original_price);
      await updateProgram(id, payload);
      setDirty(false);
      showSuccess('Landing page saved');
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishProgram(id);
      showSuccess('Program published');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishProgram(id);
      showSuccess('Program unpublished (draft)');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this program? It will be hidden from the public site.')) return;
    try {
      await archiveProgram(id);
      showSuccess('Program archived');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (loading) return <CMSLayout><CMSLoadingState /></CMSLayout>;
  if (error) return <CMSLayout><CMSErrorState message={error} onRetry={load} /></CMSLayout>;
  if (!canUpdate) return <CMSLayout><CMSErrorState message={t('common.accessDenied')} /></CMSLayout>;

  const statusBadge = {
    active: { label: 'Published', color: 'var(--cms-success)' },
    draft: { label: 'Draft', color: 'var(--cms-warning, #f59e0b)' },
    archived: { label: 'Archived', color: 'var(--cms-danger)' },
  }[program?.status] || { label: program?.status, color: 'var(--cms-text-secondary)' };

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={`Landing: ${program?.title_en || 'Program'}`}
        actions={
          <>
            <Link to="/cms/training">
              <CMSButton variant="secondary">{t('action.back')}</CMSButton>
            </Link>
            <Link to={`/cms/training/${id}`}>
              <CMSButton variant="secondary">Edit Basic Info</CMSButton>
            </Link>
            {program?.status !== 'active' && (
              <CMSButton variant="primary" onClick={handlePublish}>Publish</CMSButton>
            )}
            {program?.status === 'active' && (
              <CMSButton variant="secondary" onClick={handleUnpublish}>Unpublish</CMSButton>
            )}
            <CMSButton variant="danger" onClick={handleArchive}>Archive</CMSButton>
          </>
        }
      />

      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: `${statusBadge.color}22`,
          color: statusBadge.color,
          border: `1px solid ${statusBadge.color}44`,
        }}>
          {statusBadge.label}
        </span>
        <span style={{ color: 'var(--cms-text-muted)', fontSize: '0.8125rem' }}>
          /training/{program?.slug}
        </span>
      </div>

      {/* Tabs */}
      <div style={tabStyles.container}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...tabStyles.tab,
              ...(activeTab === tab.id ? tabStyles.activeTab : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ marginTop: '1.5rem', maxWidth: '960px' }}>
        {activeTab === 'overview' && (
          <OverviewTab
            data={landingData}
            onChange={handleLandingChange}
            fieldErrors={fieldErrors}
            onSave={handleSaveLanding}
            saving={saving}
            dirty={dirty}
          />
        )}
        {activeTab === 'pricing' && (
          <PricingTab
            data={landingData}
            onChange={handleLandingChange}
            fieldErrors={fieldErrors}
            onSave={handleSaveLanding}
            saving={saving}
            dirty={dirty}
          />
        )}
        {activeTab === 'curriculum' && <CurriculumTab programId={id} />}
        {activeTab === 'content' && (
          <ContentTab
            data={landingData}
            onChange={handleLandingChange}
            onSave={handleSaveLanding}
            saving={saving}
            dirty={dirty}
          />
        )}
        {activeTab === 'instructors' && <InstructorsTab programId={id} />}
        {activeTab === 'testimonials' && <TestimonialsTab programId={id} />}
        {activeTab === 'faq' && <FAQTab programId={id} />}
        {activeTab === 'seo' && (
          <SEOTab
            data={landingData}
            onChange={handleLandingChange}
            onSave={handleSaveLanding}
            saving={saving}
            dirty={dirty}
          />
        )}
        {activeTab === 'preview' && <PreviewTab program={program} />}
      </div>
    </CMSLayout>
  );
}

// ---------------------------------------------------------------------------
// Tab: Overview
// ---------------------------------------------------------------------------

function OverviewTab({ data, onChange, fieldErrors, onSave, saving, dirty }) {
  return (
    <div style={sectionStyles.form}>
      <div className="cms-bilingual-row">
        <CMSInput
          label="Headline (EN)"
          value={data.headline_en}
          onChange={(e) => onChange('headline_en', e.target.value)}
          error={fieldErrors.headline_en}
          hint="Appears in the hero section"
        />
        <CMSInput
          label="Headline (AR)"
          value={data.headline_ar}
          onChange={(e) => onChange('headline_ar', e.target.value)}
          error={fieldErrors.headline_ar}
          dir="rtl"
        />
      </div>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Intro Video</legend>
        <CMSSelect
          label="Video type"
          value={data.intro_video_type}
          onChange={(e) => onChange('intro_video_type', e.target.value)}
        >
          {VIDEO_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </CMSSelect>
        {data.intro_video_type === 'youtube' && (
          <CMSInput
            label="YouTube URL"
            value={data.intro_video_url}
            onChange={(e) => onChange('intro_video_url', e.target.value)}
            error={fieldErrors.intro_video_url}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        )}
        {data.intro_video_type === 'uploaded' && (
          <CMSMediaField
            label="Video file"
            value={data.intro_video_file}
            onChange={(_id, asset) => onChange('intro_video_file', asset)}
            usageLabel="landing-intro-video"
          />
        )}
        <CMSMediaField
          label="Video poster image"
          value={data.video_poster}
          onChange={(_id, asset) => onChange('video_poster', asset)}
          usageLabel="landing-video-poster"
        />
        <div className="cms-bilingual-row">
          <CMSInput
            label="Video title (EN)"
            value={data.video_title_en}
            onChange={(e) => onChange('video_title_en', e.target.value)}
          />
          <CMSInput
            label="Video title (AR)"
            value={data.video_title_ar}
            onChange={(e) => onChange('video_title_ar', e.target.value)}
            dir="rtl"
          />
        </div>
      </fieldset>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Quick Facts</legend>
        <p style={sectionStyles.hint}>Key-value pairs shown in the course details section (e.g., duration, format, certificate).</p>
        <QuickFactsEditor
          facts={data.quick_facts || {}}
          onChange={(facts) => onChange('quick_facts', facts)}
        />
      </fieldset>

      <SaveButton onSave={onSave} saving={saving} dirty={dirty} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Pricing
// ---------------------------------------------------------------------------

function PricingTab({ data, onChange, fieldErrors, onSave, saving, dirty }) {
  return (
    <div style={sectionStyles.form}>
      <CMSCheckbox
        label="Show pricing section on landing page"
        checked={data.show_pricing !== false}
        onChange={(e) => onChange('show_pricing', e.target.checked)}
      />

      <div className="cms-form-grid" style={sectionStyles.grid2}>
        <CMSInput
          label="Current Price"
          type="number"
          value={data.current_price}
          onChange={(e) => onChange('current_price', e.target.value)}
          error={fieldErrors.current_price}
          placeholder="6000"
        />
        <CMSInput
          label="Original Price (optional, for discount display)"
          type="number"
          value={data.original_price}
          onChange={(e) => onChange('original_price', e.target.value)}
          error={fieldErrors.original_price}
          placeholder="10000"
        />
        <CMSSelect
          label="Currency"
          value={data.currency}
          onChange={(e) => onChange('currency', e.target.value)}
        >
          <option value="EGP">EGP (Egyptian Pound)</option>
          <option value="USD">USD (US Dollar)</option>
          <option value="EUR">EUR (Euro)</option>
          <option value="SAR">SAR (Saudi Riyal)</option>
          <option value="AED">AED (UAE Dirham)</option>
        </CMSSelect>
      </div>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>What's Included</legend>
        <p style={sectionStyles.hint}>One item per line. These appear in the pricing section.</p>
        <div className="cms-bilingual-row">
          <CMSTextarea
            label="Included items (EN)"
            value={jsonListToString(data.included_items)}
            onChange={(e) => onChange('included_items', { ...data.included_items, en: e.target.value.split('\n').filter(Boolean) })}
            rows={5}
          />
          <CMSTextarea
            label="Included items (AR)"
            value={(data.included_items?.ar || []).join('\n')}
            onChange={(e) => onChange('included_items', { ...data.included_items, ar: e.target.value.split('\n').filter(Boolean) })}
            rows={5}
            dir="rtl"
          />
        </div>
      </fieldset>

      <SaveButton onSave={onSave} saving={saving} dirty={dirty} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Curriculum (modules + topics)
// ---------------------------------------------------------------------------

function CurriculumTab({ programId }) {
  const { showSuccess, showError } = useToast();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listModules(programId);
      setModules(data.results || data);
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [programId, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveModule = async (moduleData) => {
    try {
      if (moduleData.id) {
        await updateModule(moduleData.id, moduleData);
      } else {
        await createModule(programId, moduleData);
      }
      showSuccess('Module saved');
      setEditingModule(null);
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its topics?')) return;
    try {
      await deleteModule(moduleId);
      showSuccess('Module deleted');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleSaveTopic = async (moduleId, topicData) => {
    try {
      if (topicData.id) {
        await updateTopic(topicData.id, topicData);
      } else {
        await createTopic(moduleId, topicData);
      }
      showSuccess('Topic saved');
      setEditingTopic(null);
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await deleteTopic(topicId);
      showSuccess('Topic deleted');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (loading) return <CMSLoadingState />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--cms-accent)' }}>Curriculum Modules</h3>
        <CMSButton variant="primary" onClick={() => setEditingModule({})}>+ Add Module</CMSButton>
      </div>

      {modules.length === 0 && (
        <p style={{ color: 'var(--cms-text-muted)' }}>No modules yet. Click "Add Module" to create the first one.</p>
      )}

      {modules.map((m, idx) => (
        <div key={m.id} style={moduleStyles.container}>
          <div style={moduleStyles.header}>
            <button
              style={moduleStyles.expandBtn}
              onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)}
            >
              {expandedModule === m.id ? '▼' : '▶'}
            </button>
            <span style={moduleStyles.order}>#{m.display_order + 1}</span>
            <span style={moduleStyles.title}>{m.title_en || '(untitled)'}</span>
            {m.is_published ? (
              <span style={moduleStyles.published}>Published</span>
            ) : (
              <span style={moduleStyles.draft}>Draft</span>
            )}
            <div style={{ flex: 1 }} />
            <CMSButton variant="secondary" onClick={() => setEditingModule(m)}>Edit</CMSButton>
            <CMSButton variant="danger" onClick={() => handleDeleteModule(m.id)}>Delete</CMSButton>
          </div>

          {expandedModule === m.id && (
            <div style={moduleStyles.topics}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--cms-text-secondary)', fontSize: '0.8125rem' }}>Topics ({m.topics?.length || 0})</strong>
                <CMSButton variant="secondary" onClick={() => setEditingTopic({ module_id: m.id })}>+ Add Topic</CMSButton>
              </div>
              {(m.topics || []).map((t, tIdx) => (
                <div key={t.id} style={moduleStyles.topicRow}>
                  <span style={{ color: 'var(--cms-text-muted)', fontSize: '0.75rem' }}>{tIdx + 1}.</span>
                  <span style={{ color: 'var(--cms-text-primary)' }}>{t.title_en || '(untitled topic)'}</span>
                  <div style={{ flex: 1 }} />
                  <button style={moduleStyles.smallBtn} onClick={() => setEditingTopic({ ...t, module_id: m.id })}>Edit</button>
                  <button style={moduleStyles.smallDangerBtn} onClick={() => handleDeleteTopic(t.id)}>×</button>
                </div>
              ))}
              {(!m.topics || m.topics.length === 0) && (
                <p style={{ color: 'var(--cms-text-muted)', fontSize: '0.8125rem' }}>No topics yet.</p>
              )}
            </div>
          )}
        </div>
      ))}

      {editingModule && (
        <ModuleEditDialog
          module={editingModule}
          onSave={handleSaveModule}
          onClose={() => setEditingModule(null)}
        />
      )}

      {editingTopic && (
        <TopicEditDialog
          topic={editingTopic}
          onSave={(data) => handleSaveTopic(editingTopic.module_id, data)}
          onClose={() => setEditingTopic(null)}
        />
      )}
    </div>
  );
}

function ModuleEditDialog({ module, onSave, onClose }) {
  const [data, setData] = useState({
    title_en: module.title_en || '',
    title_ar: module.title_ar || '',
    description_en: module.description_en || '',
    description_ar: module.description_ar || '',
    display_order: module.display_order || 0,
    is_published: module.is_published !== false,
  });

  return (
    <div style={dialogStyles.overlay} onClick={onClose}>
      <div style={dialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={dialogStyles.title}>{module.id ? 'Edit Module' : 'New Module'}</h3>
        <div className="cms-bilingual-row">
          <CMSInput label="Title (EN)" value={data.title_en} onChange={(e) => setData({ ...data, title_en: e.target.value })} />
          <CMSInput label="Title (AR)" value={data.title_ar} onChange={(e) => setData({ ...data, title_ar: e.target.value })} dir="rtl" />
        </div>
        <div className="cms-bilingual-row">
          <CMSTextarea label="Description (EN)" value={data.description_en} onChange={(e) => setData({ ...data, description_en: e.target.value })} rows={3} />
          <CMSTextarea label="Description (AR)" value={data.description_ar} onChange={(e) => setData({ ...data, description_ar: e.target.value })} rows={3} dir="rtl" />
        </div>
        <CMSInput label="Display order" type="number" value={data.display_order} onChange={(e) => setData({ ...data, display_order: parseInt(e.target.value) || 0 })} />
        <CMSCheckbox label="Published" checked={data.is_published} onChange={(e) => setData({ ...data, is_published: e.target.checked })} />
        <div style={dialogStyles.actions}>
          <CMSButton variant="secondary" onClick={onClose}>Cancel</CMSButton>
          <CMSButton variant="primary" onClick={() => onSave({ ...module, ...data })}>Save</CMSButton>
        </div>
      </div>
    </div>
  );
}

function TopicEditDialog({ topic, onSave, onClose }) {
  const [data, setData] = useState({
    title_en: topic.title_en || '',
    title_ar: topic.title_ar || '',
    display_order: topic.display_order || 0,
  });

  return (
    <div style={dialogStyles.overlay} onClick={onClose}>
      <div style={dialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={dialogStyles.title}>{topic.id ? 'Edit Topic' : 'New Topic'}</h3>
        <div className="cms-bilingual-row">
          <CMSInput label="Title (EN)" value={data.title_en} onChange={(e) => setData({ ...data, title_en: e.target.value })} />
          <CMSInput label="Title (AR)" value={data.title_ar} onChange={(e) => setData({ ...data, title_ar: e.target.value })} dir="rtl" />
        </div>
        <CMSInput label="Display order" type="number" value={data.display_order} onChange={(e) => setData({ ...data, display_order: parseInt(e.target.value) || 0 })} />
        <div style={dialogStyles.actions}>
          <CMSButton variant="secondary" onClick={onClose}>Cancel</CMSButton>
          <CMSButton variant="primary" onClick={() => onSave({ ...topic, ...data })}>Save</CMSButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Content (target audience, prerequisites, tools, practical, final project)
// ---------------------------------------------------------------------------

function ContentTab({ data, onChange, onSave, saving, dirty }) {
  return (
    <div style={sectionStyles.form}>
      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Target Audience</legend>
        <p style={sectionStyles.hint}>One per line.</p>
        <div className="cms-bilingual-row">
          <CMSTextarea
            label="Target audience (EN)"
            value={jsonListToString(data.target_audience)}
            onChange={(e) => onChange('target_audience', { ...data.target_audience, en: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
          />
          <CMSTextarea
            label="Target audience (AR)"
            value={(data.target_audience?.ar || []).join('\n')}
            onChange={(e) => onChange('target_audience', { ...data.target_audience, ar: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
            dir="rtl"
          />
        </div>
      </fieldset>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Prerequisites</legend>
        <div className="cms-bilingual-row">
          <CMSTextarea
            label="Prerequisites (EN)"
            value={jsonListToString(data.prerequisites)}
            onChange={(e) => onChange('prerequisites', { ...data.prerequisites, en: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
          />
          <CMSTextarea
            label="Prerequisites (AR)"
            value={(data.prerequisites?.ar || []).join('\n')}
            onChange={(e) => onChange('prerequisites', { ...data.prerequisites, ar: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
            dir="rtl"
          />
        </div>
      </fieldset>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Tools & Technologies</legend>
        <div className="cms-bilingual-row">
          <CMSTextarea
            label="Tools (EN)"
            value={jsonListToString(data.tools)}
            onChange={(e) => onChange('tools', { ...data.tools, en: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
          />
          <CMSTextarea
            label="Tools (AR)"
            value={(data.tools?.ar || []).join('\n')}
            onChange={(e) => onChange('tools', { ...data.tools, ar: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
            dir="rtl"
          />
        </div>
      </fieldset>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Practical Training</legend>
        <div className="cms-bilingual-row">
          <CMSTextarea
            label="Practical training (EN)"
            value={data.practical_training_en}
            onChange={(e) => onChange('practical_training_en', e.target.value)}
            rows={5}
          />
          <CMSTextarea
            label="Practical training (AR)"
            value={data.practical_training_ar}
            onChange={(e) => onChange('practical_training_ar', e.target.value)}
            rows={5}
            dir="rtl"
          />
        </div>
      </fieldset>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Final Project</legend>
        <div className="cms-bilingual-row">
          <CMSTextarea
            label="Final project (EN)"
            value={data.final_project_en}
            onChange={(e) => onChange('final_project_en', e.target.value)}
            rows={5}
          />
          <CMSTextarea
            label="Final project (AR)"
            value={data.final_project_ar}
            onChange={(e) => onChange('final_project_ar', e.target.value)}
            rows={5}
            dir="rtl"
          />
        </div>
      </fieldset>

      <SaveButton onSave={onSave} saving={saving} dirty={dirty} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Instructors
// ---------------------------------------------------------------------------

function InstructorsTab({ programId }) {
  const { showSuccess, showError } = useToast();
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [assignedData, availableData] = await Promise.all([
        listProgramInstructors(programId),
        listInstructors({ search }),
      ]);
      setAssigned(assignedData.results || assignedData);
      setAvailable(availableData.results || availableData);
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [programId, search, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async (instructorId) => {
    try {
      await assignInstructor(programId, instructorId, assigned.length);
      showSuccess('Instructor assigned');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleRemove = async (piId) => {
    if (!confirm('Remove this instructor from the program?')) return;
    try {
      await removeProgramInstructor(piId);
      showSuccess('Instructor removed');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleCreateInstructor = async (data) => {
    try {
      await createInstructor(data);
      showSuccess('Instructor created');
      setShowCreate(false);
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (loading) return <CMSLoadingState />;

  const assignedIds = new Set(assigned.map((a) => a.instructor));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--cms-accent)' }}>Instructors</h3>
        <CMSButton variant="primary" onClick={() => setShowCreate({})}>+ New Instructor</CMSButton>
      </div>

      {/* Assigned instructors */}
      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Assigned to this program ({assigned.length})</legend>
        {assigned.length === 0 && <p style={{ color: 'var(--cms-text-muted)' }}>No instructors assigned yet.</p>}
        {assigned.map((pi) => (
          <div key={pi.id} style={instructorStyles.row}>
            <span style={instructorStyles.name}>{pi.instructor_name || `Instructor #${pi.instructor}`}</span>
            <CMSButton variant="danger" onClick={() => handleRemove(pi.id)}>Remove</CMSButton>
          </div>
        ))}
      </fieldset>

      {/* Available instructors */}
      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Available instructors</legend>
        <CMSInput
          placeholder="Search instructors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '0.5rem' }}
        />
        {available.filter((i) => !assignedIds.has(i.id)).map((inst) => (
          <div key={inst.id} style={instructorStyles.row}>
            <span style={instructorStyles.name}>{inst.name_en}</span>
            <span style={instructorStyles.title}>{inst.title_en}</span>
            <CMSButton variant="secondary" onClick={() => handleAssign(inst.id)}>Assign</CMSButton>
          </div>
        ))}
        {available.filter((i) => !assignedIds.has(i.id)).length === 0 && (
          <p style={{ color: 'var(--cms-text-muted)' }}>No available instructors. Create a new one.</p>
        )}
      </fieldset>

      {showCreate && (
        <InstructorCreateDialog
          onSave={handleCreateInstructor}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function InstructorCreateDialog({ onSave, onClose }) {
  const [data, setData] = useState({
    name_en: '', name_ar: '', title_en: '', title_ar: '',
    bio_en: '', bio_ar: '', linkedin_url: '', image: null,
  });

  return (
    <div style={dialogStyles.overlay} onClick={onClose}>
      <div style={dialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={dialogStyles.title}>New Instructor</h3>
        <div className="cms-bilingual-row">
          <CMSInput label="Name (EN)" value={data.name_en} onChange={(e) => setData({ ...data, name_en: e.target.value })} />
          <CMSInput label="Name (AR)" value={data.name_ar} onChange={(e) => setData({ ...data, name_ar: e.target.value })} dir="rtl" />
        </div>
        <div className="cms-bilingual-row">
          <CMSInput label="Title (EN)" value={data.title_en} onChange={(e) => setData({ ...data, title_en: e.target.value })} placeholder="Senior Developer" />
          <CMSInput label="Title (AR)" value={data.title_ar} onChange={(e) => setData({ ...data, title_ar: e.target.value })} dir="rtl" />
        </div>
        <div className="cms-bilingual-row">
          <CMSTextarea label="Bio (EN)" value={data.bio_en} onChange={(e) => setData({ ...data, bio_en: e.target.value })} rows={4} />
          <CMSTextarea label="Bio (AR)" value={data.bio_ar} onChange={(e) => setData({ ...data, bio_ar: e.target.value })} rows={4} dir="rtl" />
        </div>
        <CMSInput label="LinkedIn URL" value={data.linkedin_url} onChange={(e) => setData({ ...data, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
        <CMSMediaField label="Profile photo" value={data.image} onChange={(_id, asset) => setData({ ...data, image: asset })} usageLabel="instructor-photo" />
        <div style={dialogStyles.actions}>
          <CMSButton variant="secondary" onClick={onClose}>Cancel</CMSButton>
          <CMSButton variant="primary" onClick={() => {
            const payload = { ...data };
            if (payload.image && typeof payload.image === 'object') payload.image = payload.image.id;
            onSave(payload);
          }}>Create</CMSButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Testimonials
// ---------------------------------------------------------------------------

function TestimonialsTab({ programId }) {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTestimonials(programId);
      setItems(data.results || data);
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [programId, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (data) => {
    try {
      const payload = { ...data };
      if (payload.image && typeof payload.image === 'object') payload.image = payload.image.id;
      if (payload.id) {
        await updateTestimonial(payload.id, payload);
      } else {
        await createTestimonial(programId, payload);
      }
      showSuccess('Testimonial saved');
      setEditing(null);
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      showSuccess('Testimonial deleted');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveTestimonial(id);
      showSuccess('Testimonial approved');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (loading) return <CMSLoadingState />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--cms-accent)' }}>Testimonials</h3>
        <CMSButton variant="primary" onClick={() => setEditing({})}>+ Add Testimonial</CMSButton>
      </div>

      {items.length === 0 && <p style={{ color: 'var(--cms-text-muted)' }}>No testimonials yet.</p>}

      {items.map((t) => (
        <div key={t.id} style={testimonialStyles.container}>
          <div style={testimonialStyles.header}>
            <span style={testimonialStyles.name}>{t.student_name_en}</span>
            <span style={testimonialStyles.rating}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
            {t.is_approved ? (
              <span style={testimonialStyles.approved}>Approved</span>
            ) : (
              <span style={testimonialStyles.pending}>Pending</span>
            )}
            <div style={{ flex: 1 }} />
            {!t.is_approved && <CMSButton variant="primary" onClick={() => handleApprove(t.id)}>Approve</CMSButton>}
            <CMSButton variant="secondary" onClick={() => setEditing(t)}>Edit</CMSButton>
            <CMSButton variant="danger" onClick={() => handleDelete(t.id)}>Delete</CMSButton>
          </div>
          <p style={testimonialStyles.content}>{t.content_en}</p>
        </div>
      ))}

      {editing && (
        <TestimonialEditDialog
          testimonial={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function TestimonialEditDialog({ testimonial, onSave, onClose }) {
  const [data, setData] = useState({
    id: testimonial.id,
    student_name_en: testimonial.student_name_en || '',
    student_name_ar: testimonial.student_name_ar || '',
    content_en: testimonial.content_en || '',
    content_ar: testimonial.content_ar || '',
    rating: testimonial.rating || 5,
    image: testimonial.image || null,
    is_approved: testimonial.is_approved || false,
  });

  return (
    <div style={dialogStyles.overlay} onClick={onClose}>
      <div style={dialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={dialogStyles.title}>{testimonial.id ? 'Edit Testimonial' : 'New Testimonial'}</h3>
        <div className="cms-bilingual-row">
          <CMSInput label="Student name (EN)" value={data.student_name_en} onChange={(e) => setData({ ...data, student_name_en: e.target.value })} />
          <CMSInput label="Student name (AR)" value={data.student_name_ar} onChange={(e) => setData({ ...data, student_name_ar: e.target.value })} dir="rtl" />
        </div>
        <div className="cms-bilingual-row">
          <CMSTextarea label="Content (EN)" value={data.content_en} onChange={(e) => setData({ ...data, content_en: e.target.value })} rows={4} />
          <CMSTextarea label="Content (AR)" value={data.content_ar} onChange={(e) => setData({ ...data, content_ar: e.target.value })} rows={4} dir="rtl" />
        </div>
        <CMSInput label="Rating (1-5)" type="number" min="1" max="5" value={data.rating} onChange={(e) => setData({ ...data, rating: parseInt(e.target.value) || 5 })} />
        <CMSMediaField label="Student photo" value={data.image} onChange={(_id, asset) => setData({ ...data, image: asset })} usageLabel="testimonial-photo" />
        <CMSCheckbox label="Approved (visible on public site)" checked={data.is_approved} onChange={(e) => setData({ ...data, is_approved: e.target.checked })} />
        <div style={dialogStyles.actions}>
          <CMSButton variant="secondary" onClick={onClose}>Cancel</CMSButton>
          <CMSButton variant="primary" onClick={() => onSave(data)}>Save</CMSButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: FAQ
// ---------------------------------------------------------------------------

function FAQTab({ programId }) {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFAQs(programId);
      setItems(data.results || data);
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [programId, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await updateFAQ(data.id, data);
      } else {
        await createFAQ(programId, data);
      }
      showSuccess('FAQ saved');
      setEditing(null);
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await deleteFAQ(id);
      showSuccess('FAQ deleted');
      load();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (loading) return <CMSLoadingState />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--cms-accent)' }}>FAQ</h3>
        <CMSButton variant="primary" onClick={() => setEditing({})}>+ Add FAQ</CMSButton>
      </div>

      {items.length === 0 && <p style={{ color: 'var(--cms-text-muted)' }}>No FAQs yet.</p>}

      {items.map((f) => (
        <div key={f.id} style={faqStyles.container}>
          <div style={faqStyles.header}>
            <span style={faqStyles.question}>{f.question_en}</span>
            <CMSButton variant="secondary" onClick={() => setEditing(f)}>Edit</CMSButton>
            <CMSButton variant="danger" onClick={() => handleDelete(f.id)}>Delete</CMSButton>
          </div>
          <p style={faqStyles.answer}>{f.answer_en}</p>
        </div>
      ))}

      {editing && (
        <FAQEditDialog
          faq={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function FAQEditDialog({ faq, onSave, onClose }) {
  const [data, setData] = useState({
    id: faq.id,
    question_en: faq.question_en || '',
    question_ar: faq.question_ar || '',
    answer_en: faq.answer_en || '',
    answer_ar: faq.answer_ar || '',
    display_order: faq.display_order || 0,
  });

  return (
    <div style={dialogStyles.overlay} onClick={onClose}>
      <div style={dialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={dialogStyles.title}>{faq.id ? 'Edit FAQ' : 'New FAQ'}</h3>
        <div className="cms-bilingual-row">
          <CMSInput label="Question (EN)" value={data.question_en} onChange={(e) => setData({ ...data, question_en: e.target.value })} />
          <CMSInput label="Question (AR)" value={data.question_ar} onChange={(e) => setData({ ...data, question_ar: e.target.value })} dir="rtl" />
        </div>
        <div className="cms-bilingual-row">
          <CMSTextarea label="Answer (EN)" value={data.answer_en} onChange={(e) => setData({ ...data, answer_en: e.target.value })} rows={4} />
          <CMSTextarea label="Answer (AR)" value={data.answer_ar} onChange={(e) => setData({ ...data, answer_ar: e.target.value })} rows={4} dir="rtl" />
        </div>
        <CMSInput label="Display order" type="number" value={data.display_order} onChange={(e) => setData({ ...data, display_order: parseInt(e.target.value) || 0 })} />
        <div style={dialogStyles.actions}>
          <CMSButton variant="secondary" onClick={onClose}>Cancel</CMSButton>
          <CMSButton variant="primary" onClick={() => onSave(data)}>Save</CMSButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: SEO
// ---------------------------------------------------------------------------

function SEOTab({ data, onChange, onSave, saving, dirty }) {
  return (
    <div style={sectionStyles.form}>
      <div className="cms-bilingual-row">
        <CMSInput
          label="SEO Title (EN)"
          value={data.seo_title_en}
          onChange={(e) => onChange('seo_title_en', e.target.value)}
          hint="Overrides the page title for search engines"
        />
        <CMSInput
          label="SEO Title (AR)"
          value={data.seo_title_ar}
          onChange={(e) => onChange('seo_title_ar', e.target.value)}
          dir="rtl"
        />
      </div>

      <div className="cms-bilingual-row">
        <CMSTextarea
          label="Meta Description (EN)"
          value={data.seo_meta_description_en}
          onChange={(e) => onChange('seo_meta_description_en', e.target.value)}
          rows={3}
          hint="160 characters max for search results"
        />
        <CMSTextarea
          label="Meta Description (AR)"
          value={data.seo_meta_description_ar}
          onChange={(e) => onChange('seo_meta_description_ar', e.target.value)}
          rows={3}
          dir="rtl"
        />
      </div>

      <CMSMediaField
        label="Open Graph image"
        value={data.og_image}
        onChange={(_id, asset) => onChange('og_image', asset)}
        usageLabel="landing-og-image"
      />

      <CMSInput
        label="Canonical slug (optional)"
        value={data.canonical_slug}
        onChange={(e) => onChange('canonical_slug', e.target.value)}
        hint="If this page should canonical to a different URL, enter the slug here"
      />

      <CMSCheckbox
        label="No-index (hide from search engines)"
        checked={data.seo_noindex}
        onChange={(e) => onChange('seo_noindex', e.target.checked)}
      />

      <SaveButton onSave={onSave} saving={saving} dirty={dirty} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Preview
// ---------------------------------------------------------------------------

function PreviewTab({ program }) {
  const { showSuccess, showError } = useToast();
  const [previewToken, setPreviewToken] = useState(null);
  const [generating, setGenerating] = useState(false);
  const publicUrl = `/training/${program?.slug}`;

  const handleGenerateToken = async () => {
    setGenerating(true);
    try {
      const response = await cmsFetch(`/api/v1/cms/training/${program.id}/preview-token/`, {
        method: 'POST',
      });
      setPreviewToken(response);
      showSuccess(`Preview token generated (valid for ${response.expires_in_seconds / 60} minutes)`);
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setGenerating(false);
    }
  };

  const previewFrontendUrl = previewToken
    ? `/training/${program?.slug}?preview=${previewToken.token}`
    : null;

  return (
    <div style={sectionStyles.form}>
      <h3 style={{ color: 'var(--cms-accent)' }}>Preview & Publish</h3>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Public URL</legend>
        <p style={sectionStyles.hint}>
          {program?.status === 'active'
            ? 'This program is published and visible to the public.'
            : 'This program is not published. The public URL will return 404.'}
        </p>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--cms-accent)', textDecoration: 'underline' }}
        >
          {publicUrl}
        </a>
      </fieldset>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Preview URL (short-lived token)</legend>
        <p style={sectionStyles.hint}>
          Generate a short-lived preview token (valid for 10 minutes) to share with stakeholders
          for reviewing draft programs. The token is cryptographically signed and not stored in the database.
        </p>
        <CMSButton variant="primary" onClick={handleGenerateToken} loading={generating}>
          Generate Preview Token
        </CMSButton>
        {previewFrontendUrl && (
          <div style={{ marginTop: '1rem' }}>
            <a
              href={previewFrontendUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--cms-accent)', textDecoration: 'underline', wordBreak: 'break-all' }}
            >
              {previewFrontendUrl}
            </a>
            <p style={{ ...sectionStyles.hint, marginTop: '0.5rem' }}>
              Expires in {previewToken?.expires_in_seconds / 60} minutes.
              After expiry, generate a new token.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset style={sectionStyles.fieldset}>
        <legend style={sectionStyles.legend}>Current Status</legend>
        <p style={{ color: 'var(--cms-text-primary)' }}>
          Status: <strong>{program?.status}</strong>
        </p>
        <p style={{ color: 'var(--cms-text-primary)' }}>
          Registration open: <strong>{program?.registration_open ? 'Yes' : 'No'}</strong>
        </p>
        <p style={{ color: 'var(--cms-text-primary)' }}>
          Registration URL: {program?.registration_url || '(not set)'}
        </p>
      </fieldset>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function SaveButton({ onSave, saving, dirty }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <CMSButton variant="primary" onClick={onSave} loading={saving} disabled={!dirty}>
        Save Changes
      </CMSButton>
      {!dirty && <span style={{ marginInlineStart: '0.75rem', color: 'var(--cms-text-muted)', fontSize: '0.8125rem' }}>No unsaved changes</span>}
    </div>
  );
}

function QuickFactsEditor({ facts, onChange }) {
  const entries = Object.entries(facts || {});

  const addEntry = () => {
    onChange({ ...facts, '': { en: '', ar: '' } });
  };

  const updateEntry = (oldKey, newKey, field, value) => {
    const newFacts = { ...facts };
    if (oldKey !== newKey) {
      delete newFacts[oldKey];
    }
    newFacts[newKey] = { ...(newFacts[newKey] || {}), [field]: value };
    onChange(newFacts);
  };

  const removeEntry = (key) => {
    const newFacts = { ...facts };
    delete newFacts[key];
    onChange(newFacts);
  };

  return (
    <div>
      {entries.map(([key, val]) => (
        <div key={key} style={quickFactsStyles.row}>
          <CMSInput
            placeholder="Key (e.g., duration)"
            value={key}
            onChange={(e) => updateEntry(key, e.target.value, 'en', val.en)}
            style={{ flex: '0 0 150px' }}
          />
          <CMSInput
            placeholder="Value (EN)"
            value={val.en || ''}
            onChange={(e) => updateEntry(key, key, 'en', e.target.value)}
          />
          <CMSInput
            placeholder="Value (AR)"
            value={val.ar || ''}
            onChange={(e) => updateEntry(key, key, 'ar', e.target.value)}
            dir="rtl"
          />
          <button style={quickFactsStyles.removeBtn} onClick={() => removeEntry(key)}>×</button>
        </div>
      ))}
      <CMSButton variant="secondary" onClick={addEntry}>+ Add Fact</CMSButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const tabStyles = {
  container: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '1px solid #1e1e2e',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.625rem 1rem',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--cms-text-muted)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  activeTab: {
    color: 'var(--cms-accent)',
    borderBottom: '2px solid #c9a96e',
  },
};

const sectionStyles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  fieldset: {
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '1rem',
    background: 'var(--cms-bg-surface)',
  },
  legend: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--cms-accent)',
    padding: '0 0.5rem',
  },
  hint: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    margin: '0 0 0.5rem 0',
  },
};

const dialogStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialog: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '1.5rem',
    maxWidth: '640px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    margin: 0,
    color: 'var(--cms-accent)',
    fontSize: '1.125rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
};

const moduleStyles = {
  container: {
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    background: 'var(--cms-bg-surface)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--cms-text-muted)',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  order: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.75rem',
  },
  title: {
    color: 'var(--cms-text-primary)',
    fontWeight: 500,
  },
  published: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    background: '#4caf5022',
    color: 'var(--cms-success)',
  },
  draft: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    background: '#ff980022',
    color: 'var(--cms-warning, #f59e0b)',
  },
  topics: {
    padding: '0.5rem 1rem 1rem 2.5rem',
    borderTop: '1px solid #1e1e2e',
  },
  topicRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0',
  },
  smallBtn: {
    background: 'var(--cms-border-subtle)',
    border: '1px solid #3a3a4e',
    color: 'var(--cms-text-secondary)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  smallDangerBtn: {
    background: '#3a1520',
    border: '1px solid #5a2030',
    color: 'var(--cms-danger)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
};

const instructorStyles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #1e1e2e',
  },
  name: {
    color: 'var(--cms-text-primary)',
    fontWeight: 500,
    flex: '0 0 200px',
  },
  title: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.8125rem',
    flex: 1,
  },
};

const testimonialStyles = {
  container: {
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '0.5rem',
    background: 'var(--cms-bg-surface)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  name: {
    color: 'var(--cms-text-primary)',
    fontWeight: 500,
  },
  rating: {
    color: '#ffc107',
    fontSize: '0.875rem',
  },
  approved: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    background: '#4caf5022',
    color: 'var(--cms-success)',
  },
  pending: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    background: '#ff980022',
    color: 'var(--cms-warning, #f59e0b)',
  },
  content: {
    color: 'var(--cms-text-secondary)',
    fontSize: '0.875rem',
    margin: 0,
  },
};

const faqStyles = {
  container: {
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '0.5rem',
    background: 'var(--cms-bg-surface)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  question: {
    color: 'var(--cms-text-primary)',
    fontWeight: 500,
    flex: 1,
  },
  answer: {
    color: 'var(--cms-text-secondary)',
    fontSize: '0.875rem',
    margin: 0,
  },
};

const quickFactsStyles = {
  row: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    alignItems: 'center',
  },
  removeBtn: {
    background: '#3a1520',
    border: '1px solid #5a2030',
    color: 'var(--cms-danger)',
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    flexShrink: 0,
  },
};
