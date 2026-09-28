import { useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DieMark, HEART, Pawn, PawnShape, SPADE, Wordmark } from '../components/icons';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useReveal } from '../lib/useReveal';

type Cat = 'card' | 'board' | 'dice' | 'party';

const COLORS: Record<Cat, string> = { card: '#FFC72C', board: '#2EC4B6', dice: '#FF6F59', party: '#9B8CFF' };
const KINDS: Record<Cat, string> = { card: 'Cards', board: 'Board', dice: 'Dice', party: 'Party' };

const GAMES: { name: string; cat: Cat; players: string; time: string }[] = [
  { name: 'Belote', cat: 'card', players: '4', time: '20 min' },
  { name: 'Ronda', cat: 'card', players: '2–4', time: '15 min' },
  { name: 'Tarot', cat: 'card', players: '3–5', time: '30 min' },
  { name: 'Rummy', cat: 'card', players: '2–6', time: '20 min' },
  { name: 'Chess', cat: 'board', players: '2', time: '10–60 min' },
  { name: 'Checkers', cat: 'board', players: '2', time: '15 min' },
  { name: 'Backgammon', cat: 'board', players: '2', time: '20 min' },
  { name: 'Ludo', cat: 'board', players: '2–4', time: '30 min' },
  { name: 'Property trading', cat: 'dice', players: '2–6', time: '60+ min' },
  { name: 'Word guess', cat: 'party', players: '4–10', time: '15 min' },
];

const CHIPS: { id: 'all' | Cat; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'card', label: 'Cards' },
  { id: 'board', label: 'Board' },
  { id: 'dice', label: 'Dice' },
  { id: 'party', label: 'Party' },
];

function GameArt({ cat }: { cat: Cat }) {
  if (cat === 'card')
    return (
      <svg width="70" height="84" viewBox="0 0 70 84" aria-hidden="true">
        <rect x="3" y="3" width="64" height="78" rx="9" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="3" />
        <path transform="translate(17,24) scale(1.8)" d={SPADE} fill="#0E0D0B" />
      </svg>
    );
  if (cat === 'board')
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        <rect x="3" y="3" width="74" height="74" rx="8" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="3" />
        <g fill="#0E0D0B">
          {[
            [3, 3], [40, 3], [21.5, 21.5], [58.5, 21.5], [3, 40], [40, 40], [21.5, 58.5], [58.5, 58.5],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="18.5" height="18.5" />
          ))}
        </g>
      </svg>
    );
  if (cat === 'dice')
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        <g stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
          <rect x="12" y="13" width="62" height="62" rx="15" fill="#C9BC9C" />
          <rect x="5" y="5" width="62" height="62" rx="15" fill="#FFFFFF" />
        </g>
        <g fill="#0E0D0B">
          <circle cx="21" cy="21" r="6" />
          <circle cx="51" cy="21" r="6" />
          <circle cx="36" cy="36" r="6" />
          <circle cx="21" cy="51" r="6" />
          <circle cx="51" cy="51" r="6" />
        </g>
      </svg>
    );
  return (
    <svg width="90" height="76" viewBox="0 0 90 76" aria-hidden="true">
      <path d="M4 4 H86 V52 H40 L20 72 V52 H4 Z" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round" />
      <text x="45" y="38" textAnchor="middle" fontFamily="Archivo" fontWeight="900" fontStyle="italic" fontSize="26" fill="#0E0D0B">
        ?!
      </text>
    </svg>
  );
}

const inputBase: React.CSSProperties = { background: '#1A1814', border: '2px solid #3A352C', color: '#F4EBD6', fontFamily: 'Figtree', outline: 'none' };

