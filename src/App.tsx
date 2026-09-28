import { useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SmoothScroll } from './lib/SmoothScroll';
import { gsap, useGSAP } from './lib/gsap';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import Register from './pages/Register';
import Shop from './pages/Shop';

/** A yellow card that sweeps across the screen on every route change. */
function RouteWipe() {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(ref.current, { yPercent: 0, autoAlpha: 1 }, { yPercent: -100, duration: 0.7, ease: 'power4.inOut', delay: 0.05 });
      gsap.fromTo('.wipe-die', { rotation: 0, scale: 1 }, { rotation: 180, scale: 0.6, duration: 0.6, ease: 'power2.in' });
    },
    { dependencies: [pathname] },
  );
  return (
    <div ref={ref} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#FFC72C', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', visibility: 'hidden' }}>
      <svg className="wipe-die" width="96" height="96" viewBox="0 0 48 48">
        <rect x="3" y="3" width="42" height="42" rx="10" fill="#0E0D0B" />
        <g fill="#FFC72C">
          <circle cx="13" cy="13" r="3.6" />
          <circle cx="35" cy="13" r="3.6" />
          <circle cx="24" cy="24" r="3.6" />
          <circle cx="13" cy="35" r="3.6" />
          <circle cx="35" cy="35" r="3.6" />
        </g>
      </svg>
    </div>
  );
}

export default function App() {
  return (
    <>
      <SmoothScroll />
      <RouteWipe />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
