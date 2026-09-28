import { useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DieMark, Wordmark } from './icons';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';

export function Nav({ right }: { right?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  // Slide in on load; hide while scrolling down, reveal on scroll up.
  useGSAP(
    () => {
      gsap.from(ref.current, { yPercent: -100, duration: 0.8, ease: 'power3.out' });
      gsap.from('.nav-links a, .nav-actions > *', { y: -20, autoAlpha: 0, stagger: 0.06, delay: 0.25, duration: 0.5, ease: 'power2.out' });
      const show = gsap.quickTo(ref.current, 'yPercent', { duration: 0.35, ease: 'power2.out' });
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const past = self.scroll() > 240;
          show(past && self.direction === 1 ? -110 : 0);
        },
      });
    },
    { scope: ref },
  );

  return (
    <nav ref={ref} className="nav" aria-label="Main">
      <Link to="/" className="brand" aria-label="jeuxdesociete home">
        <DieMark className="die" />
        <Wordmark />
      </Link>
      <div className="nav-links">
        <NavLink to="/lobby">Games</NavLink>
        <NavLink to="/lobby" end className={() => ''}>
          Play online
        </NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/pricing">Pricing</NavLink>
      </div>
      <div className="nav-actions">
        <Link to="/login" style={{ color: '#F4EBD6', fontWeight: 700, fontSize: 16, padding: '12px 18px' }}>
          Log in
        </Link>
        {right ?? (
          <Link to="/register" className="btn btn-yellow" style={{ height: 46, padding: '0 22px', fontSize: 16 }}>
            Play free
          </Link>
        )}
      </div>
    </nav>
  );
}
