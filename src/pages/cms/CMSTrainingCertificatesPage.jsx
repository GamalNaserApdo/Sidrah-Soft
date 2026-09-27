import { Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSBadge from '../../components/cms/ui/CMSBadge';
import { CMSInput, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import { useCMSList } from '../../hooks/cms/useCMSList';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { listCertificates } from '../../services/cms/certificatesApi';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'revoked', label: 'Revoked' },
];

const STATUS_CLASSES = {
  draft: 'default',
  issued: 'success',
  revoked: 'danger',
};

export default function CMSTrainingCertificatesPage() {
  const { t } = useCMSLang();
  const { hasCapability } = useAuth();
  const canView = hasCapability('certificates.view');
  const canCreate = hasCapability('certificates.create');

  const list = useCMSList(listCertificates, { page_size: 20 });

  if (!canView) {
    return (
      <CMSLayout>
        <CMSLoadingState />
      </CMSLayout>
    );
  }

  const statusLabel = (value) => t(`certificate.status.${value}`);

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.trainingCertificates') || 'Certificates'}
        actions={
          <>
            {canCreate && (
              <Link to="/cms/training/certificates/new">
                <CMSButton variant="primary">+ {t('action.addNew')}</CMSButton>
              </Link>
            )}
          </>
        }
      />

      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.status || ''} onChange={(e) => list.setFilter('status', e.target.value)}>
          <option value="">{t('training.status.all')}</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{statusLabel(o.value)}</option>
          ))}
        </CMSSelect>
        <CMSInput
          type="date"
          value={list.filters.date_from || ''}
          onChange={(e) => list.setFilter('date_from', e.target.value)}
          placeholder={t('form.from') || 'From'}
        />
        <CMSInput
          type="date"
          value={list.filters.date_to || ''}
          onChange={(e) => list.setFilter('date_to', e.target.value)}
          placeholder={t('form.to') || 'To'}
        />
      </CMSToolbar>

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && (
        <CMSEmptyState message={t('state.empty')} />
      )}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable
            columns={[
              { key: 'reference', label: t('certificate.reference') || 'Reference' },
              { key: 'recipient', label: t('certificate.recipient') || 'Recipient' },
              { key: 'program', label: t('training.title') },
              { key: 'status', label: t('form.status') },
              { key: 'issued', label: t('certificate.issuedAt') || 'Issued' },
              { key: 'actions', label: '', align: 'right' },
            ]}
          >
            {list.items.map((c) => (
              <CMSTableRow key={c.id}>
                <CMSTableCell><code className="cms-slug">{c.reference}</code></CMSTableCell>
                <CMSTableCell>{c.recipient_name || '—'}</CMSTableCell>
                <CMSTableCell>{c.program_title || c.program || '—'}</CMSTableCell>
                <CMSTableCell>
                  <CMSBadge type={STATUS_CLASSES[c.status] || 'default'}>{statusLabel(c.status)}</CMSBadge>
                </CMSTableCell>
                <CMSTableCell>{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}</CMSTableCell>
                <CMSTableCell align="right">
                  <Link to={`/cms/training/certificates/${c.id}`}>
                    <TableActionButton>{t('action.view')}</TableActionButton>
                  </Link>
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination
            page={list.page}
            totalPages={list.totalPages}
            onPageChange={list.setPage}
            count={list.count}
          />
        </>
      )}
    </CMSLayout>
  );
}

const styles = {
  counts: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  count: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--cms-bg-surface)',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--cms-radius-md)',
  },
  countLabel: {
    fontSize: '0.8125rem',
    color: 'var(--cms-text-secondary)',
  },
};
