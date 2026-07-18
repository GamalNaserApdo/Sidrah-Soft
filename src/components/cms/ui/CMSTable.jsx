/**
 * CMS Table Component
 *
 * Accessible, responsive data table with sortable headers.
 * Wraps in overflow-x container for mobile.
 */

import { forwardRef } from 'react';

const CMSButton = ({ children, onClick, disabled, active, style, title, ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      background: active ? 'var(--cms-accent-bg)' : 'transparent',
      border: 'none',
      color: active ? 'var(--cms-accent)' : 'var(--cms-text-muted)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 'var(--font-size-xs)',
      padding: 'var(--space-1) var(--space-2)',
      opacity: disabled ? 0.3 : 1,
      ...style,
    }}
    {...rest}
  >
    {children}
  </button>
);

export function CMSTable({ columns, children }) {
  return (
    <div className="cms-table-wrapper" style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...styles.th,
                  ...(col.width ? { width: col.width } : {}),
                  ...(col.align === 'center' ? { textAlign: 'center' } : {}),
                  ...(col.align === 'right' ? { textAlign: 'right' } : {}),
                }}
                scope="col"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function CMSTableRow({ children, onClick, style }) {
  return (
    <tr
      onClick={onClick}
      style={{
        ...styles.tr,
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
    >
      {children}
    </tr>
  );
}

export function CMSTableCell({ children, align, style, colSpan }) {
  return (
    <td
      style={{
        ...styles.td,
        ...(align === 'center' ? { textAlign: 'center' } : {}),
        ...(align === 'right' ? { textAlign: 'right' } : {}),
        ...style,
      }}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

const styles = {
  wrapper: {
    overflowX: 'auto',
    background: 'var(--cms-bg-surface)',
    borderRadius: 'var(--cms-radius-lg)',
    border: '1px solid var(--cms-border-subtle)',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 'var(--font-size-md)',
  },
  th: {
    padding: 'var(--space-2) var(--space-3)',
    textAlign: 'left',
    borderBottom: '1px solid var(--cms-border-default)',
    color: 'var(--cms-accent)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    fontSize: 'var(--font-size-sm)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--letter-spacing-wide)',
  },
  tr: {
    borderBottom: '1px solid var(--cms-border-subtle)',
    transition: 'background var(--cms-transition-fast)',
  },
  td: {
    padding: 'var(--space-2) var(--space-3)',
    color: 'var(--cms-text-primary)',
    verticalAlign: 'middle',
  },
};

export { CMSButton as TableActionButton };
