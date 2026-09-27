/**
 * CMS Form Builder/Editor Page — /cms/forms/new and /cms/forms/:id
 *
 * Allows creating/editing form definitions, managing fields, managing options,
 * and assigning forms to targets.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSSelect, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import {
  getForm, createForm, updateForm,
  createField, updateField, deleteField,
  createOption, updateOption, deleteOption,
  listAssignmentTargets, createAssignment, deleteAssignment,
} from '../../services/cms/formsApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
];

const FIELD_TYPES_WITH_OPTIONS = ['select', 'radio', 'checkbox'];

const EMPTY_FORM = {
  name: '',
  slug: '',
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  submit_button_en: 'Submit',
  submit_button_ar: '',
  success_message_en: 'Thank you for your submission.',
  success_message_ar: '',
  is_active: false,
};

export default function CMSFormFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const canCreate = hasCapability('forms.create');
  const canUpdate = hasCapability('forms.update');

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Field editor state
  const [editingField, setEditingField] = useState(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);

  // Assignment state
  const [assignmentTargets, setAssignmentTargets] = useState([]);
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    if (!isEdit) return;
    setLoading(true);
    try {
      const data = await getForm(id);
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        title_en: data.title_en || '',
        title_ar: data.title_ar || '',
        description_en: data.description_en || '',
        description_ar: data.description_ar || '',
        submit_button_en: data.submit_button_en || 'Submit',
        submit_button_ar: data.submit_button_ar || '',
        success_message_en: data.success_message_en || 'Thank you for your submission.',
        success_message_ar: data.success_message_ar || '',
        is_active: data.is_active || false,
      });
      setFields(data.fields || []);
      // Store assignments for the Display Location section
      setFormData(prev => ({ ...prev, _assignments: data.assignments || [] }));
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => { load(); }, [load]);

  // Load available assignment targets
  useEffect(() => {
    if (!isEdit) return;
    listAssignmentTargets()
      .then(data => setAssignmentTargets(data.targets || []))
      .catch(() => setAssignmentTargets([]));
  }, [isEdit]);

  const handleAssignTarget = useCallback(async (target) => {
    setAssigning(true);
    try {
      const created = await createAssignment({ form: id, target, is_active: true });
      // Update local form data assignments
      setFormData(prev => ({
        ...prev,
        _assignments: [...(prev._assignments || []), created],
      }));
      showSuccess('Form assigned to target');
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setAssigning(false);
    }
  }, [id, showSuccess, showError]);

  const handleUnassignTarget = useCallback(async (assignmentId, target) => {
    try {
      await deleteAssignment(assignmentId);
      setFormData(prev => ({
        ...prev,
        _assignments: (prev._assignments || []).filter(a => a.id !== assignmentId),
      }));
      showSuccess('Assignment removed');
    } catch (err) {
      showError(parseApiError(err));
    }
  }, [showSuccess, showError]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      if (isEdit) {
        await updateForm(id, formData);
        showSuccess('Form updated successfully');
      } else {
        const created = await createForm(formData);
        showSuccess('Form created successfully');
        navigate(`/cms/forms/${created.id}`);
      }
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (fe) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  }, [isEdit, id, formData, navigate, showSuccess, showError]);

  const handleAddField = () => {
    setEditingField(null);
    setFieldModalOpen(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFieldModalOpen(true);
  };

  const handleSaveField = useCallback(async (fieldData) => {
    try {
      if (editingField) {
        const updated = await updateField(id, editingField.id, fieldData);
        setFields(prev => prev.map(f => f.id === updated.id ? updated : f));
        showSuccess('Field updated');
      } else {
        const created = await createField(id, fieldData);
        setFields(prev => [...prev, created]);
        showSuccess('Field added');
      }
      setFieldModalOpen(false);
      setEditingField(null);
    } catch (err) {
      showError(parseApiError(err));
      throw err;
    }
  }, [editingField, id, showSuccess, showError]);

  const handleDeleteField = useCallback(async (fieldId) => {
    if (!window.confirm('Delete this field? This cannot be undone.')) return;
    try {
      await deleteField(id, fieldId);
      setFields(prev => prev.filter(f => f.id !== fieldId));
      showSuccess('Field deleted');
    } catch (err) {
      showError(parseApiError(err));
    }
  }, [id, showSuccess, showError]);

  const handleToggleFieldActive = useCallback(async (field) => {
    try {
      const updated = await updateField(id, field.id, { is_active: !field.is_active });
      setFields(prev => prev.map(f => f.id === updated.id ? updated : f));
      showSuccess(field.is_active ? 'Field deactivated' : 'Field activated');
    } catch (err) {
      showError(parseApiError(err));
    }
  }, [id, showSuccess, showError]);

  if (loading) return <CMSLayout><CMSLoadingState /></CMSLayout>;
  if (error) return <CMSLayout><CMSErrorState message={error} onRetry={load} /></CMSLayout>;

  return (
    <CMSLayout>
      <CMSPageHeader
        title={isEdit ? `Edit Form: ${formData.name}` : 'New Form'}
        actions={
          <>
            <CMSButton variant="secondary" onClick={() => navigate('/cms/forms')}>{t('action.cancel')}</CMSButton>
            {(isEdit ? canUpdate : canCreate) && (
              <CMSButton variant="primary" onClick={handleSave} loading={saving}>{t('action.save')}</CMSButton>
            )}
          </>
        }
      />

      {/* Form Definition Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Form Details</h3>
        <div style={styles.grid}>
          <CMSInput label="Internal Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} error={fieldErrors.name} required />
          <CMSInput label="Slug" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} error={fieldErrors.slug} required />
          <CMSInput label="English Title" value={formData.title_en} onChange={(e) => handleChange('title_en', e.target.value)} error={fieldErrors.title_en} required />
          <CMSInput label="Arabic Title" value={formData.title_ar} onChange={(e) => handleChange('title_ar', e.target.value)} />
          <CMSTextarea label="English Description" value={formData.description_en} onChange={(e) => handleChange('description_en', e.target.value)} />
          <CMSTextarea label="Arabic Description" value={formData.description_ar} onChange={(e) => handleChange('description_ar', e.target.value)} />
          <CMSInput label="Submit Button (EN)" value={formData.submit_button_en} onChange={(e) => handleChange('submit_button_en', e.target.value)} />
          <CMSInput label="Submit Button (AR)" value={formData.submit_button_ar} onChange={(e) => handleChange('submit_button_ar', e.target.value)} />
          <CMSTextarea label="Success Message (EN)" value={formData.success_message_en} onChange={(e) => handleChange('success_message_en', e.target.value)} />
          <CMSTextarea label="Success Message (AR)" value={formData.success_message_ar} onChange={(e) => handleChange('success_message_ar', e.target.value)} />
          <CMSCheckbox label="Active (form is publicly accessible)" checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
        </div>
      </div>

      {/* Fields Section */}
      {isEdit && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Fields ({fields.length})</h3>
            {canUpdate && <CMSButton variant="primary" onClick={handleAddField}>+ Add Field</CMSButton>}
          </div>

          {fields.length === 0 ? (
            <p style={styles.emptyText}>No fields yet. Add fields to build your form.</p>
          ) : (
            <div style={styles.fieldsList}>
              {fields.map((field, idx) => (
                <div key={field.id} style={styles.fieldCard}>
                  <div style={styles.fieldHeader}>
                    <div style={styles.fieldInfo}>
                      <span style={styles.fieldOrder}>{idx + 1}</span>
                      <span style={styles.fieldLabel}>{field.label_en || field.label_ar}</span>
                      {field.is_system && <span style={styles.systemBadge}>SYSTEM</span>}
                      {field.is_required && <span style={styles.requiredBadge}>REQUIRED</span>}
                      {!field.is_active && <span style={styles.inactiveBadge}>INACTIVE</span>}
                    </div>
                    <div style={styles.fieldActions}>
                      <span style={styles.fieldType}>{field.field_type}</span>
                      {canUpdate && <CMSButton variant="ghost" size="sm" onClick={() => handleEditField(field)}>Edit</CMSButton>}
                      {canUpdate && <CMSButton variant="ghost" size="sm" onClick={() => handleToggleFieldActive(field)}>{field.is_active ? 'Hide' : 'Show'}</CMSButton>}
                      {canUpdate && !field.is_system && <CMSButton variant="ghost" size="sm" onClick={() => handleDeleteField(field.id)}>Delete</CMSButton>}
                    </div>
                  </div>
                  {FIELD_TYPES_WITH_OPTIONS.includes(field.field_type) && field.options && field.options.length > 0 && (
                    <div style={styles.optionsList}>
                      <span style={styles.optionsLabel}>Options:</span>
                      {field.options.map(opt => (
                        <span key={opt.value} style={styles.optionTag}>
                          {opt.label_en || opt.label_ar} ({opt.value})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Display Location Section */}
      {isEdit && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('forms.displayLocation') || 'Display Location'}</h3>
          <p style={styles.sectionHelp}>{t('forms.displayLocationHelp') || 'Choose where this form appears on the public website.'}</p>

          {/* Current assignments */}
          {(formData._assignments || []).length > 0 ? (
            <div style={styles.assignmentList}>
              {formData._assignments.map(a => {
                const targetInfo = assignmentTargets.find(t => t.value === a.target);
                const labelEn = a.target_label_en || targetInfo?.label_en || a.target;
                const labelAr = a.target_label_ar || targetInfo?.label_ar || a.target;
                return (
                  <div key={a.id} style={styles.assignmentCard}>
                    <div style={styles.assignmentInfo}>
                      <span style={styles.assignmentIcon} aria-hidden="true">◆</span>
                      <div>
                        <div style={styles.assignmentLabel}>{labelEn}</div>
                        <div style={styles.assignmentLabelAr} dir="rtl">{labelAr}</div>
                      </div>
                      <span style={a.is_active ? styles.assignedBadge : styles.inactiveBadge}>
                        {a.is_active ? (t('forms.assigned') || 'Assigned') : (t('forms.inactive') || 'Inactive')}
                      </span>
                    </div>
                    {canUpdate && (
                      <CMSButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnassignTarget(a.id, a.target)}
                      >
                        {t('forms.remove') || 'Remove'}
                      </CMSButton>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={styles.emptyText}>{t('forms.noAssignments') || 'Not assigned to any public location.'}</p>
          )}

          {/* Available targets to assign */}
          {canUpdate && assignmentTargets.length > 0 && (
            <div style={styles.assignSection}>
              <div style={styles.assignLabel}>{t('forms.availableLocations') || 'Available locations:'}</div>
              <div style={styles.targetButtons}>
                {assignmentTargets
                  .filter(t => !(formData._assignments || []).some(a => a.target === t.value && a.is_active))
                  .map(target => (
                    <CMSButton
                      key={target.value}
                      variant="secondary"
                      size="sm"
                      loading={assigning}
                      onClick={() => handleAssignTarget(target.value)}
                    >
                      + {target.label_en}
                    </CMSButton>
                  ))}
                {assignmentTargets.every(t => (formData._assignments || []).some(a => a.target === t.value && a.is_active)) && (
                  <span style={styles.allAssigned}>{t('forms.allLocationsAssigned') || 'All available locations are assigned.'}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field Editor Modal */}
      {fieldModalOpen && (
        <FieldEditorModal
          field={editingField}
          onSave={handleSaveField}
          onClose={() => { setFieldModalOpen(false); setEditingField(null); }}
        />
      )}
    </CMSLayout>
  );
}

// ---------------------------------------------------------------------------
// Field Editor Modal
// ---------------------------------------------------------------------------

function FieldEditorModal({ field, onSave, onClose }) {
  const isEdit = !!field;
  const [data, setData] = useState({
    field_key: field?.field_key || '',
    field_type: field?.field_type || 'text',
    label_en: field?.label_en || '',
    label_ar: field?.label_ar || '',
    placeholder_en: field?.placeholder_en || '',
    placeholder_ar: field?.placeholder_ar || '',
    help_text_en: field?.help_text_en || '',
    help_text_ar: field?.help_text_ar || '',
    is_required: field?.is_required || false,
    is_active: field?.is_active ?? true,
    display_order: field?.display_order ?? 0,
  });
  const [options, setOptions] = useState(field?.options || []);
  const [saving, setSaving] = useState(false);

  const handleChange = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const handleAddOption = () => {
    setOptions(prev => [...prev, { value: '', label_en: '', label_ar: '', is_active: true, display_order: prev.length }]);
  };

  const handleUpdateOption = (idx, k, v) => {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, [k]: v } : o));
  };

  const handleDeleteOption = (idx) => {
    setOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const fieldData = { ...data };
      if (FIELD_TYPES_WITH_OPTIONS.includes(data.field_type)) {
        fieldData._options = options.filter(o => o.value && o.label_en);
      }
      await onSave(fieldData);
    } finally {
      setSaving(false);
    }
  };

  const hasOptions = FIELD_TYPES_WITH_OPTIONS.includes(data.field_type);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{isEdit ? 'Edit Field' : 'Add Field'}</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>×</button>
        </div>
        <div style={modalStyles.body}>
          <div style={modalStyles.fieldGrid}>
            <CMSInput label="Field Key (optional)" value={data.field_key} onChange={e => handleChange('field_key', e.target.value)} hint="Stable identifier for system fields" />
            <CMSSelect label="Field Type" value={data.field_type} onChange={e => handleChange('field_type', e.target.value)}>
              {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
            </CMSSelect>
            <CMSInput label="English Label" value={data.label_en} onChange={e => handleChange('label_en', e.target.value)} required />
            <CMSInput label="Arabic Label" value={data.label_ar} onChange={e => handleChange('label_ar', e.target.value)} />
            <CMSInput label="Placeholder (EN)" value={data.placeholder_en} onChange={e => handleChange('placeholder_en', e.target.value)} />
            <CMSInput label="Placeholder (AR)" value={data.placeholder_ar} onChange={e => handleChange('placeholder_ar', e.target.value)} />
            <CMSInput label="Help Text (EN)" value={data.help_text_en} onChange={e => handleChange('help_text_en', e.target.value)} />
            <CMSInput label="Help Text (AR)" value={data.help_text_ar} onChange={e => handleChange('help_text_ar', e.target.value)} />
            <CMSInput label="Display Order" type="number" value={data.display_order} onChange={e => handleChange('display_order', parseInt(e.target.value) || 0)} />
            <CMSCheckbox label="Required" checked={data.is_required} onChange={e => handleChange('is_required', e.target.checked)} />
            <CMSCheckbox label="Active" checked={data.is_active} onChange={e => handleChange('is_active', e.target.checked)} />
          </div>

          {hasOptions && (
            <div style={modalStyles.optionsSection}>
              <div style={modalStyles.optionsHeader}>
                <h4 style={modalStyles.optionsTitle}>Options</h4>
                <CMSButton variant="ghost" size="sm" onClick={handleAddOption}>+ Add Option</CMSButton>
              </div>
              {options.length === 0 && <p style={styles.emptyText}>No options yet. Add at least one option.</p>}
              {options.map((opt, idx) => (
                <div key={idx} style={modalStyles.optionRow}>
                  <CMSInput label="Value" value={opt.value} onChange={e => handleUpdateOption(idx, 'value', e.target.value)} placeholder="stable_value" />
                  <CMSInput label="Label (EN)" value={opt.label_en} onChange={e => handleUpdateOption(idx, 'label_en', e.target.value)} />
                  <CMSInput label="Label (AR)" value={opt.label_ar} onChange={e => handleUpdateOption(idx, 'label_ar', e.target.value)} />
                  <CMSCheckbox label="Active" checked={opt.is_active} onChange={e => handleUpdateOption(idx, 'is_active', e.target.checked)} />
                  <CMSButton variant="ghost" size="sm" onClick={() => handleDeleteOption(idx)}>Delete</CMSButton>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={modalStyles.footer}>
          <CMSButton variant="secondary" onClick={onClose}>Cancel</CMSButton>
          <CMSButton variant="primary" onClick={handleSubmit} loading={saving}>Save Field</CMSButton>
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: {
    background: 'var(--cms-bg-card)',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '1px solid var(--cms-border-subtle)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: 0,
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  fieldsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  fieldCard: {
    border: '1px solid var(--cms-border-subtle)',
    borderRadius: '0.5rem',
    padding: '1rem',
    background: 'var(--cms-bg-page)',
  },
  fieldHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  fieldInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  fieldOrder: {
    background: 'var(--cms-accent)',
    color: 'white',
    borderRadius: '50%',
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  fieldLabel: {
    fontWeight: 600,
  },
  systemBadge: {
    background: '#6b7280',
    color: 'white',
    fontSize: '0.625rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontWeight: 600,
  },
  requiredBadge: {
    background: '#dc2626',
    color: 'white',
    fontSize: '0.625rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontWeight: 600,
  },
  fieldActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fieldType: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  optionsList: {
    marginTop: '0.75rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
  },
  optionsLabel: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    fontWeight: 600,
  },
  optionTag: {
    background: 'var(--cms-bg-card)',
    border: '1px solid var(--cms-border-subtle)',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
  },
  emptyText: {
    color: 'var(--cms-text-muted)',
    fontStyle: 'italic',
  },
  sectionHelp: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-muted)',
    margin: 0,
    marginBottom: '1rem',
  },
  assignmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  assignmentCard: {
    border: '1px solid var(--cms-border-subtle)',
    borderRadius: '0.5rem',
    padding: '1rem',
    background: 'var(--cms-bg-page)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  assignmentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  assignmentIcon: {
    color: 'var(--cms-accent)',
    fontSize: '1rem',
  },
  assignmentLabel: {
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  assignmentLabelAr: {
    fontSize: '0.85rem',
    color: 'var(--cms-text-muted)',
  },
  assignedBadge: {
    background: 'var(--cms-success-bg, #ecfdf5)',
    color: 'var(--cms-success, #065f46)',
    fontSize: '0.625rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontWeight: 600,
  },
  inactiveBadge: {
    background: '#f3f4f6',
    color: '#6b7280',
    fontSize: '0.625rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontWeight: 600,
  },
  assignSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--cms-border-subtle)',
  },
  assignLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--cms-text-muted)',
    marginBottom: '0.5rem',
  },
  targetButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
  },
  allAssigned: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-muted)',
    fontStyle: 'italic',
  },
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1050,
    padding: '1rem',
    overflowY: 'auto',
  },
  modal: {
    background: 'var(--cms-bg-card, #ffffff)',
    borderRadius: '0.75rem',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    border: '1px solid var(--cms-border-subtle)',
    overflow: 'hidden',
    margin: 'auto',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--cms-border-subtle)',
    flexShrink: 0,
    background: 'var(--cms-bg-card, #ffffff)',
    borderRadius: '0.75rem 0.75rem 0 0',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--cms-text-muted)',
    padding: '0.25rem 0.5rem',
    lineHeight: 1,
    borderRadius: '0.25rem',
  },
  body: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: '1 1 auto',
    minHeight: 0,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid var(--cms-border-subtle)',
    flexShrink: 0,
    background: 'var(--cms-bg-card, #ffffff)',
    borderRadius: '0 0 0.75rem 0.75rem',
  },
  optionsSection: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'var(--cms-bg-page, #f9fafb)',
    borderRadius: '0.5rem',
  },
  optionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  optionsTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
  },
  optionRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
    alignItems: 'end',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--cms-border-subtle)',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
};
