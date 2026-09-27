/**
 * CMS Form Submissions Page — /cms/forms/:id/submissions
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { listSubmissions, getSubmission, updateSubmission, exportSubmissionsUrl } from '../../services/cms/formsApi';
import { cmsFetch } from '../../services/cms/cmsFetch';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSFormSubmissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const canExport = hasCapability('forms.export');

  const [submissions, setSubmissions] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, form: id };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await listSubmissions(params);
      setSubmissions(data.results || []);
      setCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 20));
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id, page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleViewDetail = useCallback(async (submissionId) => {
    setSelectedSubmission(submissionId);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const data = await getSubmission(submissionId);
      setDetailData(data);
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setDetailLoading(false);
    }
  }, [showError]);

  const handleStatusChange = useCallback(async (submissionId, newStatus) => {
    try {
      await updateSubmission(submissionId, { status: newStatus });
      showSuccess('Status updated');
      load();
      if (selectedSubmission === submissionId) {
        setDetailData(prev => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (err) {
      showError(parseApiError(err));
    }
  }, [showSuccess, showError, load, selectedSubmission]);

  const handleExport = useCallback(async () => {
    try {
      const blob = await cmsFetch(exportSubmissionsUrl(id), { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form_submissions.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSuccess('Export downloaded');
    } catch (err) {
      showError(parseApiError(err));
    }
  }, [id, showSuccess, showError]);

  return (
    <CMSLayout>
      <CMSPageHeader
        title="Form Submissions"
        actions={
          <>
            <Link to="/cms/forms"><CMSButton variant="secondary">{t('action.back')}</CMSButton></Link>
            {canExport && <CMSButton variant="primary" onClick={handleExport}>Export CSV</CMSButton>}
          </>
        }
      />
      <CMSToolbar search={search} onSearchChange={setSearch} onSearchSubmit={() => { setPage(1); load(); }}>
        <CMSSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="archived">Archived</option>
        </CMSSelect>
      </CMSToolbar>

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}
      {!loading && !error && submissions.length === 0 && <CMSEmptyState message="No submissions found" />}
      {!loading && !error && submissions.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'submitted_at', label: 'Submitted' },
            { key: 'language', label: 'Lang' },
            { key: 'status', label: 'Status' },
            { key: 'summary', label: 'Summary' },
            { key: 'actions', label: t('col.actions'), align: 'right' },
          ]}>
            {submissions.map((sub) => (
              <CMSTableRow key={sub.id}>
                <CMSTableCell>{new Date(sub.submitted_at).toLocaleString()}</CMSTableCell>
                <CMSTableCell>{sub.language}</CMSTableCell>
                <CMSTableCell>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: sub.status === 'new' ? '#dbeafe' : sub.status === 'reviewed' ? '#d1fae5' : '#f3f4f6',
                    color: sub.status === 'new' ? '#1e40af' : sub.status === 'reviewed' ? '#065f46' : '#6b7280',
                  }}>
                    {sub.status}
                  </span>
                </CMSTableCell>
                <CMSTableCell>
                  {sub.values_summary && sub.values_summary.length > 0
                    ? sub.values_summary.map((v, i) => (
                        <span key={i} style={{ display: 'inline-block', marginRight: '0.5rem', fontSize: '0.75rem' }}>
                          <strong>{v.field_label}:</strong> {v.value}
                        </span>
                      ))
                    : '—'}
                </CMSTableCell>
                <CMSTableCell align="right">
                  <TableActionButton onClick={() => handleViewDetail(sub.id)}>View</TableActionButton>
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={page} totalPages={totalPages} onPageChange={setPage} count={count} />
        </>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div style={modalStyles.overlay} onClick={() => setSelectedSubmission(null)}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div style={modalStyles.header}>
              <h3 style={modalStyles.title}>Submission Detail</h3>
              <button onClick={() => setSelectedSubmission(null)} style={modalStyles.closeBtn}>×</button>
            </div>
            <div style={modalStyles.body}>
              {detailLoading && <CMSLoadingState />}
              {detailData && (
                <>
                  <div style={modalStyles.meta}>
                    <div><strong>Submitted:</strong> {new Date(detailData.submitted_at).toLocaleString()}</div>
                    <div><strong>Language:</strong> {detailData.language}</div>
                    <div><strong>Source Page:</strong> {detailData.source_page || '—'}</div>
                    <div><strong>IP:</strong> {detailData.ip_address || '—'}</div>
                  </div>
                  <div style={modalStyles.statusRow}>
                    <label style={modalStyles.statusLabel}>Status:</label>
                    <CMSSelect value={detailData.status} onChange={(e) => handleStatusChange(detailData.id, e.target.value)} style={{ width: 'auto' }}>
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="archived">Archived</option>
                    </CMSSelect>
                  </div>
                  <div style={modalStyles.valuesSection}>
                    <h4 style={modalStyles.valuesTitle}>Submitted Values</h4>
                    {detailData.values && detailData.values.length > 0 ? (
                      <div style={modalStyles.valuesList}>
                        {detailData.values.map((v, i) => (
                          <div key={i} style={modalStyles.valueRow}>
                            <div style={modalStyles.valueLabel}>{v.field_label || v.field_key}</div>
                            <div style={modalStyles.valueContent}>{v.value || '(empty)'}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No values</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </CMSLayout>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'var(--cms-bg-card)',
    borderRadius: '0.75rem',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--cms-border-subtle)',
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
  },
  body: {
    padding: '1.5rem',
    overflowY: 'auto',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: 'var(--cms-bg-page)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  statusLabel: {
    fontWeight: 600,
  },
  valuesSection: {
    marginTop: '1rem',
  },
  valuesTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '1rem',
    fontWeight: 600,
  },
  valuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  valueRow: {
    padding: '0.75rem',
    border: '1px solid var(--cms-border-subtle)',
    borderRadius: '0.5rem',
  },
  valueLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--cms-text-muted)',
    marginBottom: '0.25rem',
  },
  valueContent: {
    fontSize: '0.9rem',
    wordBreak: 'break-word',
  },
};
