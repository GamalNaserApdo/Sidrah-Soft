/**
 * MediaGrid — responsive grid of MediaCard components.
 */

import MediaCard from './MediaCard';

export default function MediaGrid({ assets, onAssetClick }) {
  return (
    <div style={styles.grid}>
      {assets.map((asset) => (
        <MediaCard
          key={asset.id}
          asset={asset}
          onClick={onAssetClick}
        />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
};
