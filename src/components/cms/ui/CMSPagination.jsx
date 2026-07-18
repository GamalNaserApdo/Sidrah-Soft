/**
 * CMS Pagination Component
 *
 * Page-based navigation with Previous/Next and page numbers.
 * Works with DRF PageNumberPagination response shape.
 */

import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function CMSPagination({ page, totalPages, onPageChange, count }) {
  const { t } = useCMSLang();

  if (totalPages <= 1) {
    return count != null ? (
      <div style={styles.count}>{count} {count === 1 ? 'item' : 'items'}</div>
    ) : null;
  }

  const pages = getPageRange(page, totalPages);

  return (
    <div style={styles.container}>
      {count != null && <span style={styles.count}>{count} items</span>}
      <div style={styles.controls}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={styles.btn}
          aria-label={t('action.previous')}
        >
          ← {t('action.previous')}
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`gap-${i}`} style={styles.gap}>…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              style={{
                ...styles.btn,
                ...(p === page ? styles.btnActive : {}),
              }}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={styles.btn}
          aria-label={t('action.next')}
        >
          {t('action.next')} →
        </button>
      </div>
    </div>
  );
}

function getPageRange(current, total) {
  const delta = 2;
  const range = [];
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  if (left > 1) {
    range.push(1);
    if (left > 2) range.push('...');
  }
  for (let i = left; i <= right; i++) {
    range.push(i);
  }
  if (right < total) {
    if (right < total - 1) range.push('...');
    range.push(total);
  }
  return range;
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-4)',
    marginTop: 'var(--space-6)',
    flexWrap: 'wrap',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  btn: {
    padding: 'var(--space-1) var(--space-3)',
    borderRadius: 'var(--cms-radius-sm)',
    border: '1px solid var(--cms-border-default)',
    background: 'transparent',
    color: 'var(--cms-text-secondary)',
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'var(--cms-transition-fast)',
  },
  btnActive: {
    background: 'var(--cms-accent-bg)',
    borderColor: 'var(--cms-accent)',
    color: 'var(--cms-accent)',
    fontWeight: '600',
  },
  gap: {
    color: 'var(--cms-text-dim)',
    fontSize: 'var(--font-size-sm)',
    padding: '0 var(--space-1)',
  },
  count: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--cms-text-muted)',
  },
};
