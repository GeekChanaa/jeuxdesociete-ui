import type { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap';

const FROM: Record<string, gsap.TweenVars> = {
  up: { y: 60, autoAlpha: 0 },
  down: { y: -40, autoAlpha: 0 },
  left: { x: -80, autoAlpha: 0 },
  right: { x: 80, autoAlpha: 0 },
  pop: { scale: 0.6, autoAlpha: 0, rotation: -6 },
  flip: { rotationX: -80, y: 40, autoAlpha: 0, transformPerspective: 800, transformOrigin: '50% 0%' },
  fade: { autoAlpha: 0 },
};

/**
 * Scroll reveals for every `[data-reveal="up|down|left|right|pop|flip|fade"]` element
 * inside `scope`. Siblings that enter together are staggered via ScrollTrigger.batch.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        Object.entries(FROM).forEach(([kind, from]) => {
          const els = gsap.utils.toArray<HTMLElement>(`[data-reveal="${kind}"]`, scope.current);
          if (!els.length) return;
          gsap.set(els, from);
          ScrollTrigger.batch(els, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                rotationX: 0,
                autoAlpha: 1,
                duration: kind === 'pop' ? 0.7 : 0.9,
                ease: kind === 'pop' ? 'back.out(1.8)' : 'power3.out',
                stagger: 0.09,
                overwrite: true,
                clearProps: 'transform',
              }),
          });
        });
      });
      return () => mm.revert();
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  );
}
