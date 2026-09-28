import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { SPADE } from '../components/icons';
import { gsap, useGSAP } from '../lib/gsap';
import { useReveal } from '../lib/useReveal';

const ITEMS = [
  { name: 'Ronda deck', meta: '40 Spanish-suited cards · 2–4 players', tag: 'Cards', mark: 'R', bg: '#FFC72C', front: '#F4EBD6', top: '#FFE08A', side: '#B58300' },
  { name: 'Belote & Tarot double deck', meta: '32 + 78 cards · 3–5 players', tag: 'Cards', mark: 'B', bg: '#FFC72C', front: '#0E0D0B', top: '#FFE08A', side: '#3A2E10' },
  { name: 'Folding wooden chess set', meta: 'Board + 32 pieces · 2 players', tag: 'Board', mark: 'C', bg: '#2EC4B6', front: '#B07A3A', top: '#E3B77A', side: '#7A4E1C' },
  { name: 'Backgammon travel case', meta: 'Case, checkers & dice · 2 players', tag: 'Board', mark: 'BG', bg: '#FF6F59', front: '#8A2A1C', top: '#F4EBD6', side: '#5A1E14' },
  { name: 'Big-box dice & tokens kit', meta: 'Dice, pawns & play money', tag: 'Dice', mark: '5', bg: '#9B8CFF', front: '#0E0D0B', top: '#FFC72C', side: '#3B2F7A' },
  { name: 'Classic dominoes set', meta: '28 tiles · 2–4 players', tag: 'Dice', mark: 'D', bg: '#F4EBD6', front: '#2EC4B6', top: '#F4EBD6', side: '#134E48' },
];

