import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Arrow, Check, DieMark, PawnShape } from '../components/icons';
import { gsap, useGSAP } from '../lib/gsap';

const PIECES = [
  { id: 'yellow', label: 'Yellow piece', fill: '#FFC72C' },
  { id: 'coral', label: 'Coral piece', fill: '#FF6F59' },
  { id: 'teal', label: 'Teal piece', fill: '#2EC4B6' },
  { id: 'violet', label: 'Violet piece', fill: '#9B8CFF' },
  { id: 'cream', label: 'Cream piece', fill: '#F4EBD6' },
];

const STEPS = [
  ['Create your seat', 'Name, email and your game piece.'],
  ['Choose a plan', 'Start free — upgrade whenever you like.'],
  ['Invite your table', 'Send a link and deal the first hand.'],
];

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[^a-z]/i.test(pw) || /\d/.test(pw)) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  return s;
}
const STRENGTH = [
  { label: 'Too short', color: '#FF6F59' },
  { label: 'Weak move', color: '#FF6F59' },
  { label: 'Decent move', color: '#FFC72C' },
  { label: 'Strong move', color: '#2EC4B6' },
  { label: 'Winning move', color: '#2EC4B6' },
];

export default function Register() {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [piece, setPiece] = useState('yellow');
  const [pw, setPw] = useState('shuffle-and-deal');
  const score = strength(pw);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.split-left', { xPercent: -100, duration: 0.9, ease: 'power4.out' })
          .from('.rg-brand', { y: -30, autoAlpha: 0, duration: 0.5 }, '-=0.3')
          .from('.rg-word', { yPercent: 110, autoAlpha: 0, rotation: 6, stagger: 0.05, duration: 0.6, ease: 'back.out(2)' }, '-=0.2')
          .from('.rg-dot', { scale: 0, rotation: -180, stagger: 0.25, duration: 0.6, ease: 'back.out(2.5)' }, '-=0.1')
          .from('.rg-line', { scaleY: 0, transformOrigin: '50% 0%', stagger: 0.25, duration: 0.5, ease: 'power2.inOut' }, '<0.3')
          .from('.rg-step-copy', { x: -30, autoAlpha: 0, stagger: 0.25, duration: 0.5 }, '<')
          .from('.rg-form > *', { x: 60, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.4)
          .from('.piece', { y: -80, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'bounce.out' }, '-=0.6');
        gsap.to('.rg-dot-active', { boxShadow: '0 0 0 10px rgba(14,13,11,0)', repeat: -1, duration: 1.2, ease: 'power1.out', startAt: { boxShadow: '0 0 0 0 rgba(14,13,11,0.45)' } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const pick = contextSafe((id: string, el: HTMLElement) => {
    setPiece(id);
    gsap.fromTo(el.querySelector('svg'), { y: 0 }, { y: -18, rotation: 12, yoyo: true, repeat: 1, duration: 0.18, ease: 'power2.out', clearProps: 'transform' });
  });

  useGSAP(() => {
    gsap.to('.pw-bar', { backgroundColor: (i) => (i < score ? STRENGTH[score].color : '#2C2923'), scaleY: (i) => (i < score ? 1 : 0.6), duration: 0.3, stagger: 0.05 });
  }, { scope: root, dependencies: [score] });

  return (
    <div ref={root} className="split register" style={{ overflow: 'hidden' }}>
      {/* left: progress board */}
      <div className="split-left" style={{ gap: 56 }}>
        <Link to="/" className="brand rg-brand" aria-label="jeuxdesociete home" style={{ color: '#0E0D0B' }}>
          <DieMark inverse className="die" />
          <span className="disp" style={{ fontSize: 26, lineHeight: 1 }}>
            jeuxdesociete
          </span>
        </Link>
        <h1 className="disp" style={{ margin: 0, fontSize: 'clamp(38px, 4vw, 52px)', lineHeight: 1, overflow: 'hidden', paddingBottom: 4 }}>
          {'Three moves to your first game.'.split(' ').map((w, i) => (
            <span key={i} className="rg-word" style={{ display: 'inline-block', marginRight: '0.22em' }}>
              {w}
            </span>
          ))}
        </h1>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {STEPS.map(([title, sub], i) => (
            <li key={title} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className={`disp rg-dot${i === 0 ? ' rg-dot-active' : ''}`} style={{ width: 56, height: 56, borderRadius: 999, background: i === 0 ? '#0E0D0B' : '#F4EBD6', color: i === 0 ? '#FFC72C' : '#0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '3px solid #0E0D0B' }}>
                  0{i + 1}
                </span>
                {i < STEPS.length - 1 && <span className="rg-line" style={{ width: 10, height: 64, background: i === 0 ? '#0E0D0B' : 'repeating-linear-gradient(#0E0D0B 0 8px, transparent 8px 16px)' }} />}
              </div>
              <div className="rg-step-copy" style={{ paddingTop: 8 }}>
                <strong style={{ display: 'block', fontSize: 20 }}>{title}</strong>
                <span style={{ fontSize: 15, color: '#3A2E10' }}>{sub}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* right: form */}
      <div className="split-right grid-bg">
        <form
          className="rg-form"
          style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/pricing');
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="mono" style={{ fontSize: 12, color: '#FFC72C' }}>
              Step 1 of 3
            </span>
            <h2 className="disp" style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>
              Take a seat.
            </h2>
            <p style={{ margin: 0, fontSize: 17, color: '#B9B1A0' }}>Free forever. No card needed.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="field">
              <label htmlFor="rg-name">Player name</label>
              <input id="rg-name" className="input" type="text" autoComplete="nickname" defaultValue="Sami" />
            </div>
            <div className="field">
              <label htmlFor="rg-email">Email</label>
              <input id="rg-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="rg-pw">Password</label>
            <input id="rg-pw" className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6, flexGrow: 1 }}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="pw-bar" style={{ height: 8, borderRadius: 4, background: '#2C2923' }} />
                ))}
              </div>
              <span aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: STRENGTH[score].color, minWidth: 96, textAlign: 'right' }}>
                {STRENGTH[score].label}
              </span>
            </div>
          </div>
          <fieldset style={{ border: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <legend style={{ fontWeight: 700, fontSize: 15, padding: 0, marginBottom: 10 }}>Choose your piece</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10 }}>
              {PIECES.map((p) => {
                const sel = p.id === piece;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className="piece"
                    onClick={(e) => pick(p.id, e.currentTarget)}
                    aria-label={p.label}
                    aria-pressed={sel}
                    style={{ position: 'relative', height: 92, background: sel ? '#2C2923' : '#1A1814', border: `3px solid ${sel ? '#FFC72C' : '#3A352C'}`, borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: sel ? '0 5px 0 #D49A00' : 'none', transition: 'background .2s, border-color .2s, box-shadow .2s' }}
                  >
                    <svg width="40" height="56" viewBox="0 0 40 56" aria-hidden="true">
                      <PawnShape fill={p.fill} />
                    </svg>
                    {sel && (
                      <span style={{ position: 'absolute', top: -10, right: -10, width: 26, height: 26, borderRadius: 99, background: '#FFC72C', border: '2px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check color="#0E0D0B" width={3.4} size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 14, color: '#B9B1A0' }}>This is you on every board. You can change it later.</span>
          </fieldset>
          <label className="check-label">
            <input type="checkbox" />
            <span>
              I agree to the{' '}
              <a href="#" style={{ fontWeight: 700 }}>
                Terms
              </a>{' '}
              and{' '}
              <a href="#" style={{ fontWeight: 700 }}>
                Privacy policy
              </a>
            </span>
          </label>
          <button type="submit" className="btn btn-yellow" style={{ height: 58, fontSize: 18, borderRadius: 16, boxShadow: '0 6px 0 #D49A00' }}>
            Take my seat
            <Arrow size={20} />
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 15, color: '#B9B1A0' }}>
            <span>
              Already playing?{' '}
              <Link to="/login" style={{ fontWeight: 800 }}>
                Log in
              </Link>
            </span>
            <span>
              or{' '}
              <a href="#" style={{ fontWeight: 700, color: '#D8CFBC' }}>
                sign up with Google / Apple
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
