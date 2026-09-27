/**
 * CMS Starter Landing Page Builder — /cms/training/starter-landing
 *
 * Structured editor for the public /training/starter/register page.
 * All edits affect the DRAFT only; the public site reads the PUBLISHED
 * payload until Publish is pressed.
 *
 * Endpoints:
 *   GET  /api/v1/cms/training/starter-landing/          (draft + meta)
 *   PUT  /api/v1/cms/training/starter-landing/          (save draft)
 *   POST /api/v1/cms/training/starter-landing/publish/  (atomic publish)
 *   POST /api/v1/cms/training/starter-landing/preview-token/
 *
 * The registration_form section is protected: it can be enabled/disabled
 * and reordered, never deleted or duplicated. Its copy lives on
 * StarterCampaignConfig — the edit panel writes through that endpoint.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import {
  getStarterLanding,
  updateStarterLanding,
  publishStarterLanding,
  generateStarterLandingPreviewToken,
  getStarterFormConfig,
  updateStarterFormConfig,
} from '../../services/cms/trainingApi';
import { parseApiError } from '../../services/cms/cmsFetch';

const SECTION_META = {
  hero: { label: 'Hero', canDelete: true, canDuplicate: true },
  rich_text: { label: 'Rich Text', canDelete: true, canDuplicate: true },
  faq: { label: 'FAQ', canDelete: true, canDuplicate: true },
  cta_banner: { label: 'CTA Banner', canDelete: true, canDuplicate: true },
  registration_form: { label: 'Registration Form', canDelete: false, canDuplicate: false, protected: true },
};

const ADDABLE_TYPES = ['hero', 'rich_text', 'faq', 'cta_banner'];

const EMPTY_PROPS = {
  hero: {
    badge_en: '', badge_ar: '', title_en: '', title_ar: '',
    tagline_en: '', tagline_ar: '', brand_en: '', brand_ar: '',
    cta_en: '', cta_ar: '', price_display: 'shared',
  },
  rich_text: { heading_en: '', heading_ar: '', body_en: '', body_ar: '' },
  faq: { heading_en: '', heading_ar: '', items: [] },
  cta_banner: {
    heading_en: '', heading_ar: '', description_en: '', description_ar: '',
    button_en: '', button_ar: '', target: '#register',
  },
};

let localIdCounter = 0;
function newSection(type) {
  localIdCounter += 1;
  return {
    id: `${type}-${Date.now().toString(36)}-${localIdCounter}`,
    type,
    enabled: true,
    props: { ...EMPTY_PROPS[type] },
  };
}

export default function CMSStarterLandingPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const canView = hasCapability('training.view') || hasCapability('training.update');
  const canEdit = hasCapability('training.update');
  const canPublish = hasCapability('training.publish');

  const [page, setPage] = useState(null);
  const [sections, setSections] = useState(null);
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setConflict(false);
    try {
      const [pageData, cfg] = await Promise.all([getStarterLanding(), getStarterFormConfig()]);
      setPage(pageData);
      setSections(pageData.sections || []);
      setFormConfig(cfg);
      setDirty(false);
      setExpandedId(null);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  const mutate = (fn) => {
    setSections((prev) => fn([...prev]));
    setDirty(true);
  };

  const move = (index, delta) => {
    mutate((list) => {
      const j = index + delta;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });
  };

  const toggleEnabled = (index) => {
    mutate((list) => {
      list[index] = { ...list[index], enabled: !list[index].enabled };
      return list;
    });
  };

  const updateProps = (index, props) => {
    mutate((list) => {
      list[index] = { ...list[index], props };
      return list;
    });
  };

  const duplicateSection = (index) => {
    const src = sections[index];
    if (!SECTION_META[src.type]?.canDuplicate) return;
    mutate((list) => {
      const copy = {
        ...JSON.parse(JSON.stringify(src)),
        id: `${src.id}-copy-${Date.now().toString(36)}`,
      };
      list.splice(index + 1, 0, copy);
      return list;
    });
  };

  const deleteSection = (index) => {
    const src = sections[index];
    if (!SECTION_META[src.type]?.canDelete) return;
    mutate((list) => list.filter((_, i) => i !== index));
    if (expandedId === src.id) setExpandedId(null);
  };

  const addSection = (type) => {
    mutate((list) => [...list, newSection(type)]);
    setAddOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateStarterLanding({
        sections,
        expected_updated_at: page.updated_at,
      });
      setPage(updated);
      setSections(updated.sections);
      setDirty(false);
      setConflict(false);
      showSuccess(t('msg.saved'));
    } catch (err) {
      if (err.status === 409) {
        setConflict(true);
        showError(t('landing.conflict'));
      } else {
        showError(parseApiError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const updated = await publishStarterLanding();
      setPage(updated);
      setSections(updated.sections);
      setDirty(false);
      showSuccess(t('landing.published'));
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setPublishing(false);
    }
  };

  const handlePreview = async () => {
    try {
      await generateStarterLandingPreviewToken();
      navigate('/cms/training/starter-landing/preview');
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleConfigSave = async (configData) => {
    try {
      const updated = await updateStarterFormConfig(configData);
      setFormConfig(updated);
      showSuccess(t('msg.saved'));
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (!canView) {
    return (
      <CMSLayout>
        <CMSErrorState message={t('siteSettings.permissionDenied')} />
      </CMSLayout>
    );
  }

  const headerActions = (
    <>
      {page?.has_unpublished_changes && (
        <span style={styles.unsavedBadge}>{t('landing.unpublishedChanges')}</span>
      )}
      <CMSButton variant="secondary" onClick={handlePreview}>
        {t('landing.preview')}
      </CMSButton>
      <CMSButton variant="secondary" onClick={handleSave} loading={saving} disabled={!dirty || !canEdit}>
        {t('action.save')}
      </CMSButton>
      {canPublish && (
        <CMSButton variant="primary" onClick={handlePublish} loading={publishing} disabled={dirty || !canEdit}>
          {t('landing.publish')}
        </CMSButton>
      )}
    </>
  );

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={t('nav.starterLanding')}
        subtitle={page?.published_at
          ? `${t('landing.lastPublished')}: ${new Date(page.published_at).toLocaleString()}`
          : t('landing.neverPublished')}
        actions={headerActions}
      />

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}

      {conflict && (
        <div style={styles.conflictBanner} role="alert">
          {t('landing.conflict')}{' '}
          <button style={styles.linkBtn} onClick={load}>{t('action.reload')}</button>
        </div>
      )}

      {!loading && !error && sections && (
        <div style={styles.list}>
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              expanded={expandedId === section.id}
              onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onToggleEnabled={() => toggleEnabled(index)}
              onDuplicate={() => duplicateSection(index)}
              onDelete={() => deleteSection(index)}
              onPropsChange={(props) => updateProps(index, props)}
              canEdit={canEdit}
              t={t}
              formConfig={formConfig}
              onConfigSave={handleConfigSave}
            />
          ))}

          {canEdit && (
            <div style={styles.addWrap}>
              {addOpen ? (
                <div style={styles.addPanel}>
                  {ADDABLE_TYPES.map((type) => (
                    <button key={type} style={styles.addOption} onClick={() => addSection(type)}>
                      {SECTION_META[type].label}
                    </button>
                  ))}
                  <button style={styles.addOption} onClick={() => setAddOpen(false)}>
                    {t('action.cancel')}
                  </button>
                </div>
              ) : (
                <CMSButton variant="secondary" onClick={() => setAddOpen(true)}>
                  {t('landing.addSection')}
                </CMSButton>
              )}
            </div>
          )}
        </div>
      )}
    </CMSLayout>
  );
}

function sectionSummary(section) {
  const p = section.props || {};
  switch (section.type) {
    case 'hero': return p.title_en || '—';
    case 'rich_text': return p.heading_en || (p.body_en || '').slice(0, 60) || '—';
    case 'faq': return `${(p.items || []).length} item(s)`;
    case 'cta_banner': return p.heading_en || p.button_en || '—';
    case 'registration_form': return 'System registration block';
    default: return '—';
  }
}

function SectionCard({
  section, index, total, expanded, onToggleExpand,
  onMoveUp, onMoveDown, onToggleEnabled, onDuplicate, onDelete,
  onPropsChange, canEdit, t, formConfig, onConfigSave,
}) {
  const meta = SECTION_META[section.type] || { label: section.type };
  return (
    <div style={styles.card}>
      <div style={styles.cardHead}>
        <div style={styles.cardTitleWrap}>
          <span style={styles.typeBadge}>{meta.label}</span>
          {!section.enabled && <span style={styles.disabledBadge}>{t('landing.disabled')}</span>}
          {meta.protected && <span style={styles.protectedBadge}>{t('landing.protected')}</span>}
          <span style={styles.summary}>{sectionSummary(section)}</span>
        </div>
        <div style={styles.cardActions}>
          <button style={styles.iconBtn} onClick={onMoveUp} disabled={!canEdit || index === 0} title="Move up">↑</button>
          <button style={styles.iconBtn} onClick={onMoveDown} disabled={!canEdit || index === total - 1} title="Move down">↓</button>
          <button style={styles.iconBtn} onClick={onToggleEnabled} disabled={!canEdit} title="Enable / Disable">
            {section.enabled ? '◉' : '○'}
          </button>
          {meta.canDuplicate && (
            <button style={styles.iconBtn} onClick={onDuplicate} disabled={!canEdit} title="Duplicate">⧉</button>
          )}
          {meta.canDelete && (
            <button style={{ ...styles.iconBtn, color: 'var(--cms-danger, #ef4444)' }} onClick={onDelete} disabled={!canEdit} title="Delete">✕</button>
          )}
          <CMSButton variant="ghost" onClick={onToggleExpand}>
            {expanded ? t('action.close') : t('action.edit')}
          </CMSButton>
        </div>
      </div>

      {expanded && (
        <div style={styles.editor}>
          <SectionEditor
            section={section}
            onPropsChange={onPropsChange}
            canEdit={canEdit}
            t={t}
            formConfig={formConfig}
            onConfigSave={onConfigSave}
          />
        </div>
      )}
    </div>
  );
}

function BilingualField({ label, props, base, onChange, textarea, disabled }) {
  const Comp = textarea ? CMSTextarea : CMSInput;
  return (
    <div style={styles.bilingualRow}>
      <Comp
        label={`${label} (EN)`}
        value={props[`${base}_en`] || ''}
        onChange={(e) => onChange({ ...props, [`${base}_en`]: e.target.value })}
        disabled={disabled}
        rows={textarea ? 3 : undefined}
      />
      <Comp
        label={`${label} (AR)`}
        value={props[`${base}_ar`] || ''}
        onChange={(e) => onChange({ ...props, [`${base}_ar`]: e.target.value })}
        disabled={disabled}
        dir="rtl"
        rows={textarea ? 3 : undefined}
      />
    </div>
  );
}

function SectionEditor({ section, onPropsChange, canEdit, t, formConfig, onConfigSave }) {
  const props = section.props || {};
  const set = (next) => onPropsChange(next);

  if (section.type === 'hero') {
    return (
      <>
        <BilingualField label="Badge" props={props} base="badge" onChange={set} disabled={!canEdit} />
        <BilingualField label="Title" props={props} base="title" onChange={set} disabled={!canEdit} />
        <BilingualField label="Tagline" props={props} base="tagline" onChange={set} textarea disabled={!canEdit} />
        <BilingualField label="Brand line" props={props} base="brand" onChange={set} disabled={!canEdit} />
        <BilingualField label="CTA label" props={props} base="cta" onChange={set} disabled={!canEdit} />
        <CMSSelect
          label="Price display"
          value={props.price_display || 'shared'}
          onChange={(e) => set({ ...props, price_display: e.target.value })}
          disabled={!canEdit}
          hint="Prices always come from each course's ProgramLanding.current_price — this only controls how the hero shows them."
        >
          <option value="shared">Shared price (when all courses match)</option>
          <option value="per_course">Per-course prices only (no hero price)</option>
          <option value="none">Hide price</option>
        </CMSSelect>
      </>
    );
  }

  if (section.type === 'rich_text') {
    return (
      <>
        <BilingualField label="Heading" props={props} base="heading" onChange={set} disabled={!canEdit} />
        <BilingualField label="Body" props={props} base="body" onChange={set} textarea disabled={!canEdit} />
      </>
    );
  }

  if (section.type === 'cta_banner') {
    return (
      <>
        <BilingualField label="Heading" props={props} base="heading" onChange={set} disabled={!canEdit} />
        <BilingualField label="Description" props={props} base="description" onChange={set} textarea disabled={!canEdit} />
        <BilingualField label="Button label" props={props} base="button" onChange={set} disabled={!canEdit} />
        <CMSInput
          label="Target"
          value={props.target || ''}
          onChange={(e) => set({ ...props, target: e.target.value })}
          disabled={!canEdit}
          hint="In-page anchor like #register, or an internal path like /training/starter"
        />
      </>
    );
  }

  if (section.type === 'faq') {
    const items = props.items || [];
    const setItem = (i, item) => {
      const next = [...items];
      next[i] = item;
      set({ ...props, items: next });
    };
    return (
      <>
        <BilingualField label="Heading" props={props} base="heading" onChange={set} disabled={!canEdit} />
        {items.map((item, i) => (
          <div key={i} style={styles.faqItem}>
            <div style={styles.faqItemHead}>
              <span>Item {i + 1}</span>
              <div>
                <button style={styles.iconBtn} disabled={!canEdit || i === 0} onClick={() => {
                  const next = [...items];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  set({ ...props, items: next });
                }}>↑</button>
                <button style={styles.iconBtn} disabled={!canEdit || i === items.length - 1} onClick={() => {
                  const next = [...items];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  set({ ...props, items: next });
                }}>↓</button>
                <button style={{ ...styles.iconBtn, color: 'var(--cms-danger, #ef4444)' }} disabled={!canEdit} onClick={() => {
                  set({ ...props, items: items.filter((_, j) => j !== i) });
                }}>✕</button>
              </div>
            </div>
            <BilingualField label="Question" props={item} base="question" onChange={(n) => setItem(i, n)} disabled={!canEdit} />
            <BilingualField label="Answer" props={item} base="answer" onChange={(n) => setItem(i, n)} textarea disabled={!canEdit} />
          </div>
        ))}
        {canEdit && (
          <CMSButton variant="secondary" onClick={() => set({ ...props, items: [...items, { question_en: '', question_ar: '', answer_en: '', answer_ar: '' }] })}>
            + FAQ item
          </CMSButton>
        )}
      </>
    );
  }

  if (section.type === 'registration_form') {
    return (
      <RegistrationFormCopyEditor
        formConfig={formConfig}
        onSave={onConfigSave}
        canEdit={canEdit}
        t={t}
      />
    );
  }

  return null;
}

function RegistrationFormCopyEditor({ formConfig, onSave, canEdit, t }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setData(formConfig); }, [formConfig]);
  if (!data) return <CMSLoadingState />;
  const set = (field, value) => setData((prev) => ({ ...prev, [field]: value }));
  return (
    <div>
      <p style={styles.sectionHint}>
        This copy is stored in the shared Starter Campaign Config — saving here
        updates /cms/training/starter-form as well (single source of truth).
      </p>
      <CMSCheckbox
        label="Show registration form"
        checked={data.show_registration_form ?? true}
        onChange={(e) => set('show_registration_form', e.target.checked)}
        disabled={!canEdit}
      />
      <BilingualConfigField label="Form title" field="form_title" data={data} set={set} canEdit={canEdit} />
      <BilingualConfigField label="Form description" field="form_description" data={data} set={set} canEdit={canEdit} textarea />
      <BilingualConfigField label="Button text" field="form_button" data={data} set={set} canEdit={canEdit} />
      <BilingualConfigField label="Success message" field="success_message" data={data} set={set} canEdit={canEdit} textarea />
      <BilingualConfigField label="Success note" field="success_note" data={data} set={set} canEdit={canEdit} textarea />
      <BilingualConfigField label="Closed message" field="closed_message" data={data} set={set} canEdit={canEdit} textarea />
      <div style={{ marginTop: '0.75rem' }}>
        <CMSButton
          variant="secondary"
          disabled={!canEdit}
          loading={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(data);
            setSaving(false);
          }}
        >
          Save form copy
        </CMSButton>
      </div>
    </div>
  );
}

function BilingualConfigField({ label, field, data, set, canEdit, textarea }) {
  const Comp = textarea ? CMSTextarea : CMSInput;
  return (
    <div style={styles.bilingualRow}>
      <Comp
        label={`${label} (EN)`}
        value={data[`${field}_en`] || ''}
        onChange={(e) => set(`${field}_en`, e.target.value)}
        disabled={!canEdit}
        rows={textarea ? 2 : undefined}
      />
      <Comp
        label={`${label} (AR)`}
        value={data[`${field}_ar`] || ''}
        onChange={(e) => set(`${field}_ar`, e.target.value)}
        disabled={!canEdit}
        dir="rtl"
        rows={textarea ? 2 : undefined}
      />
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '860px' },
  card: {
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    padding: '1rem 1.25rem',
  },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  cardTitleWrap: { display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 },
  typeBadge: {
    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    color: 'var(--cms-accent)', background: 'var(--cms-accent-soft, rgba(99,102,241,0.12))',
    padding: '0.2rem 0.55rem', borderRadius: '999px', whiteSpace: 'nowrap',
  },
  disabledBadge: {
    fontSize: '0.7rem', fontWeight: 600, color: 'var(--cms-text-muted)',
    border: '1px dashed var(--cms-border-default)', padding: '0.1rem 0.45rem', borderRadius: '999px',
  },
  protectedBadge: {
    fontSize: '0.7rem', fontWeight: 600, color: 'var(--cms-warning, #f59e0b)',
    border: '1px solid var(--cms-warning, #f59e0b)', padding: '0.1rem 0.45rem', borderRadius: '999px',
  },
  summary: {
    fontSize: '0.8rem', color: 'var(--cms-text-secondary)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px',
  },
  cardActions: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  iconBtn: {
    background: 'transparent', border: '1px solid var(--cms-border-default)', borderRadius: '6px',
    color: 'var(--cms-text-secondary)', width: '28px', height: '28px', cursor: 'pointer',
    fontSize: '0.8rem', lineHeight: 1,
  },
  editor: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cms-border-default)', display: 'flex', flexDirection: 'column', gap: '1rem' },
  bilingualRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  addWrap: { display: 'flex', justifyContent: 'center', padding: '0.5rem 0' },
  addPanel: {
    display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center',
    background: 'var(--cms-bg-surface)', border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)', padding: '0.75rem 1rem',
  },
  addOption: {
    background: 'transparent', border: '1px solid var(--cms-border-default)', borderRadius: '8px',
    color: 'var(--cms-text-primary)', padding: '0.45rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem',
  },
  faqItem: {
    border: '1px solid var(--cms-border-default)', borderRadius: '10px',
    padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  faqItemHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.75rem', color: 'var(--cms-text-muted)', fontWeight: 600,
  },
  unsavedBadge: {
    fontSize: '0.75rem', fontWeight: 600, color: 'var(--cms-warning, #f59e0b)',
    padding: '0.25rem 0.6rem', borderRadius: '999px',
    border: '1px solid var(--cms-warning, #f59e0b)', whiteSpace: 'nowrap',
  },
  conflictBanner: {
    background: 'var(--cms-danger-soft, rgba(239,68,68,0.08))',
    border: '1px solid var(--cms-danger, #ef4444)',
    borderRadius: 'var(--cms-radius-lg)', padding: '0.75rem 1rem',
    color: 'var(--cms-text-primary)', fontSize: '0.85rem', marginBottom: '1rem', maxWidth: '860px',
  },
  linkBtn: { background: 'none', border: 'none', color: 'var(--cms-accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' },
  sectionHint: { fontSize: '0.75rem', color: 'var(--cms-text-muted)', marginTop: 0 },
};
