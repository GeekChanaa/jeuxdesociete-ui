import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { Check } from '../components/icons';
import { gsap, useGSAP } from '../lib/gsap';
import { useReveal } from '../lib/useReveal';

const PAWN = 'M9 50 C9 40 14 32 16 24 H24 C26 32 31 40 31 50 Z';

const ROWS: [string, string, string, string, boolean?][] = [
  ['Game library', 'Classics', 'Everything', 'Everything'],
  ['Private rooms', 'Join only', 'Host unlimited', 'Host unlimited'],
  ['Profiles', '1', '1', 'Up to 5'],
  ['Stats & rankings', '—', 'Included', 'Included'],
  ['Ads', 'Between games', 'None', 'None'],
  ['Kids mode', '—', '—', 'Included'],
  ['Shop discount', '—', '—', '[X]% off', true],
];

const FAQ = [
  ['Can I play without paying?', 'Yes. Guest is free — join any room your friends open.'],
  ['Do my friends need a plan too?', 'No. One Player can host a room and invite guests.'],
  ['Can I cancel any time?', 'Yes, from your account. Your plan stays active until the end of the period.'],
  ['Do I need to install anything?', 'No. It runs in your browser on phone, tablet and desktop.'],
];

export default function Pricing() {
  const root = useRef<HTMLDivElement>(null);
  const [yearly, setYearly] = useState(false);
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 })
          .from('.pr-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8 })
          .from('.plan', { y: 140, rotation: (i) => [-6, 0, 6][i], autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: 'back.out(1.3)', clearProps: 'rotation' }, '-=0.4')
          .from('.plan-feat li', { x: -20, autoAlpha: 0, stagger: 0.03, duration: 0.4 }, '-=0.4')
          .from('.our-pick', { scale: 0, rotation: -40, duration: 0.5, ease: 'back.out(3)' }, '-=0.2');

        // The comparison table fills row by row as it scrolls through
        gsap.from('.cmp tbody tr', {
          x: -60,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.cmp', start: 'top 80%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Slide the billing pill and flip the prices when the period changes
  useGSAP(
    () => {
      gsap.to('.bill-pill', { x: yearly ? 124 : 0, width: yearly ? 236 : 120, duration: 0.45, ease: 'back.out(1.6)' });
      gsap.fromTo('.price-flip', { rotationX: -90, autoAlpha: 0 }, { rotationX: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)', transformPerspective: 400, stagger: 0.08 });
    },
    { scope: root, dependencies: [yearly] },
  );

  const period = yearly ? '/ year' : '/ month';

  return (
    <div ref={root} className="page grid-bg" style={{ paddingBottom: 120 }}>
      <Nav />
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header className="pr-head" style={{ maxWidth: 900, padding: '72px 0 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <span className="mono" style={{ fontSize: 13, color: '#FFC72C' }}>
            Plans
          </span>
          <h1 className="disp" style={{ margin: 0, fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 1 }}>
            Pick your seat at the table.
          </h1>
          <p style={{ margin: 0, fontSize: 20, color: '#B9B1A0', maxWidth: 620 }}>Play free with friends, or unlock every game. Cancel any time.</p>
          <div
            role="group"
            aria-label="Billing period"
            style={{
                position: 'relative',
                display: 'flex',
                padding: 5,
                background: '#1A1814',
                border: '2px solid #3A352C',
                borderRadius: 16,
                gap: 4,
                marginTop: 8,
            }}
          >
            <span className="bill-pill" aria-hidden="true" style={{ position: 'absolute', left: 5, top: 5, height: 46, width: 120, background: '#FFC72C', border: '2px solid #0E0D0B', borderRadius: 12 }} />
            <button type="button" onClick={() => setYearly(false)} aria-pressed={!yearly} style={{ position: 'relative', width: 120, height: 46, border: 'none', background: 'transparent', color: yearly ? '#D8CFBC' : '#0E0D0B', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'color .3s' }}>
              Monthly
            </button>
            <button type="button" onClick={() => setYearly(true)} aria-pressed={yearly} style={{ position: 'relative', width: 236, height: 46, border: 'none', background: 'transparent', color: yearly ? '#0E0D0B' : '#D8CFBC', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'color .3s' }}>
              Yearly
              <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 99, background: '#2EC4B6', color: '#0E0D0B' }}>[X] months free</span>
            </button>
          </div>
        </header>

        <div style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'stretch' }}>
          {/* Guest */}
          <div className="plan panel" style={{ borderRadius: 26, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: '#F4EBD6', border: '2px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="32" viewBox="0 0 40 56" aria-hidden="true">
                  <g fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="3.5" strokeLinejoin="round">
                    <circle cx="20" cy="12" r="9" />
                    <path d={PAWN} />
                    <rect x="5" y="46" width="30" height="9" rx="4.5" />
                  </g>
                </svg>
              </span>
              <h2 className="disp" style={{ margin: 0, fontSize: 28 }}>
                Guest
              </h2>
            </div>
            <div>
              <span className="disp" style={{ fontSize: 56 }}>
                €0
              </span>
              <span style={{ color: '#B9B1A0', fontSize: 17 }}> forever</span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: '#B9B1A0' }}>For joining friends and trying the classics.</p>
            <Link to="/register" className="btn btn-ghost" style={{ height: 54, fontSize: 17, background: 'transparent' }}>
              Start free
            </Link>
            <ul className="plan-feat" style={{ listStyle: 'none', margin: 0, padding: '16px 0 0', borderTop: '1px dashed #3A352C', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 16 }}>
              {["Join friends' private rooms", 'Classic card games', 'Phone, tablet or desktop'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 10 }}>
                  <Check />
                  {t}
                </li>
              ))}
              <li style={{ display: 'flex', gap: 10, color: '#8F887A' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8F887A" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M7 12 H17" />
                </svg>
                Ad-supported
              </li>
            </ul>
          </div>

          {/* Player */}
          <div className="plan" style={{ background: '#FFC72C', color: '#0E0D0B', border: '3px solid #0E0D0B', borderRadius: 26, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 12px 0 #F4EBD6', marginTop: -16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: '#0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="32" viewBox="0 0 40 56" aria-hidden="true">
                    <g fill="#FFC72C" stroke="#0E0D0B" strokeWidth="3.5" strokeLinejoin="round">
                      <circle cx="20" cy="12" r="9" />
                      <path d={PAWN} />
                      <rect x="5" y="46" width="30" height="9" rx="4.5" />
                    </g>
                  </svg>
                </span>
                <h2 className="disp" style={{ margin: 0, fontSize: 28 }}>
                  Player
                </h2>
              </div>
              <span className="our-pick" style={{ fontSize: 13, fontWeight: 800, padding: '6px 12px', background: '#0E0D0B', color: '#FFC72C', borderRadius: 999 }}>
                Our pick
              </span>
            </div>
            <div>
              <span className="disp price-flip" style={{ fontSize: 56, display: 'inline-block' }}>
                [PRICE]
              </span>
              <span style={{ fontSize: 17, color: '#3A2E10' }}> {period}</span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: '#3A2E10' }}>For regulars who host the table.</p>
            <Link to="/lobby" className="btn btn-dark" style={{ height: 54, fontSize: 17 }}>
              Take a seat
            </Link>
            <ul className="plan-feat" style={{ listStyle: 'none', margin: 0, padding: '16px 0 0', borderTop: '1px dashed #6B5200', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 16, fontWeight: 600 }}>
              {['Every game in the library', 'Unlimited private rooms', 'Stats, rankings & history', 'No ads, ever'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 10 }}>
                  <Check color="#0E0D0B" width={2.8} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Family */}
          <div className="plan panel" style={{ borderRadius: 26, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: '#9B8CFF', border: '2px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="34" height="30" viewBox="0 0 64 56" aria-hidden="true">
                  <g stroke="#0E0D0B" strokeWidth="3.5" strokeLinejoin="round">
                    <g fill="#F4EBD6">
                      <circle cx="18" cy="14" r="8" />
                      <path d="M8 50 C8 41 12 34 14 26 H22 C24 34 28 41 28 50 Z" />
                    </g>
                    <g fill="#FFC72C">
                      <circle cx="44" cy="20" r="7" />
                      <path d="M36 50 C36 43 39 37 41 31 H47 C49 37 52 43 52 50 Z" />
                    </g>
                  </g>
                </svg>
              </span>
              <h2 className="disp" style={{ margin: 0, fontSize: 28 }}>
                Family
              </h2>
            </div>
            <div>
              <span className="disp price-flip" style={{ fontSize: 56, display: 'inline-block' }}>
                [PRICE]
              </span>
              <span style={{ color: '#B9B1A0', fontSize: 17 }}> {period}</span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: '#B9B1A0' }}>For the whole house, from kids to grandparents.</p>
            <Link to="/register" className="btn btn-ghost" style={{ height: 54, fontSize: 17, background: 'transparent' }}>
              Choose Family
            </Link>
            <ul className="plan-feat" style={{ listStyle: 'none', margin: 0, padding: '16px 0 0', borderTop: '1px dashed #3A352C', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 16 }}>
              {['Everything in Player', 'Up to 5 profiles', 'Kids mode with simple rules', '[X]% off in the shop'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 10 }}>
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* comparison */}
        <section style={{ width: '100%', maxWidth: 1200, marginTop: 88, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 data-reveal="left" className="disp" style={{ margin: 0, fontSize: 36 }}>
            Compare the plans
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="cmp" style={{ position: 'relative', width: '100%', minWidth: 640, borderCollapse: 'separate', borderSpacing: 0, background: '#1A1814', border: '2px solid #3A352C', borderRadius: 20, overflow: 'hidden', fontSize: 16 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th scope="col" style={{ padding: '18px 24px', fontWeight: 700, color: '#8F887A', borderBottom: '2px solid #2C2923' }}>
                    Feature
                  </th>
                  <th scope="col" style={{ padding: '18px 24px', borderBottom: '2px solid #2C2923' }}>
                    Guest
                  </th>
                  <th scope="col" style={{ padding: '18px 24px', borderBottom: '2px solid #2C2923', background: '#FFC72C', color: '#0E0D0B' }}>
                    Player
                  </th>
                  <th scope="col" style={{ padding: '18px 24px', borderBottom: '2px solid #2C2923' }}>
                    Family
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([f, g, p, fam, last], i) => {
                  const bb = i === ROWS.length - 1 ? 'none' : '1px solid #2C2923';
                  const dim = (v: string) => (v === '—' ? '#8F887A' : undefined);
                  return (
                    <tr key={f}>
                      <th scope="row" style={{ textAlign: 'left', padding: '16px 24px', fontWeight: 600, borderBottom: bb }}>
                        {f}
                      </th>
                      <td style={{ padding: '16px 24px', borderBottom: bb, color: dim(g) ?? '#B9B1A0' }}>{g}</td>
                      <td style={{ padding: '16px 24px', borderBottom: bb, background: '#2A2415', fontWeight: p === '—' ? 400 : 700, color: dim(p) }}>
                        {p}
                      </td>
                      <td style={{ padding: '16px 24px', borderBottom: bb, color: last ? undefined : dim(fam) }}>{fam}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ width: '100%', maxWidth: 1200, marginTop: 72, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 data-reveal="left" className="disp" style={{ margin: 0, fontSize: 36 }}>
            Before you sit down
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {FAQ.map(([q, a]) => (
              <div key={q} data-reveal="pop" className="panel lift" style={{ borderRadius: 18, padding: '22px 24px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>{q}</h3>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: '#B9B1A0' }}>{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
