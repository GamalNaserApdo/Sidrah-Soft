/**
 * CMS Page Header — title + actions bar.
 */

export default function CMSPageHeader({ title, actions, subtitle }) {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-6)',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--cms-text-primary)',
    margin: 0,
  },
  subtitle: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--cms-text-secondary)',
    marginTop: 'var(--space-1)',
  },
  actions: {
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
};
