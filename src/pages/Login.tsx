import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DieMark, DIAMOND, HEART, PawnShape } from '../components/icons';
import { gsap, useGSAP } from '../lib/gsap';

const PATH = 'M-10 250 H300 A90 90 0 0 0 390 160 V60';

export default function Login() {
  const root = useRef<HTMLDivElement>(null);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.split-left', { xPercent: -100, duration: 0.9, ease: 'power4.out' })
          .from('.li-brand', { y: -30, autoAlpha: 0, duration: 0.5 }, '-=0.3')
          .from('.li-word', { yPercent: 110, autoAlpha: 0, rotation: 6, stagger: 0.05, duration: 0.6, ease: 'back.out(2)' }, '-=0.2')
          .from('.li-sub', { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.3')
          .from('.li-track', { x: -420, duration: 1, ease: 'power3.out' }, '-=0.4')
          .from('.li-card-a', { rotation: -60, x: -160, autoAlpha: 0, svgOrigin: '138 107', duration: 0.8, ease: 'back.out(1.5)' }, '-=0.8')
          .from('.li-card-b', { rotation: 60, y: -160, autoAlpha: 0, svgOrigin: '218 97', duration: 0.8, ease: 'back.out(1.5)' }, '<0.1')
          .from('.li-die', { y: -240, rotation: 200, autoAlpha: 0, duration: 1, ease: 'bounce.out' }, '<0.1')
          .from('.li-form > *', { x: 60, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.4);

        // The violet pawn travels along the track, forever
        gsap.to('.li-pawn', {
          motionPath: { path: '.li-track-path', align: '.li-track-path', alignOrigin: [0.5, 0.9] },
          duration: 6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 1.4,
        });
        gsap.to('.li-card-a', { rotation: '-=4', svgOrigin: '138 107', repeat: -1, yoyo: true, duration: 2.2, ease: 'sine.inOut', delay: 2 });
        gsap.to('.li-card-b', { rotation: '+=4', svgOrigin: '218 97', repeat: -1, yoyo: true, duration: 2.6, ease: 'sine.inOut', delay: 2 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="split" style={{ overflow: 'hidden' }}>
      {/* left: brand panel */}
      <div className="split-left" style={{ justifyContent: 'space-between', gap: 32 }}>
        <Link to="/" className="brand li-brand" aria-label="jeuxdesociete home" style={{ color: '#0E0D0B' }}>
          <DieMark inverse className="die" />
          <span className="disp" style={{ fontSize: 26, lineHeight: 1 }}>
            jeuxdesociete
          </span>
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 className="disp" style={{ margin: 0, fontSize: 'clamp(40px, 4.5vw, 58px)', lineHeight: 1, overflow: 'hidden', paddingBottom: 4 }}>
            {'Your friends are already shuffling.'.split(' ').map((w, i) => (
              <span key={i} className="li-word" style={{ display: 'inline-block', marginRight: '0.22em' }}>
                {w}
              </span>
            ))}
          </h1>
          <p className="li-sub" style={{ margin: 0, fontSize: 19, lineHeight: 1.5, color: '#3A2E10', maxWidth: 440 }}>
            Log in and pick up right where you left the table.
          </p>
        </div>
        <svg width="528" height="300" viewBox="0 0 528 300" aria-hidden="true" style={{ display: 'block', maxWidth: '100%', height: 'auto', overflow: 'visible' }}>
          <g className="li-track" fill="none">
            <path className="li-track-path" d={PATH} stroke="#0E0D0B" strokeWidth="72" />
            <path d={PATH} stroke="#F4EBD6" strokeWidth="62" />
            <path d={PATH} stroke="#0E0D0B" strokeWidth="62" strokeDasharray="2.5 58" />
          </g>
          <g stroke="#0E0D0B" strokeWidth="2">
            <rect x="52" y="222" width="57" height="12" fill="#FF6F59" />
            <rect x="172" y="222" width="57" height="12" fill="#2EC4B6" />
          </g>
          <g className="li-card-a">
            <g stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
              <rect x="90" y="40" width="96" height="134" rx="12" fill="#F4EBD6" transform="rotate(-14 138 107)" />
            </g>
            <text x="104" y="76" fontFamily="Archivo" fontWeight="900" fontSize="22" fill="#0E0D0B" transform="rotate(-14 138 107)">
              7
            </text>
            <path transform="translate(114,86) scale(2.4) rotate(-14 10 10)" d={HEART} fill="#FF6F59" stroke="#0E0D0B" strokeWidth="1" />
          </g>
          <g className="li-card-b">
            <rect x="170" y="30" width="96" height="134" rx="12" fill="#0E0D0B" stroke="#0E0D0B" strokeWidth="3" transform="rotate(8 218 97)" />
            <g transform="rotate(8 218 97)">
              <rect x="180" y="40" width="76" height="114" rx="6" fill="none" stroke="#FFC72C" strokeWidth="2" />
              <circle cx="218" cy="97" r="20" fill="#FFC72C" />
              <path transform="translate(208,87) scale(1)" d={DIAMOND} fill="#0E0D0B" />
            </g>
          </g>
          <g className="li-die">
            <g transform="translate(410,120) rotate(16)" stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
              <rect x="6" y="7" width="64" height="64" rx="15" fill="#C9BC9C" />
              <rect x="0" y="0" width="64" height="64" rx="15" fill="#FFFFFF" />
              <circle cx="18" cy="18" r="5.5" fill="#0E0D0B" stroke="none" />
              <circle cx="46" cy="46" r="5.5" fill="#0E0D0B" stroke="none" />
            </g>
          </g>
          <g className="li-pawn">
            <PawnShape fill="#9B8CFF" />
          </g>
        </svg>
      </div>

      {/* right: form */}
      <div className="split-right grid-bg">
        <form
          className="li-form"
          style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/lobby');
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 className="disp" style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>
              Welcome back.
            </h2>
            <p style={{ margin: 0, fontSize: 17, color: '#B9B1A0' }}>Your seat is still warm.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <button type="button" className="social-btn">
              Continue with Google
            </button>
            <button type="button" className="social-btn">
              Continue with Apple
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#8F887A' }}>
            <span style={{ flexGrow: 1, height: 1, background: '#2C2923' }} />
            <span className="mono" style={{ fontSize: 11 }}>
              or with email
            </span>
            <span style={{ flexGrow: 1, height: 1, background: '#2C2923' }} />
          </div>
          <div className="field">
            <label htmlFor="li-email">Email</label>
            <input id="li-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label htmlFor="li-pw">Password</label>
              <a href="#" style={{ fontSize: 14, fontWeight: 700 }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input id="li-pw" className="input" type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" style={{ paddingRight: 60 }} />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 5, top: 5, width: 44, height: 44, background: 'transparent', border: 'none', borderRadius: 10, color: '#B9B1A0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12 C4.5 7 8 5 12 5 C16 5 19.5 7 22 12 C19.5 17 16 19 12 19 C8 19 4.5 17 2 12 Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPw && <path d="M4 4 L20 20" />}
                </svg>
              </button>
            </div>
          </div>
          <label className="check-label">
            <input type="checkbox" defaultChecked />
            Keep me at the table on this device
          </label>
          <button type="submit" className="btn btn-yellow" style={{ height: 58, fontSize: 18, borderRadius: 16, boxShadow: '0 6px 0 #D49A00' }}>
            Log in
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 15, color: '#B9B1A0', paddingTop: 6 }}>
            <span>
              New here?{' '}
              <Link to="/register" style={{ fontWeight: 800 }}>
                Create an account
              </Link>
            </span>
            <Link to="/lobby" className="more-link" style={{ fontWeight: 700, color: '#D8CFBC' }}>
              Play as guest <span className="arr">→</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
