import { useRef } from 'react';
import usePublicSectionMood from '../../hooks/usePublicSectionMood';
import useScrollProgress from '../../hooks/useScrollProgress';

function CinematicLayers({ defaultMood }) {
  const progressRef = useRef(null);
  const mood = usePublicSectionMood(defaultMood);

  useScrollProgress(progressRef);

  return (
    <div className="cinematic-layers" data-ambient={mood} aria-hidden="true">
      <div className="cinematic-ambient" />
      <div className="cinematic-glow" />
      <div className="cinematic-vignette" />
      <div className="cinematic-grain" />
      <div ref={progressRef} className="cinematic-progress" />
    </div>
  );
}

export default CinematicLayers;
