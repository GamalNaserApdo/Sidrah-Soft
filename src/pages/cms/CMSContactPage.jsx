/**
 * CMS Contact Page — /cms/contact
 *
 * Tabbed view: Submissions list + Inquiry Types management.
 */

import { useState, useCallback } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSBadge, { StatusBadge } from '../../components/cms/ui/CMSBadge';
import CMSDialog from '../../components/cms/ui/CMSDialog';
import { CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSInput, CMSTextarea, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { useCMSList } from '../../hooks/cms/useCMSList';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { listSubmissions, getSubmission, updateSubmission, deleteSubmission } from '../../services/cms/contactApi';
import { listInquiryTypes, createInquiryType, updateInquiryType, deleteInquiryType } from '../../services/cms/contactApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

export default function CMSContactPage({ defaultTab = 'submissions' }) {
  const [tab, setTab] = useState(defaultTab);
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();

  const canViewSubmissions = hasCapability('contact.view');
  const canUpdateSubmissions = hasCapability('contact.update');
  const canDeleteSubmissions = hasCapability('contact.delete');
  const canCreateInquiryTypes = hasCapability('contact.create');
  const canUpdateInquiryTypes = hasCapability('contact.update');
  const canDeleteInquiryTypes = hasCapability('contact.delete');

  return (
    <CMSLayout>
      <CMSPageHeader title={t('nav.contact')} />

      <div style={styles.tabs}>
        {canViewSubmissions && (
          <button style={{ ...styles.tab, ...(tab === 'submissions' ? styles.tabActive : {}) }} onClick={() => setTab('submissions')}>
            {t('nav.submissions')}
          </button>
        )}
        <button style={{ ...styles.tab, ...(tab === 'inquiryTypes' ? styles.tabActive : {}) }} onClick={() => setTab('inquiryTypes')}>
          {t('nav.inquiryTypes')}
        </button>
      </div>

      {tab === 'submissions' && canViewSubmissions && (
        <SubmissionsTab canUpdate={canUpdateSubmissions} canDelete={canDeleteSubmissions} t={t} />
      )}
      {tab === 'inquiryTypes' && (
        <InquiryTypesTab canCreate={canCreateInquiryTypes} canUpdate={canUpdateInquiryTypes} canDelete={canDeleteInquiryTypes} t={t} />
      )}
    </CMSLayout>
  );
}

// ─── Submissions Tab ────────────────────────────────────────────────────────

function SubmissionsTab({ canUpdate, canDelete, t }) {
  const { showSuccess, showError } = useToast();
  const list = useCMSList(listSubmissions);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [priorityUpdate, setPriorityUpdate] = useState('');
  const [assignedToUpdate, setAssignedToUpdate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openDetail = useCallback(async (submission) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await getSubmission(submission.id);
      setDetail(data);
      setStatusUpdate(data.status || '');
      setPriorityUpdate(data.priority || '');
      setAssignedToUpdate(data.assigned_to ?? null);
    } catch (err) { showError(parseApiError(err)); }
    finally { setDetailLoading(false); }
  }, [showError]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateSubmission(detail.id, {
        status: statusUpdate,
        priority: priorityUpdate,
        assigned_to: assignedToUpdate,
        internal_notes: detail.internal_notes || '',
      });
      showSuccess(t('msg.saved'));
      setDetailOpen(false);
      list.refresh();
    } catch (err) { showError(parseApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSubmission(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setDeleting(false); }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <>
      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.status || ''} onChange={(e) => list.setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
          <option value="spam">Spam</option>
          <option value="archived">Archived</option>
        </CMSSelect>
        <CMSSelect value={list.filters.priority || ''} onChange={(e) => list.setFilter('priority', e.target.value)}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </CMSSelect>
      </CMSToolbar>

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Priority' },
            { key: 'date', label: 'Date' },
            { key: 'actions', label: '', align: 'right' },
          ]}>
            {list.items.map((sub) => (
              <CMSTableRow key={sub.id}>
                <CMSTableCell>{sub.full_name}</CMSTableCell>
                <CMSTableCell>{sub.email}</CMSTableCell>
                <CMSTableCell>{sub.inquiry_type_name || sub.inquiry_type || '—'}</CMSTableCell>
                <CMSTableCell><StatusBadge status={sub.status} /></CMSTableCell>
                <CMSTableCell>
                  {sub.priority && <CMSBadge type={sub.priority === 'urgent' ? 'danger' : sub.priority === 'high' ? 'warning' : 'default'} size="xs">{sub.priority}</CMSBadge>}
                </CMSTableCell>
                <CMSTableCell>{new Date(sub.created_at).toLocaleDateString()}</CMSTableCell>
                <CMSTableCell align="right">
                  <TableActionButton onClick={() => openDetail(sub)}>{t('action.view')}</TableActionButton>
                  {canDelete && <TableActionButton onClick={() => setDeleteTarget(sub)} style={{ color: '#ef4444' }}>{t('action.delete')}</TableActionButton>}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      {/* Detail / Edit Dialog */}
      <CMSDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Submission Details"
        size="lg"
        footer={
          canUpdate && detail && (
            <>
              <CMSButton variant="secondary" onClick={() => setDetailOpen(false)}>{t('action.cancel')}</CMSButton>
              <CMSButton variant="primary" onClick={handleUpdate} loading={saving}>{t('action.save')}</CMSButton>
            </>
          )
        }
      >
        {detailLoading && <CMSLoadingState />}
        {detail && !detailLoading && (
          <div style={styles.detailGrid}>
            <div style={styles.detailRow}><span style={styles.detailLabel}>{t('form.name')}:</span> {detail.full_name}</div>
            <div style={styles.detailRow}><span style={styles.detailLabel}>{t('form.email')}:</span> {detail.email}</div>
            {detail.phone && <div style={styles.detailRow}><span style={styles.detailLabel}>{t('form.phone')}:</span> {detail.phone}</div>}
            {detail.company && <div style={styles.detailRow}><span style={styles.detailLabel}>{t('form.company')}:</span> {detail.company}</div>}
            <div style={styles.detailRow}><span style={styles.detailLabel}>{t('contact.inquiryType')}:</span> {detail.inquiry_type_name || '—'}</div>
            <div style={styles.detailRow}><span style={styles.detailLabel}>{t('form.date')}:</span> {new Date(detail.created_at).toLocaleString()}</div>
            <div style={styles.detailMessage}>
              <span style={styles.detailLabel}>{t('form.message')}:</span>
              <p style={styles.messageText}>{detail.message}</p>
            </div>
            {canUpdate && (
              <div className="cms-form-grid" style={{ marginTop: '1rem' }}>
                <CMSSelect label={t('form.status')} value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}>
                  <option value="new">{t('status.new')}</option>
                  <option value="contacted">{t('status.contacted')}</option>
                  <option value="in_progress">{t('status.inProgress')}</option>
                  <option value="closed">{t('status.closed')}</option>
                  <option value="spam">{t('status.spam')}</option>
                  <option value="archived">{t('status.archived')}</option>
                </CMSSelect>
                <CMSSelect label={t('form.priority')} value={priorityUpdate} onChange={(e) => setPriorityUpdate(e.target.value)}>
                  <option value="low">{t('priority.low')}</option>
                  <option value="medium">{t('priority.medium')}</option>
                  <option value="high">{t('priority.high')}</option>
                  <option value="urgent">{t('priority.urgent')}</option>
                </CMSSelect>
                <CMSInput label={t('form.assignedTo')} type="number" value={assignedToUpdate ?? ''} onChange={(e) => setAssignedToUpdate(e.target.value ? parseInt(e.target.value) : null)} />
              </div>
            )}
            {canUpdate && (
              <div style={{ marginTop: '1rem' }}>
                <CMSTextarea label={t('form.internalNotes')} value={detail.internal_notes || ''} onChange={(e) => setDetail((d) => ({ ...d, internal_notes: e.target.value }))} rows={3} />
              </div>
            )}
          </div>
        )}
      </CMSDialog>

      <CMSConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        message={t('confirm.delete.message', { name: deleteTarget?.full_name })} />
    </>
  );
}

// ─── Inquiry Types Tab ──────────────────────────────────────────────────────

function InquiryTypesTab({ canCreate, canUpdate, canDelete, t }) {
  const { showSuccess, showError } = useToast();
  const list = useCMSList(listInquiryTypes);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name_en: '', name_ar: '', description_en: '', description_ar: '', is_active: true, order: 0 });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditData(null);
    setFormData({ name_en: '', name_ar: '', description_en: '', description_ar: '', is_active: true, order: 0 });
    setFieldErrors({});
    setEditOpen(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setFormData({
      name_en: item.name_en || '', name_ar: item.name_ar || '',
      description_en: item.description_en || '', description_ar: item.description_ar || '',
      is_active: item.is_active ?? true, order: item.order || 0,
    });
    setFieldErrors({});
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setFieldErrors({});
    try {
      if (editData) await updateInquiryType(editData.id, formData);
      else await createInquiryType(formData);
      showSuccess(t('msg.saved'));
      setEditOpen(false);
      list.refresh();
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally { setSaving(false); }
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInquiryType(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setDeleting(false); }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <>
      {canCreate && (
        <div style={{ marginBottom: '1rem' }}>
          <CMSButton variant="primary" onClick={openCreate}>+ {t('action.addNew')}</CMSButton>
        </div>
      )}

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'name', label: 'Name' },
            { key: 'order', label: 'Order', align: 'center' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', align: 'right' },
          ]}>
            {list.items.map((item) => (
              <CMSTableRow key={item.id}>
                <CMSTableCell>{item.name_en || item.name_ar}</CMSTableCell>
                <CMSTableCell align="center">{item.display_order}</CMSTableCell>
                <CMSTableCell><StatusBadge status={item.is_active ? 'active' : 'inactive'} /></CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && <TableActionButton onClick={() => openEdit(item)}>{t('action.edit')}</TableActionButton>}
                  {canDelete && <TableActionButton onClick={() => setDeleteTarget(item)} style={{ color: '#ef4444' }}>{t('action.delete')}</TableActionButton>}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      <CMSDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={editData ? `${t('action.edit')} Inquiry Type` : `${t('action.addNew')} Inquiry Type`}
        size="md"
        footer={
          <>
            <CMSButton variant="secondary" onClick={() => setEditOpen(false)}>{t('action.cancel')}</CMSButton>
            <CMSButton variant="primary" onClick={handleSave} loading={saving}>{t('action.save')}</CMSButton>
          </>
        }
      >
        <div style={styles.form}>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.name')} (${t('form.english')})`} required value={formData.name_en} onChange={(e) => setFormData((p) => ({ ...p, name_en: e.target.value }))} error={fieldErrors.name_en} />
            <CMSInput label={`${t('form.name')} (${t('form.arabic')})`} value={formData.name_ar} onChange={(e) => setFormData((p) => ({ ...p, name_ar: e.target.value }))} dir="rtl" />
          </div>
          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.description')} (${t('form.english')})`} value={formData.description_en} onChange={(e) => setFormData((p) => ({ ...p, description_en: e.target.value }))} rows={2} />
            <CMSTextarea label={`${t('form.description')} (${t('form.arabic')})`} value={formData.description_ar} onChange={(e) => setFormData((p) => ({ ...p, description_ar: e.target.value }))} rows={2} dir="rtl" />
          </div>
          <div className="cms-form-grid">
            <CMSInput label={t('form.order')} type="number" value={formData.order} onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
          </div>
          <CMSCheckbox label={t('form.active')} checked={formData.is_active} onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))} />
        </div>
      </CMSDialog>

      <CMSConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        message={t('confirm.delete.message', { name: deleteTarget?.name_en })} />
    </>
  );
}

const styles = {
  tabs: { display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #1e1e2e' },
  tab: { padding: '0.625rem 1rem', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '500', borderBottom: '2px solid transparent', fontFamily: 'inherit' },
  tabActive: { color: '#c9a96e', borderBottomColor: '#c9a96e' },
  detailGrid: { display: 'flex', flexDirection: 'column', gap: '0.625rem' },
  detailRow: { display: 'flex', gap: '0.5rem', fontSize: '0.8125rem' },
  detailLabel: { color: '#888', minWidth: '100px', flexShrink: 0 },
  detailMessage: { marginTop: '0.5rem' },
  messageText: { background: '#0a0a14', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', color: '#ccc', lineHeight: 1.5, marginTop: '0.375rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
};
