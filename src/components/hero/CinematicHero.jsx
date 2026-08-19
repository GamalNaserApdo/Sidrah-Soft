import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroContent from './HeroContent';
import HeroAura from './HeroAura';
import HeroMotes from './HeroMotes';
import HeroSheen from './HeroSheen';
import HeroScrollCue from './HeroScrollCue';

gsap.registerPlugin(ScrollTrigger);

/**
 * SidrahSoft Hero — lightweight technical-grid edition.
 *
 * The old golden-tree poster, smoke, and leaves have been removed.
 * The Hero now exposes the global SidrahGridBackground through transparent
 * layers, with Hero-specific static depth accents (aura, motes, sheen) and
 * a subtle content-side grid emphasis for composition balance.
 *
 * GSAP scroll behavior is reduced to a gentle content fade + slight upward
 * translate. No poster transforms, no parallax.
 */
function CinematicHero() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const scrollCueRef = useRef(null);
  const motesRef = useRef(null);
  const scrollTriggerRef = useRef(null);

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

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, []);

  return (
    <section id="home" ref={containerRef} className="cinematic-hero">
      <div className="hero-stage">
        <HeroAura />
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
      </div>
    </section>
  );
}

export default CinematicHero;
