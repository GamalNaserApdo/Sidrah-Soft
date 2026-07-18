/**
 * LeadsPagination — page-based navigation for the leads list.
 */

import { useCMSLang } from '../../contexts/CMSLanguageContext';

export default function LeadsPagination({ page, totalPages, onPageChange, count }) {
  const { t, lang } = useCMSLang();

  const itemLabel = (n) => {
    if (lang === 'ar') {
      return n === 1 ? 'عنصر' : 'عناصر';
    }
    return n === 1 ? 'item' : 'items';
  };

  if (totalPages <= 1) {
    return count != null ? (
      <div className="leads-pagination">
        <span className="leads-pagination__count">{count} {itemLabel(count)}</span>
      </div>
    ) : null;
  }

  const pages = getPageRange(page, totalPages);

  return (
    <div className="leads-pagination">
      {count != null && (
        <span className="leads-pagination__count">{count} {itemLabel(count)}</span>
      )}
      <div className="leads-pagination__controls">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="leads-pagination__btn ui-focus-ring"
          aria-label={t('action.previous')}
        >
          ← {t('action.previous')}
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`gap-${i}`} className="leads-pagination__gap">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`leads-pagination__btn ui-focus-ring ${p === page ? 'leads-pagination__btn--active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              aria-label={t('media.pageNumber', { page: p })}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="leads-pagination__btn ui-focus-ring"
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
