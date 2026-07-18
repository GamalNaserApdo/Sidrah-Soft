import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import HeroContent from './HeroContent';
import HeroAura from './HeroAura';
import HeroMotes from './HeroMotes';
import HeroSheen from './HeroSheen';
import HeroSmoke from './HeroSmoke';
import HeroLeaves from './HeroLeaves';
import HeroScrollCue from './HeroScrollCue';

import desktopPoster from '../../assets/hero/digital-sidrah/hero-digital-sidrah-desktop.webp';
import mobilePoster from '../../assets/hero/digital-sidrah/hero-digital-sidrah-mobile.webp';

gsap.registerPlugin(ScrollTrigger);

function detectFrameSet() {
  const viewportWidth = window.innerWidth;
  const hardwareConcurrency = navigator.hardwareConcurrency || 8;
  const deviceMemory = navigator.deviceMemory || 8;

  const isMobileViewport = viewportWidth < 768;
  const isLowEndCpu = hardwareConcurrency <= 4;
  const isLowEndMemory = deviceMemory <= 4;

  if (isMobileViewport || isLowEndCpu || isLowEndMemory) {
    return 'mobile';
  }
  return 'desktop';
}

function CinematicHero() {
  const { t } = useI18n();
  const containerRef = useRef(null);
  const posterWrapperRef = useRef(null);
  const posterRef = useRef(null);
  const contentRef = useRef(null);
  const scrollCueRef = useRef(null);
  const smokeRef = useRef(null);
  const leavesRef = useRef(null);
  const motesRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  const [status, setStatus] = useState('loading');
  const [posterSrc, setPosterSrc] = useState(desktopPoster);

  useEffect(() => {
    const detected = detectFrameSet();
    setPosterSrc(detected === 'mobile' ? mobilePoster : desktopPoster);
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = reducedMotionQuery.matches;

    function updateScrollUi(progress) {
      if (scrollCueRef.current) {
        if (progress > 0.03) {
          scrollCueRef.current.classList.remove('is-visible');
        } else {
          scrollCueRef.current.classList.add('is-visible');
        }
      }

      if (contentRef.current) {
        const contentFadeStart = 0.12;
        const contentFadeEnd = 0.42;
        if (progress < contentFadeStart) {
          contentRef.current.style.opacity = '1';
          contentRef.current.style.transform = 'translateY(0)';
        } else if (progress > contentFadeEnd) {
          contentRef.current.style.opacity = '0';
          contentRef.current.style.transform = 'translateY(-2rem)';
        } else {
          const fadeProgress = (progress - contentFadeStart) / (contentFadeEnd - contentFadeStart);
          contentRef.current.style.opacity = String(1 - fadeProgress);
          contentRef.current.style.transform = `translateY(${-2 * fadeProgress}rem)`;
        }
      }

      if (posterWrapperRef.current) {
        let scale = 1;
        let translateY = 0;

        if (progress <= 0.12) {
          scale = 1;
          translateY = 0;
        } else if (progress <= 0.42) {
          const p = (progress - 0.12) / (0.42 - 0.12);
          scale = 1 + 0.035 * p;
          translateY = -2 * p;
        } else if (progress <= 0.85) {
          const p = (progress - 0.42) / (0.85 - 0.42);
          scale = 1.035 + 0.035 * p;
          translateY = -2 - 3 * p;
        } else {
          scale = 1.07;
          translateY = -5;
        }

        posterWrapperRef.current.style.transform = `scale(${scale}) translateY(${translateY}%)`;

        const fadeProgress = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));
        posterWrapperRef.current.style.opacity = String(1 - fadeProgress);
      }

      if (smokeRef.current) {
        let smokeOpacity = 1;
        if (progress > 0.42) {
          smokeOpacity = Math.max(0, 1 - (progress - 0.42) / 0.25);
        }
        smokeRef.current.style.opacity = String(smokeOpacity);
      }

      if (leavesRef.current) {
        let leavesOpacity = 0;
        if (progress > 0.08 && progress <= 0.50) {
          leavesOpacity = (progress - 0.08) / (0.50 - 0.08);
        } else if (progress > 0.50 && progress <= 0.85) {
          leavesOpacity = 1;
        } else if (progress > 0.85) {
          leavesOpacity = Math.max(0, 1 - (progress - 0.85) / 0.15);
        }
        leavesRef.current.style.opacity = String(leavesOpacity);
      }

      if (motesRef.current) {
        let motesOpacity = 1;
        if (progress > 0.85) {
          motesOpacity = Math.max(0, 1 - (progress - 0.85) / 0.15);
        }
        motesRef.current.style.opacity = String(motesOpacity);
      }
    }

    function setupScrollTrigger() {
      if (!containerRef.current) return;

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          updateScrollUi(self.progress);
        }
      });
    }

    if (prefersReducedMotion) {
      if (scrollCueRef.current) {
        scrollCueRef.current.classList.remove('is-visible');
      }
      if (contentRef.current) {
        contentRef.current.classList.add('is-revealed');
      }
      if (posterWrapperRef.current) {
        posterWrapperRef.current.style.transform = 'scale(1) translateY(0)';
      }
    } else {
      setupScrollTrigger();
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.classList.add('is-revealed');
        }
        if (scrollCueRef.current) {
          scrollCueRef.current.classList.add('is-visible');
        }
      });
    }

    const handleMouseMove = (e) => {
      if (!containerRef.current || !posterWrapperRef.current) return;
      const { clientX, clientY } = e;
      const { width, height, left, top } = containerRef.current.getBoundingClientRect();

      const mouseX = clientX - (left + width / 2);
      const mouseY = clientY - (top + height / 2);

      const posterDepth = 4;
      const translateX = (mouseX / width) * posterDepth;
      const translateY = (mouseY / height) * posterDepth;

      posterWrapperRef.current.style.setProperty('--poster-parallax-x', `${translateX}px`);
      posterWrapperRef.current.style.setProperty('--poster-parallax-y', `${translateY}px`);
    };

    const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (!isTouchDevice && !prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handlePosterLoad = () => {
    setStatus('ready');
  };

  const handlePosterError = () => {
    setStatus('error');
  };

  return (
    <section id="home" ref={containerRef} className="cinematic-hero">
      <div ref={posterWrapperRef} className="hero-poster-wrapper">
        <img
          ref={posterRef}
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className="hero-poster"
          loading="eager"
          decoding="async"
          onLoad={handlePosterLoad}
          onError={handlePosterError}
        />
        <div className="hero-text-protection" />
        <HeroAura />
        <div ref={smokeRef} className="hero-smoke-container">
          <HeroSmoke />
        </div>
        <div ref={leavesRef} className="hero-leaves-container">
          <HeroLeaves />
        </div>
        <div ref={motesRef} className="hero-motes-container">
          <HeroMotes />
        </div>
        <HeroSheen />
        <div className="hero-foundation-transition" />
        <div className="hero-content-overlay">
          <div ref={contentRef} className="hero-content-inner">
            <HeroContent />
          </div>
        </div>
        <div ref={scrollCueRef} className="hero-scroll-cue-wrapper">
          <HeroScrollCue />
        </div>
        {status === 'loading' && (
          <div className="cinematic-status">
            <span>{t('hero.loadingText')}</span>
          </div>
        )}
        {status === 'error' && (
          <div className="cinematic-status cinematic-status--error">
            <span>{t('hero.errorText')}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default CinematicHero;