export default function Lobby() {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | Cat>('all');
  const firstRun = useRef(true);
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.lb-nav', { yPercent: -100, duration: 0.7, ease: 'power3.out' });
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });
        tl.from('.greet-word', { yPercent: 110, rotation: 8, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'back.out(2)' })
          .from('.greet-sub', { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.3')
          .from('.join-box', { x: 120, autoAlpha: 0, duration: 0.8 }, 0.2)
          .from('.cont-card', { y: 60, rotation: (i) => (i - 1) * 4, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'back.out(1.6)', clearProps: 'transform' }, '-=0.4');
        gsap.to('.turn-badge', { scale: 1.07, repeat: -1, yoyo: true, duration: 0.6, ease: 'sine.inOut' });
        gsap.to('.notif-dot', { scale: 1.5, autoAlpha: 0.4, repeat: -1, yoyo: true, duration: 0.8 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Game cards: scroll-reveal on first load, deal-in again whenever the filter changes.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const cards = gsap.utils.toArray<HTMLElement>('.game-card');
      const from = { y: 60, scale: 0.85, rotation: () => gsap.utils.random(-8, 8), autoAlpha: 0 };
      const to = { y: 0, scale: 1, rotation: 0, autoAlpha: 1, stagger: 0.06, duration: 0.6, ease: 'back.out(1.6)', clearProps: 'transform' };
      if (firstRun.current) {
        firstRun.current = false;
        gsap.set(cards, from);
        ScrollTrigger.batch(cards, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, to) });
      } else {
        gsap.fromTo(cards, from, to);
      }
    },
    { scope: root, dependencies: [filter] },
  );

  const games = GAMES.filter((g) => filter === 'all' || g.cat === filter);

  return (
    <div ref={root} className="grid-bg" style={{ minHeight: '100vh', paddingBottom: 96 }}>
      <nav className="lb-nav nav" aria-label="Main" style={{ height: 80, padding: '0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link to="/" className="brand" aria-label="jeuxdesociete home">
            <DieMark size={38} className="die" />
            <Wordmark size={24} />
          </Link>
          <div className="nav-links" style={{ gap: 4, fontWeight: 700 }}>
            <NavLink to="/lobby">Lobby</NavLink>
            <a href="#">My rooms</a>
            <a href="#">Friends</a>
            <NavLink to="/shop">Shop</NavLink>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label htmlFor="lb-search" className="nav-links" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 14, display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F887A" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16 L20 20" />
              </svg>
            </span>
            <input id="lb-search" className="input" type="search" placeholder="Search games" aria-label="Search games" style={{ width: 240, height: 44, padding: '0 14px 0 40px', fontSize: 15, borderRadius: 12 }} />
          </label>
          <button type="button" aria-label="Notifications" style={{ ...inputBase, position: 'relative', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4EBD6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 16 V11 A6 6 0 0 1 18 11 V16 L20 18 H4 Z M10 21 H14" />
            </svg>
            <span className="notif-dot" style={{ position: 'absolute', top: 7, right: 8, width: 9, height: 9, borderRadius: 99, background: '#FF6F59', border: '2px solid #1A1814' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 4px 4px', border: '2px solid #3A352C', borderRadius: 999, background: '#1A1814' }}>
            <span style={{ width: 38, height: 38, borderRadius: 99, background: '#FFC72C', border: '2px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pawn fill="#0E0D0B" width={18} height={24} strokeWidth={0} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <strong style={{ fontSize: 15 }}>Sami</strong>
              <span style={{ fontSize: 12, color: '#FFC72C', fontWeight: 700 }}>Player plan</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* greeting + room actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))', gap: 32, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            <h1 className="disp" style={{ margin: 0, fontSize: 56, lineHeight: 1, overflow: 'hidden', paddingBottom: 4 }}>
              {'Good evening, Sami.'.split(' ').map((w, i) => (
                <span key={i} className="greet-word" style={{ display: 'inline-block', marginRight: '0.22em' }}>
                  {w}
                </span>
              ))}
            </h1>
            <p className="greet-sub" style={{ margin: 0, fontSize: 19, color: '#B9B1A0' }}>
              It's your turn in two games. The deck is shuffled.
            </p>
          </div>
          <div className="join-box panel" style={{ borderRadius: 22, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label htmlFor="lb-code" style={{ fontWeight: 800, fontSize: 16 }}>
              Join a friend's room
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input id="lb-code" type="text" placeholder="6-letter code" maxLength={6} className="input" style={{ flex: '1 1 160px', width: 'auto', height: 52, background: '#0E0D0B', color: '#FFC72C', fontFamily: 'Space Mono', fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase' }} />
              <button type="button" className="btn btn-cream" style={{ height: 52, padding: '0 20px', fontSize: 16, border: '3px solid #0E0D0B' }}>
                Join
              </button>
              <button type="button" className="btn btn-yellow" style={{ height: 52, padding: '0 20px', fontSize: 16, gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E0D0B" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5 V19 M5 12 H19" />
                </svg>
                New room
              </button>
            </div>
          </div>
        </div>

        {/* your turn */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 className="mono" style={{ margin: 0, fontSize: 13, color: '#FFC72C' }}>
            Continue playing
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div className="cont-card lift" style={{ background: '#F4EBD6', color: '#0E0D0B', border: '3px solid #0E0D0B', borderRadius: 20, padding: 20, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 7px 0 #FFC72C' }}>
              <span style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 16, background: '#FFC72C', border: '2px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true">
                  <path d={HEART} fill="#FF6F59" stroke="#0E0D0B" strokeWidth="1.4" />
                </svg>
              </span>
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ fontSize: 18 }}>Ronda</strong>
                <span style={{ fontSize: 14, color: '#4A443A' }}>vs Yanis · 24 – 19</span>
              </div>
              <a href="#" className="turn-badge" style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 16px', background: '#0E0D0B', color: '#FFC72C', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                Your turn
              </a>
            </div>
            <div className="cont-card lift" style={{ background: '#F4EBD6', color: '#0E0D0B', border: '3px solid #0E0D0B', borderRadius: 20, padding: 20, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 7px 0 #2EC4B6' }}>
              <span style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 16, background: '#2EC4B6', border: '2px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="38" viewBox="0 0 40 56" aria-hidden="true">
                  <PawnShape fill="#F4EBD6" />
                </svg>
              </span>
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ fontSize: 18 }}>Chess</strong>
                <span style={{ fontSize: 14, color: '#4A443A' }}>vs Léa · move 18</span>
              </div>
              <a href="#" className="turn-badge" style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 16px', background: '#0E0D0B', color: '#FFC72C', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                Your turn
              </a>
            </div>
            <div className="cont-card" style={{ background: '#1A1814', border: '2px dashed #3A352C', borderRadius: 20, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 16, background: '#2C2923', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
                  <rect x="3" y="3" width="42" height="42" rx="10" fill="#F4EBD6" />
                  <circle cx="13" cy="13" r="4" fill="#0E0D0B" />
                  <circle cx="35" cy="35" r="4" fill="#0E0D0B" />
                  <circle cx="24" cy="24" r="4" fill="#0E0D0B" />
                </svg>
              </span>
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ fontSize: 18 }}>Property trading</strong>
                <span style={{ fontSize: 14, color: '#B9B1A0' }}>Family room · waiting for Nora</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#8F887A' }}>Waiting</span>
            </div>
          </div>
        </section>

        {/* all games */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <h2 data-reveal="left" className="disp" style={{ margin: 0, fontSize: 36 }}>
              All games
            </h2>
            <div role="group" aria-label="Filter games" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CHIPS.map((c) => {
                const on = c.id === filter;
                return (
                  <button key={c.id} type="button" className="chip" onClick={() => setFilter(c.id)} aria-pressed={on} style={{ border: `2px solid ${on ? '#0E0D0B' : '#3A352C'}`, background: on ? '#FFC72C' : '#1A1814', color: on ? '#0E0D0B' : '#D8CFBC' }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {games.map((g) => (
              <article key={g.name} className="game-card lift" style={{ background: '#F4EBD6', color: '#0E0D0B', border: '3px solid #0E0D0B', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: `0 7px 0 ${COLORS[g.cat]}` }}>
                <div style={{ height: 118, background: COLORS[g.cat], borderBottom: '3px solid #0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span className="mono" style={{ position: 'absolute', left: 10, top: 10, fontSize: 10, padding: '3px 7px', background: '#0E0D0B', color: '#F4EBD6', borderRadius: 6 }}>
                    {KINDS[g.cat]}
                  </span>
                  <GameArt cat={g.cat} />
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 className="disp" style={{ margin: 0, fontSize: 20 }}>
                    {g.name}
                  </h3>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, fontWeight: 600, color: '#4A443A' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A443A" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <circle cx="9" cy="8" r="3.5" />
                        <path d="M2.5 20 C3 16 5.5 14 9 14 C12.5 14 15 16 15.5 20" />
                        <circle cx="17" cy="9" r="2.5" />
                      </svg>
                      {g.players}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A443A" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M12 7 V12 L15 14" />
                      </svg>
                      {g.time}
                    </span>
                  </div>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, background: '#0E0D0B', color: '#FFC72C', borderRadius: 12, fontWeight: 800, fontSize: 15, marginTop: 4 }}>
                    Play
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
