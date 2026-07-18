import { useMemo } from 'react';

const MOTE_COUNT = 8;

function HeroMotes() {
  const motes = useMemo(() => {
    return Array.from({ length: MOTE_COUNT }, (_, i) => {
      const seed = i * 137 + 41;
      const x = (seed * 7919) % 100;
      const y = (seed * 6151) % 100;
      const delay = ((seed * 389) % 800) / 100;
      const duration = 6 + ((seed * 127) % 600) / 100;
      const size = 2 + ((seed * 53) % 30) / 10;
      const opacity = 0.15 + ((seed * 97) % 25) / 100;
      return { id: i, x, y, delay, duration, size, opacity };
    });
  }, []);

  return (
    <div className="hero-motes" aria-hidden="true">
      {motes.map((mote) => (
        <span
          key={mote.id}
          className="hero-mote"
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            opacity: mote.opacity,
            animationDelay: `${mote.delay}s`,
            animationDuration: `${mote.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default HeroMotes;
