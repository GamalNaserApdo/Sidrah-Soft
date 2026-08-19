import { useRef } from 'react';
import useScrollProgress from '../hooks/useScrollProgress';

/**
 * SidrahSoft lightweight global background.
 *
 * Replaces the previous InteractiveNetworkBackground (Canvas rAF),
 * CinematicLayers (mood system), and MouseGlow (pointer tracking) with a
 * pure-CSS grid + static ambient glow. Zero continuous JavaScript.
 *
 * The only runtime behavior is the scroll-progress bar, which is scroll-driven
 * (rAF only fires on scroll/resize) and disabled under reduced motion.
 */
function SidrahGridBackground() {
  const progressRef = useRef(null);
  useScrollProgress(progressRef);

  return (
    <>
      <div className="sidrah-grid-base" aria-hidden="true" />
      <div className="sidrah-grid-lines" aria-hidden="true" />
      <div className="sidrah-grid-ambient" aria-hidden="true">
        <div className="sidrah-grid-glow sidrah-grid-glow--purple" />
        <div className="sidrah-grid-glow sidrah-grid-glow--gold" />
      </div>
      <div ref={progressRef} className="sidrah-scroll-progress" aria-hidden="true" />
    </>
  );
}

export default SidrahGridBackground;