export default function Shop() {
  const root = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLButtonElement>(null);
  const [bag, setBag] = useState(0);
  const [players, setPlayers] = useState('2–4');
  useReveal(root);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });
        tl.from('.banner', { y: 80, scale: 0.94, autoAlpha: 0, duration: 0.8 })
          .from('.banner-copy > *', { x: -40, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, '-=0.4')
          .from('.banner-box', { y: -260, autoAlpha: 0, stagger: 0.2, duration: 1, ease: 'bounce.out' }, '-=0.5')
          .from('.banner-spade', { scale: 0, rotation: -180, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(3)' }, '-=0.3');

        // Boxes float gently; the banner art drifts as you scroll past
        gsap.to('.banner-box', { y: -8, repeat: -1, yoyo: true, duration: 1.6, ease: 'sine.inOut', stagger: 0.5, delay: 2 });
        gsap.to('.banner-art', { y: 60, rotation: 4, ease: 'none', scrollTrigger: { trigger: '.banner', start: 'top top', end: 'bottom top', scrub: 1 } });

        // Product art tilts with scroll for a subtle parallax
        gsap.utils.toArray<HTMLElement>('.prod-art').forEach((el) => {
          gsap.fromTo(el, { y: 20, rotation: -3 }, { y: -20, rotation: 3, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Fly a token from the product into the bag, then bump the bag.
  const addToBag = contextSafe((e: React.MouseEvent<HTMLButtonElement>, color: string) => {
    const bagEl = bagRef.current;
    if (!bagEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBag((n) => n + 1);
      return;
    }
    const from = e.currentTarget.getBoundingClientRect();
    const to = bagEl.getBoundingClientRect();
    const token = document.createElement('div');
    Object.assign(token.style, {
      position: 'fixed',
      left: `${from.left + from.width / 2 - 16}px`,
      top: `${from.top + from.height / 2 - 16}px`,
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      background: color,
      border: '3px solid #0E0D0B',
      zIndex: '100',
      pointerEvents: 'none',
    });
    document.body.appendChild(token);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    gsap
      .timeline({ onComplete: () => token.remove() })
      .to(token, { x: dx, duration: 0.7, ease: 'power1.inOut' })
      .to(token, { y: dy, duration: 0.7, ease: 'back.in(2.5)', rotation: 540 }, 0)
      .to(token, { scale: 0.3, autoAlpha: 0, duration: 0.15 }, 0.6)
      .add(() => setBag((n) => n + 1), 0.65)
      .fromTo(bagEl, { scale: 1 }, { scale: 1.18, rotation: -6, yoyo: true, repeat: 1, duration: 0.14, ease: 'power2.out', clearProps: 'transform' }, 0.65);
  });

  const bagButton = (
    <button ref={bagRef} type="button" aria-label={`Bag, ${bag} items`} className="btn btn-yellow" style={{ height: 46, padding: '0 18px', fontSize: 16, gap: 8 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0D0B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8 H18 L17 20 H7 Z M9 8 V6.5 A3 3 0 0 1 15 6.5 V8" />
      </svg>
      Bag · {bag}
    </button>
  );

  return (
    <div ref={root} className="page grid-bg" style={{ paddingBottom: 96 }}>
      <Nav right={bagButton} />
      <div className="container" style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* featured banner */}
        <div className="banner" style={{ position: 'relative', minHeight: 240, background: '#FFC72C', color: '#0E0D0B', border: '3px solid #0E0D0B', borderRadius: 28, boxShadow: '0 10px 0 #D49A00', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', overflow: 'hidden' }}>
          <div className="banner-copy" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620 }}>
            <span className="mono" style={{ fontSize: 12 }}>
              The shop
            </span>
            <h1 className="disp" style={{ margin: 0, fontSize: 'clamp(40px, 5vw, 56px)', lineHeight: 1 }}>
              Game night, delivered.
            </h1>
            <p style={{ margin: 0, fontSize: 18, color: '#3A2E10' }}>Hand-picked decks, boards and big boxes. Free delivery over [AMOUNT].</p>
          </div>
          <svg className="banner-art" width="420" height="220" viewBox="0 0 420 220" aria-hidden="true" style={{ overflow: 'visible', maxWidth: '100%' }}>
            <g className="banner-box" stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
              <polygon points="40,110 80,86 200,86 160,110" fill="#F4EBD6" />
              <polygon points="160,110 200,86 200,176 160,200" fill="#5A1E14" />
              <rect x="40" y="110" width="120" height="90" fill="#FF6F59" />
              <path className="banner-spade" transform="translate(80,136) scale(2)" d={SPADE} fill="#0E0D0B" strokeWidth="0" />
            </g>
            <g className="banner-box">
              <g stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
                <polygon points="180,80 230,50 360,50 310,80" fill="#FFE08A" />
                <polygon points="310,80 360,50 360,160 310,190" fill="#3B2F7A" />
                <rect x="180" y="80" width="130" height="110" fill="#0E0D0B" />
                <rect x="220" y="110" width="50" height="50" rx="10" fill="#F4EBD6" />
              </g>
              <g fill="#0E0D0B">
                <circle cx="233" cy="123" r="5" />
                <circle cx="257" cy="147" r="5" />
                <circle cx="245" cy="135" r="5" />
              </g>
            </g>
          </svg>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
          {/* filters */}
          <aside aria-label="Filters" data-reveal="left" style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '0 0 260px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h2 className="mono" style={{ margin: '0 0 6px', fontSize: 12, color: '#8F887A' }}>
                Category
              </h2>
              {[
                ['Card decks', true],
                ['Board games', true],
                ['Dice & tokens', true],
                ['Accessories', false],
              ].map(([l, c]) => (
                <label key={l as string} className="check-label" style={{ color: '#F4EBD6', fontSize: 16, minHeight: 40 }}>
                  <input type="checkbox" defaultChecked={c as boolean} />
                  {l}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 className="mono" style={{ margin: 0, fontSize: 12, color: '#8F887A' }}>
                Players
              </h2>
              <div role="group" aria-label="Players" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['2', '2–4', '5+'].map((p) => {
                  const on = p === players;
                  return (
                    <button key={p} type="button" className="chip" aria-pressed={on} onClick={() => setPlayers(p)} style={{ height: 40, padding: '0 14px', fontSize: 14, border: `2px solid ${on ? '#0E0D0B' : '#3A352C'}`, background: on ? '#FFC72C' : 'transparent', color: on ? '#0E0D0B' : '#F4EBD6' }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ background: '#1A1814', border: '2px dashed #3A352C', borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <strong style={{ fontSize: 16 }}>Family plan perk</strong>
              <span style={{ fontSize: 14, color: '#B9B1A0' }}>Members get [X]% off every box.</span>
              <Link to="/pricing" className="more-link" style={{ fontSize: 14 }}>
                See plans <span className="arr">→</span>
              </Link>
            </div>
          </aside>

          {/* products */}
          <div style={{ flex: '1 1 600px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {ITEMS.map((p) => (
              <article key={p.name} data-reveal="up" className="panel lift" style={{ borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 200, background: p.bg, borderBottom: '2px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <span className="mono" style={{ position: 'absolute', left: 12, top: 12, fontSize: 10, padding: '4px 8px', background: '#0E0D0B', color: '#F4EBD6', borderRadius: 6, zIndex: 1 }}>
                    {p.tag}
                  </span>
                  <svg className="prod-art" width="200" height="170" viewBox="0 0 240 200" aria-hidden="true">
                    <ellipse cx="128" cy="180" rx="92" ry="12" fill="#0E0D0B" opacity="0.2" />
                    <g stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
                      <polygon points="40,80 90,50 210,50 160,80" fill={p.top} />
                      <polygon points="160,80 210,50 210,140 160,170" fill={p.side} />
                      <rect x="40" y="80" width="120" height="90" fill={p.front} />
                      <rect x="62" y="100" width="76" height="50" rx="10" fill="#F4EBD6" />
                    </g>
                    <text x="100" y="135" textAnchor="middle" fontFamily="Archivo" fontWeight="900" fontStyle="italic" fontSize="24" fill="#0E0D0B">
                      {p.mark}
                    </text>
                  </svg>
                </div>
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{p.name}</h3>
                  <span style={{ fontSize: 14, color: '#B9B1A0' }}>{p.meta}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 'auto' }}>
                    <span className="disp" style={{ fontSize: 22, color: '#FFC72C' }}>
                      [PRICE]
                    </span>
                    <button type="button" className="btn btn-cream" onClick={(e) => addToBag(e, p.bg)} style={{ height: 44, padding: '0 16px', fontSize: 15, borderRadius: 12 }}>
                      Add to bag
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
