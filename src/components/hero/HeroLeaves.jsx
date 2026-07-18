import { useMemo } from 'react';

const LEAF_COUNT = 6;

function HeroLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: LEAF_COUNT }, (_, i) => {
      const seed = i * 211 + 73;
      const x = (seed * 7919) % 100;
      const delay = ((seed * 389) % 1200) / 100;
      const duration = 12 + ((seed * 127) % 800) / 100;
      const size = 3 + ((seed * 53) % 40) / 10;
      const drift = ((seed * 67) % 60) - 30;
      const rotateEnd = ((seed * 97) % 180);
      const opacity = 0.08 + ((seed * 43) % 12) / 100;
      return { id: i, x, delay, duration, size, drift, rotateEnd, opacity };
    });
  }, []);

  return (
    <div className="hero-leaves" aria-hidden="true">
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="hero-leaf"
          style={{
            left: `${leaf.x}%`,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            opacity: leaf.opacity,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
            '--leaf-drift': `${leaf.drift}px`,
            '--leaf-rotate': `${leaf.rotateEnd}deg`,
          }}
        />
      ))}
    </div>
  );
}

export default HeroLeaves;
