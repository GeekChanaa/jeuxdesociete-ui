import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { Arrow, DIAMOND, DieMark, HEART, PawnShape, SPADE, Wordmark } from '../components/icons';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { useReveal } from '../lib/useReveal';

const W = 1440;
const H = 3800;

// The winding board the page is laid on (canvas coordinates, 1440 wide).
const TRACK =
  'M -80 830 C -17 824, 170 793, 300 796 C 430 799, 573 849, 700 850 C 827 851, 960 795, 1060 800 C 1160 805, 1254 837, 1300 880 C 1346 923, 1363 1012, 1335 1060 C 1307 1108, 1186 1127, 1130 1170 C 1074 1213, 1062 1281, 1000 1320 C 938 1359, 857 1396, 760 1405 C 663 1414, 513 1368, 420 1375 C 327 1382, 245 1404, 200 1450 C 155 1496, 133 1583, 150 1650 C 167 1717, 222 1804, 300 1850 C 378 1896, 503 1914, 620 1925 C 737 1936, 887 1904, 1000 1915 C 1113 1926, 1258 1945, 1300 1990 C 1342 2035, 1303 2133, 1255 2185 C 1207 2237, 1069 2257, 1010 2300 C 951 2343, 982 2424, 900 2445 C 818 2466, 627 2416, 520 2425 C 413 2434, 319 2458, 260 2500 C 201 2542, 162 2617, 165 2680 C 168 2743, 204 2829, 280 2880 C 356 2931, 500 2971, 620 2985 C 740 2999, 890 2955, 1000 2965 C 1110 2975, 1233 3032, 1280 3045';

const TRACK_START_Y = 800;
const TRACK_END_Y = 3045;
/** Where on screen the walking pawn sits while you scroll (fraction of viewport height). */
const PLAYHEAD = '62%';

const STOPS = [
  { n: '01', x: 1335, y: 1060 },
  { n: '02', x: 150, y: 1650 },
  { n: '03', x: 1300, y: 1990 },
  { n: '04', x: 165, y: 2680 },
];
const CHANCE = [
  { x: 1060, y: 813 },
  { x: 760, y: 1418 },
  { x: 1010, y: 2313 },
];

export default function Home() {
  const outer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);

  // The artboard is a fixed 1440px composition: scale it to fit narrower windows.
  useLayoutEffect(() => {
    const fit = () => {
      const s = Math.min(1, window.innerWidth / W);
      scaleRef.current = s;
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useLayoutEffect(() => {
    ScrollTrigger.refresh();
  }, [scale]);

  useReveal(outer);

  /** A ScrollTrigger position for canvas y-coordinate `y`, hitting the playhead line. */
  const at = (y: number, line = PLAYHEAD) => () => `top+=${y * scaleRef.current} ${line}`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // ---------- HERO INTRO ----------
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });
        intro
          .from('.hero-chip', { y: -30, autoAlpha: 0, duration: 0.6 })
          .from('.hero-die', { scale: 0, rotation: -260, duration: 1, ease: 'back.out(1.6)' }, '<0.1')
          .from('.hero-ch', { yPercent: 120, rotation: 12, autoAlpha: 0, stagger: 0.035, duration: 0.7, ease: 'back.out(2)' }, '<0.2')
          .from('.hero-copy', { y: 30, autoAlpha: 0, duration: 0.7 }, '-=0.3')
          .from('.hero-cta > *', { y: 30, scale: 0.8, autoAlpha: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(2)' }, '-=0.4')
          .from('.hero-note', { autoAlpha: 0, duration: 0.6 }, '-=0.2')
          .from('.fan-card', { rotation: 0, y: 80, autoAlpha: 0, svgOrigin: '140 260', stagger: 0.12, duration: 0.9, ease: 'back.out(1.4)' }, 0.5)
          .from('.hero-dice', { y: -300, rotation: 200, autoAlpha: 0, duration: 1.1, ease: 'bounce.out' }, 0.7)
          .from('.hero-pawn', { y: -200, autoAlpha: 0, duration: 0.9, ease: 'bounce.out' }, 0.9)
          .from('.hero-chip-coin', { x: -200, rotation: -360, autoAlpha: 0, duration: 1, ease: 'power2.out' }, 1)
          .from('.follow', { y: 20, autoAlpha: 0, duration: 0.6 }, '-=0.3');

        gsap.to('.follow-arrow', { y: 8, repeat: -1, yoyo: true, duration: 0.6, ease: 'sine.inOut' });
        gsap.to('.hero-die', { rotation: -2, repeat: -1, yoyo: true, duration: 1.8, ease: 'sine.inOut', delay: 1.4 });

        // Hero parallax on scroll-out
        const heroScroll = { trigger: canvas.current, start: 'top top', end: () => `+=${700 * scaleRef.current}`, scrub: 0.8 };
        gsap.to('.hero-center', { y: -140, autoAlpha: 0.1, ease: 'none', scrollTrigger: heroScroll });
        gsap.to('.hero-fan', { y: -260, rotation: -16, ease: 'none', scrollTrigger: heroScroll });
        gsap.to('.hero-toys', { y: -340, rotation: 18, ease: 'none', scrollTrigger: heroScroll });

        // ---------- THE BOARD DRAWS ITSELF, THE PAWN WALKS IT ----------
        const maskPath = document.querySelector<SVGPathElement>('#track-mask-path')!;
        const walker = document.querySelector<SVGGElement>('#walker')!;
        const len = maskPath.getTotalLength();

        // Map a canvas y to a distance along the track (the track winds sideways,
        // so use the running max of y to keep the mapping monotonic).
        const N = 800;
        const ys: number[] = [];
        let maxY = -Infinity;
        for (let i = 0; i <= N; i++) {
          maxY = Math.max(maxY, maskPath.getPointAtLength((len * i) / N).y);
          ys.push(maxY);
        }
        const lengthAtY = (y: number) => {
          let lo = 0;
          let hi = N;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (ys[mid] < y) lo = mid + 1;
            else hi = mid;
          }
          return (len * lo) / N;
        };
        const startLen = lengthAtY(0) + 380; // where the pawn stands at GO (≈ x 300)

        const place = (l: number) => {
          const p = maskPath.getPointAtLength(l);
          const wobble = Math.sin(l / 22) * 7;
          const hop = Math.abs(Math.sin(l / 22)) * -8;
          walker.setAttribute('transform', `translate(${p.x - 20} ${p.y - 50 + hop}) rotate(${wobble} 20 50)`);
          maskPath.style.strokeDashoffset = String(len - l);
        };
        maskPath.style.strokeDasharray = String(len);
        place(startLen);

        const walk = { y: TRACK_START_Y };
        gsap.to(walk, {
          y: TRACK_END_Y,
          ease: 'none',
          onUpdate: () => place(Math.max(startLen, lengthAtY(walk.y))),
          scrollTrigger: {
            trigger: canvas.current,
            start: at(TRACK_START_Y),
            end: at(TRACK_END_Y),
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        // Numbered stops & chance squares pop as the pawn arrives
        gsap.utils.toArray<SVGGElement>('.stop').forEach((el, i) => {
          gsap.from(el, {
            scale: 0,
            rotation: -180,
            transformOrigin: '50% 50%',
            duration: 0.7,
            ease: 'back.out(2.2)',
            scrollTrigger: { trigger: canvas.current, start: at(STOPS[i].y - 40), toggleActions: 'play none none reverse' },
          });
        });
        gsap.utils.toArray<SVGTextElement>('.chance').forEach((el, i) => {
          gsap.fromTo(
            el,
            { scale: 1, transformOrigin: '50% 60%' },
            {
              scale: 1.8,
              rotation: 360,
              yoyo: true,
              repeat: 1,
              duration: 0.45,
              ease: 'power2.out',
              scrollTrigger: { trigger: canvas.current, start: at(CHANCE[i].y), toggleActions: 'restart none none none' },
            },
          );
        });
        gsap.from('.finish', {
          scale: 0,
          rotation: 540,
          transformOrigin: '50% 50%',
          duration: 1,
          ease: 'back.out(1.8)',
          scrollTrigger: { trigger: canvas.current, start: at(TRACK_END_Y - 60), toggleActions: 'play none none reverse' },
        });

        // Other pawns bob in place; loose pieces drift with parallax
        gsap.to('.idle-pawn', { y: -10, repeat: -1, yoyo: true, duration: 0.9, ease: 'sine.inOut', stagger: 0.4 });
        gsap.utils.toArray<SVGGElement>('.loose').forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: 120, rotation: i % 2 ? -25 : 25 },
            {
              y: -120,
              rotation: i % 2 ? 20 : -20,
              ease: 'none',
              transformOrigin: '50% 50%',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
            },
          );
        });

        // ---------- STOP 01: game tiles deal in ----------
        gsap.from('.game-tile', {
          rotationY: 90,
          y: 40,
          scale: 0.7,
          autoAlpha: 0,
          transformPerspective: 700,
          stagger: { each: 0.12, from: 'start' },
          duration: 0.8,
          ease: 'back.out(1.6)',
          clearProps: 'transform',
          scrollTrigger: { trigger: '.stop-1', start: 'top 75%' },
        });

        // ---------- STOP 02: players sit down, cards are dealt ----------
        const room = gsap.timeline({ scrollTrigger: { trigger: '.stop-2', start: 'top 72%' } });
        room
          .from('.room-card', { x: 220, rotation: 14, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
          .from('.room-table', { scale: 0.3, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(1.6)' }, '-=0.3')
          .from('.room-player', { scale: 0, transformOrigin: '50% 50%', stagger: 0.12, duration: 0.5, ease: 'back.out(2.5)' }, '-=0.2')
          .from('.room-deal', { y: 90, x: 0, rotation: 0, autoAlpha: 0, transformOrigin: '50% 50%', stagger: 0.15, duration: 0.5, ease: 'power2.out' })
          .from('.room-turn', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(3)' });
        gsap.to('.room-turn', { scale: 1.08, transformOrigin: '50% 50%', repeat: -1, yoyo: true, duration: 0.7, ease: 'sine.inOut', delay: 2 });

        // ---------- STOP 03: the boxes drop in ----------
        const shop = gsap.timeline({ scrollTrigger: { trigger: '.stop-3', start: 'top 72%' } });
        shop
          .from('.shop-frame', { scale: 0.6, rotation: -12, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.8)' })
          .from('.shop-box', { y: -220, autoAlpha: 0, stagger: 0.18, duration: 0.9, ease: 'bounce.out' }, '-=0.2')
          .from('.shop-tag', { scale: 3, rotation: -30, autoAlpha: 0, duration: 0.45, ease: 'power4.in' }, '-=0.2')
          .to('.shop-frame', { x: -6, repeat: 3, yoyo: true, duration: 0.05 })
          .set('.shop-frame', { clearProps: 'transform' });

        // ---------- STOP 04: plan rows slide into place ----------
        gsap.from('.plan-row', {
          x: 260,
          autoAlpha: 0,
          stagger: 0.14,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: '.stop-4', start: 'top 72%' },
        });

        // ---------- CTA ----------
        const cta = gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 80%' } });
        cta
          .from('.cta', { scale: 0.85, y: 80, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
          .from('.cta-word', { yPercent: 110, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: 'back.out(2)' }, '-=0.5')
          .from('.cta-card-l', { rotation: -60, x: -200, autoAlpha: 0, svgOrigin: '125 240', duration: 0.8, ease: 'back.out(1.4)' }, '-=0.6')
          .from('.cta-card-r', { rotation: 60, x: 200, autoAlpha: 0, svgOrigin: '215 240', duration: 0.8, ease: 'back.out(1.4)' }, '<0.1');
        gsap.to('.cta-cards', {
          y: -40,
          rotation: 4,
          ease: 'none',
          scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });

      return () => mm.revert();
    },
    { scope: outer },
  );

  const letters = (word: string, color: string) =>
    word.split('').map((c, i) => (
      <span key={word + i} className="hero-ch" style={{ display: 'inline-block', color }}>
        {c}
      </span>
    ));

  return (
    <>
      <Nav />
      <div ref={outer} className="canvas-outer grid-bg" style={{ height: H * scale }}>
        <div ref={canvas} className="canvas" style={{ height: H, transform: `translateX(-50%) scale(${scale})` }}>
          {/* ============ THE BOARD TRACK ============ */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ left: 0, top: 0 }} aria-hidden="true">
            <defs>
              <pattern id="chk" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#F4EBD6" />
                <rect width="8" height="8" fill="#0E0D0B" />
                <rect x="8" y="8" width="8" height="8" fill="#0E0D0B" />
              </pattern>
              <mask id="track-mask" maskUnits="userSpaceOnUse" x="-200" y="0" width="1840" height={H}>
                <path id="track-mask-path" d={TRACK} fill="none" stroke="#fff" strokeWidth="120" />
              </mask>
            </defs>

            {/* faint ghost of the whole route, so the path ahead is hinted */}
            <path d={TRACK} fill="none" stroke="#F4EBD6" strokeOpacity="0.06" strokeWidth="90" strokeDasharray="4 14" />

            <g mask="url(#track-mask)">
              <g fill="none" strokeLinejoin="round">
                <path d={TRACK} stroke="#F4EBD6" strokeWidth="90" />
                <path d={TRACK} stroke="#0E0D0B" strokeWidth="82" />
                <path d={TRACK} stroke="#F4EBD6" strokeWidth="74" />
                <path d={TRACK} stroke="#FFC72C" strokeWidth="58" strokeDasharray="68 729.5" strokeDashoffset="-76" />
                <path d={TRACK} stroke="#FF6F59" strokeWidth="58" strokeDasharray="68 729.5" strokeDashoffset="-293.5" />
                <path d={TRACK} stroke="#2EC4B6" strokeWidth="58" strokeDasharray="68 729.5" strokeDashoffset="-511" />
                <path d={TRACK} stroke="#9B8CFF" strokeWidth="58" strokeDasharray="68 729.5" strokeDashoffset="-656" />
                <path d={TRACK} stroke="#0E0D0B" strokeWidth="74" strokeDasharray="2.5 70" />
              </g>
              <text x="40" y="830" fontSize="22" fontFamily="Archivo, sans-serif" fontWeight="900" fontStyle="italic" fill="#0E0D0B" textAnchor="middle">
                GO
              </text>
            </g>

            <g fontFamily="Archivo, sans-serif" fontWeight="900" fontStyle="italic" fill="#0E0D0B" textAnchor="middle">
              {CHANCE.map((c) => (
                <text key={c.x} className="chance" x={c.x} y={c.y} fontSize="34">
                  ?
                </text>
              ))}
            </g>

            <g transform="translate(600,1878)">
              <g className="idle-pawn">
                <PawnShape fill="#FF6F59" />
              </g>
            </g>
            <g transform="translate(600,2938)">
              <g className="idle-pawn">
                <PawnShape fill="#2EC4B6" />
              </g>
            </g>
            <g transform="translate(497,2400) rotate(-12 24 24)" stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
              <rect x="5" y="6" width="42" height="42" rx="10" fill="#C9BC9C" />
              <rect x="1" y="1" width="42" height="42" rx="10" fill="#FFFFFF" />
              <circle cx="12" cy="12" r="3.6" fill="#0E0D0B" stroke="none" />
              <circle cx="22" cy="22" r="3.6" fill="#0E0D0B" stroke="none" />
              <circle cx="32" cy="32" r="3.6" fill="#0E0D0B" stroke="none" />
            </g>

            <g fontFamily="Archivo, sans-serif" fontWeight="900" fontStyle="italic" fontSize="28" textAnchor="middle">
              {STOPS.map((s) => (
                <g key={s.n} className="stop">
                  <circle cx={s.x} cy={s.y} r="46" fill="#0E0D0B" stroke="#F4EBD6" strokeWidth="5" />
                  <circle cx={s.x} cy={s.y} r="36" fill="none" stroke="#FFC72C" strokeWidth="2" strokeDasharray="4 5" />
                  <text x={s.x} y={s.y + 10} fill="#F4EBD6">
                    {s.n}
                  </text>
                </g>
              ))}
            </g>
            <circle className="finish" cx="1280" cy="3045" r="48" fill="url(#chk)" stroke="#F4EBD6" strokeWidth="5" />

            {/* loose pieces in the open spaces */}
            <g className="loose">
              <g transform="translate(905,960) rotate(-10 40 56)" stroke="#0E0D0B" strokeWidth="3">
                <rect width="80" height="112" rx="10" fill="#F4EBD6" />
                <text x="12" y="28" fontFamily="Archivo" fontWeight="900" fontSize="20" fill="#E0462F" stroke="none">
                  Q
                </text>
                <path transform="translate(22,38) scale(1.8)" d={DIAMOND} fill="#FF6F59" strokeWidth="1.4" />
              </g>
            </g>
            <g className="loose">
              <g transform="translate(300,1560)">
                <ellipse cx="40" cy="46" rx="38" ry="13" fill="#3B2F7A" stroke="#0E0D0B" strokeWidth="3" />
                <rect x="2" y="33" width="76" height="13" fill="#3B2F7A" />
                <ellipse cx="40" cy="33" rx="38" ry="13" fill="#9B8CFF" stroke="#0E0D0B" strokeWidth="3" />
                <ellipse cx="40" cy="33" rx="25" ry="8" fill="none" stroke="#F4EBD6" strokeWidth="2.5" strokeDasharray="5 4" />
              </g>
            </g>
            <g className="loose">
              <g transform="translate(960,2050) rotate(14 34 34)" stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
                <rect x="6" y="7" width="60" height="60" rx="14" fill="#B58300" />
                <rect x="0" y="0" width="60" height="60" rx="14" fill="#FFC72C" />
                <circle cx="16" cy="16" r="5" fill="#0E0D0B" stroke="none" />
                <circle cx="44" cy="16" r="5" fill="#0E0D0B" stroke="none" />
                <circle cx="16" cy="44" r="5" fill="#0E0D0B" stroke="none" />
                <circle cx="44" cy="44" r="5" fill="#0E0D0B" stroke="none" />
              </g>
            </g>
            <g className="loose">
              <g transform="translate(340,2590) rotate(12 40 56)" stroke="#0E0D0B" strokeWidth="3">
                <rect width="80" height="112" rx="10" fill="#0E0D0B" stroke="#F4EBD6" />
                <rect x="9" y="9" width="62" height="94" rx="6" fill="none" stroke="#FFC72C" strokeWidth="2" />
                <circle cx="40" cy="56" r="14" fill="#FFC72C" stroke="none" />
              </g>
            </g>

            {/* you: the pawn that walks the board as you scroll */}
            <g id="walker" transform="translate(280,748)">
              <ellipse cx="20" cy="56" rx="16" ry="4" fill="#0E0D0B" opacity="0.35" />
              <PawnShape fill="#FFC72C" />
            </g>
          </svg>

          {/* ============ HERO ============ */}
          <div className="hero-center" style={{ left: 200, top: 150, width: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, textAlign: 'center' }}>
            <div className="mono hero-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', border: '2px solid #3A352C', borderRadius: 999, fontSize: 13, color: '#B9B1A0' }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#2EC4B6' }} />
              Card games · Board games · Party games
            </div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 22 }}>
              <DieMark size={104} strokeW={2} className="hero-die" style={{ transform: 'rotate(-8deg)' }} />
              <span className="disp" style={{ fontSize: 88, lineHeight: 1, textShadow: '0 7px 0 #3A2E10', overflow: 'hidden', paddingBottom: 10 }}>
                <span className="sr-only">jeuxdesociete</span>
                <span aria-hidden="true">
                  {letters('jeux', '#FFC72C')}
                  {letters('desociete', '#F4EBD6')}
                </span>
              </span>
            </h1>
            <p className="hero-copy" style={{ margin: 0, maxWidth: 640, fontSize: 22, lineHeight: 1.5, color: '#D8CFBC' }}>
              The friendliest table in town. Play classic card and board games online with your friends — then take your favourites home.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Link to="/register" className="btn btn-yellow" style={{ height: 60, padding: '0 30px', fontSize: 19, borderRadius: 16, boxShadow: '0 6px 0 #D49A00' }}>
                Play free now
                <Arrow />
              </Link>
              <Link to="/shop" className="btn btn-ghost" style={{ height: 60, padding: '0 28px', fontSize: 19, fontWeight: 700, borderRadius: 16 }}>
                Visit the shop
              </Link>
            </div>
            <div className="hero-note" style={{ fontSize: 14, color: '#8F887A' }}>
              No download · Phone, tablet or desktop · Invite friends with a link
            </div>
          </div>

          {/* hero: card fan */}
          <svg className="hero-fan" width="330" height="300" viewBox="0 0 330 300" style={{ left: 50, top: 400 }} aria-hidden="true">
            <g className="fan-card">
              <g transform="rotate(-20 140 260)">
                <rect x="80" y="80" width="120" height="168" rx="12" fill="#FFC72C" stroke="#0E0D0B" strokeWidth="3" />
                <rect x="92" y="92" width="96" height="144" rx="7" fill="none" stroke="#0E0D0B" strokeWidth="2" />
                <path d="M92 120 L188 216 M92 150 L158 216 M92 180 L128 216 M122 92 L188 158 M152 92 L188 128" stroke="#0E0D0B" strokeWidth="2" opacity="0.35" />
              </g>
            </g>
            <g className="fan-card">
              <g transform="rotate(-4 140 260)">
                <rect x="90" y="70" width="120" height="168" rx="12" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="3" />
                <text x="104" y="102" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="24" fill="#0E0D0B">
                  K
                </text>
                <path transform="translate(120,124) scale(3)" d={SPADE} fill="#0E0D0B" />
              </g>
            </g>
            <g className="fan-card">
              <g transform="rotate(12 140 260)">
                <rect x="100" y="64" width="120" height="168" rx="12" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="3" />
                <text x="114" y="96" fontFamily="Archivo, sans-serif" fontWeight="900" fontSize="24" fill="#E0462F">
                  A
                </text>
                <path transform="translate(130,122) scale(3)" d={HEART} fill="#FF6F59" stroke="#0E0D0B" strokeWidth="0.8" />
              </g>
            </g>
          </svg>

          {/* hero: dice, pawn, chip */}
          <svg className="hero-toys" width="300" height="320" viewBox="0 0 300 320" style={{ left: 1100, top: 380, overflow: 'visible' }} aria-hidden="true">
            <g className="hero-dice">
              <g transform="rotate(14 90 100)" stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
                <rect x="46" y="56" width="100" height="100" rx="22" fill="#C9BC9C" />
                <rect x="36" y="44" width="100" height="100" rx="22" fill="#FFFFFF" />
                <circle cx="62" cy="70" r="8" fill="#0E0D0B" stroke="none" />
                <circle cx="110" cy="70" r="8" fill="#0E0D0B" stroke="none" />
                <circle cx="86" cy="94" r="8" fill="#0E0D0B" stroke="none" />
                <circle cx="62" cy="118" r="8" fill="#0E0D0B" stroke="none" />
                <circle cx="110" cy="118" r="8" fill="#0E0D0B" stroke="none" />
              </g>
            </g>
            <g className="hero-pawn">
              <g transform="translate(176,120) scale(1.9)">
                <PawnShape fill="#9B8CFF" strokeWidth={2} />
              </g>
            </g>
            <g className="hero-chip-coin">
              <g transform="translate(40,210)">
                <ellipse cx="50" cy="56" rx="48" ry="16" fill="#8A2A1C" stroke="#0E0D0B" strokeWidth="3" />
                <rect x="2" y="40" width="96" height="16" fill="#8A2A1C" />
                <ellipse cx="50" cy="40" rx="48" ry="16" fill="#FF6F59" stroke="#0E0D0B" strokeWidth="3" />
                <ellipse cx="50" cy="40" rx="32" ry="10" fill="none" stroke="#F4EBD6" strokeWidth="3" strokeDasharray="6 5" />
                <path d="M2 40 V56 M98 40 V56" stroke="#0E0D0B" strokeWidth="3" />
              </g>
            </g>
          </svg>

          <div className="mono follow" style={{ left: 0, top: 690, width: W, textAlign: 'center', fontSize: 13, color: '#8F887A' }}>
            Follow the board <span className="follow-arrow" style={{ display: 'inline-block' }}>↓</span>
          </div>

          {/* ============ STOP 01 · GAMES ============ */}
          <section className="stop-1" style={{ left: 190, top: 960, width: 600, display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 260, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, transform: 'rotate(-2deg)' }}>
              <Link to="/lobby" className="game-tile" style={{ background: '#FFC72C', boxShadow: '0 5px 0 #D49A00' }}>
                <svg width="34" height="40" viewBox="0 0 34 40" aria-hidden="true">
                  <rect x="2" y="2" width="30" height="36" rx="5" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="2.5" />
                  <path transform="translate(9,12) scale(0.8)" d={SPADE} fill="#0E0D0B" />
                </svg>
                Cards
              </Link>
              <Link to="/lobby" className="game-tile" style={{ background: '#2EC4B6', boxShadow: '0 5px 0 #177A70' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                  <rect x="2" y="2" width="36" height="36" rx="5" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="2.5" />
                  <g fill="#0E0D0B">
                    <rect x="2" y="2" width="9" height="9" />
                    <rect x="20" y="2" width="9" height="9" />
                    <rect x="11" y="11" width="9" height="9" />
                    <rect x="29" y="11" width="9" height="9" />
                    <rect x="2" y="20" width="9" height="9" />
                    <rect x="20" y="20" width="9" height="9" />
                    <rect x="11" y="29" width="9" height="9" />
                    <rect x="29" y="29" width="9" height="9" />
                  </g>
                </svg>
                Board
              </Link>
              <Link to="/lobby" className="game-tile" style={{ background: '#FF6F59', boxShadow: '0 5px 0 #A83A2A' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                  <rect x="2" y="2" width="36" height="36" rx="9" fill="#FFFFFF" stroke="#0E0D0B" strokeWidth="2.5" />
                  <g fill="#0E0D0B">
                    <circle cx="12" cy="12" r="3.5" />
                    <circle cx="28" cy="12" r="3.5" />
                    <circle cx="20" cy="20" r="3.5" />
                    <circle cx="12" cy="28" r="3.5" />
                    <circle cx="28" cy="28" r="3.5" />
                  </g>
                </svg>
                Dice &amp; trading
              </Link>
              <Link to="/lobby" className="game-tile" style={{ background: '#9B8CFF', boxShadow: '0 5px 0 #5B4BC4' }}>
                <svg width="44" height="38" viewBox="0 0 44 38" aria-hidden="true">
                  <path d="M2 2 H42 V26 H20 L10 36 V26 H2 Z" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="2.5" strokeLinejoin="round" />
                  <text x="22" y="20" textAnchor="middle" fontFamily="Archivo" fontWeight="900" fontStyle="italic" fontSize="14" fill="#0E0D0B">
                    ?!
                  </text>
                </svg>
                Party
              </Link>
            </div>
            <div className="stop-copy" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div data-reveal="left" className="mono" style={{ fontSize: 12, color: '#FFC72C' }}>
                Stop 01 · The games
              </div>
              <h2 data-reveal="left" className="disp">
                Pick a table.
              </h2>
              <p data-reveal="left">Belote, Ronda, chess, backgammon and the big boxes with dice and play money — rules built in.</p>
              <Link data-reveal="left" to="/lobby" className="more-link">
                Browse all games <span className="arr">→</span>
              </Link>
            </div>
          </section>

          {/* ============ STOP 02 · PLAY ONLINE ============ */}
          <section className="stop-2" style={{ left: 640, top: 1500, width: 600, display: 'flex', gap: 32, alignItems: 'center' }}>
            <div className="stop-copy" style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
              <div data-reveal="right" className="mono" style={{ fontSize: 12, color: '#FFC72C' }}>
                Stop 02 · Play online
              </div>
              <h2 data-reveal="right" className="disp">
                Deal in your friends.
              </h2>
              <p data-reveal="right">Open a private room, share a 6-letter code, and everyone's at the same table.</p>
              <Link data-reveal="right" to="/lobby" className="more-link">
                Open a room <span className="arr">→</span>
              </Link>
            </div>
            <div className="room-card" style={{ flexShrink: 0, width: 288, background: '#1A1814', border: '3px solid #F4EBD6', borderRadius: 20, boxShadow: '0 8px 0 #2EC4B6', overflow: 'hidden', transform: 'rotate(2deg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '2px solid #2C2923' }}>
                <span className="mono" style={{ fontSize: 10, color: '#FFC72C' }}>
                  Room · K7Q2XM
                </span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Belote</span>
              </div>
              <svg width="288" height="180" viewBox="0 0 288 180" role="img" aria-label="Four players around a card table" style={{ display: 'block' }}>
                <ellipse className="room-table" cx="144" cy="90" rx="112" ry="58" fill="#134E48" stroke="#F4EBD6" strokeWidth="3" />
                <g stroke="#0E0D0B" strokeWidth="2">
                  <g className="room-deal">
                    <rect x="118" y="68" width="28" height="40" rx="4" fill="#F4EBD6" transform="rotate(-12 132 88)" />
                  </g>
                  <g className="room-deal">
                    <rect x="142" y="66" width="28" height="40" rx="4" fill="#F4EBD6" transform="rotate(10 156 86)" />
                  </g>
                </g>
                <g stroke="#0E0D0B" strokeWidth="2.5" fontFamily="Archivo" fontWeight="900" fontSize="13" textAnchor="middle">
                  {[
                    { x: 144, y: 22, c: '#9B8CFF', l: 'N' },
                    { x: 30, y: 90, c: '#FF6F59', l: 'Y' },
                    { x: 258, y: 90, c: '#2EC4B6', l: 'L' },
                    { x: 144, y: 158, c: '#FFC72C', l: 'S', me: true },
                  ].map((p) => (
                    <g key={p.l} className="room-player">
                      <circle cx={p.x} cy={p.y} r="17" fill={p.c} stroke={p.me ? '#F4EBD6' : '#0E0D0B'} strokeWidth={p.me ? 3 : 2.5} />
                      <text x={p.x} y={p.y + 5} fill="#0E0D0B" stroke="none">
                        {p.l}
                      </text>
                    </g>
                  ))}
                </g>
                <g className="room-turn">
                  <rect x="170" y="146" width="74" height="24" rx="12" fill="#FFC72C" stroke="#0E0D0B" strokeWidth="2" />
                  <text x="207" y="162" textAnchor="middle" fontFamily="Figtree" fontWeight="800" fontSize="11" fill="#0E0D0B">
                    Your turn
                  </text>
                </g>
              </svg>
            </div>
          </section>

          {/* ============ STOP 03 · SHOP ============ */}
          <section className="stop-3" style={{ left: 190, top: 2060, width: 600, display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link to="/shop" aria-label="Visit the shop" className="shop-frame lift" style={{ flexShrink: 0, width: 260, height: 240, background: '#F4EBD6', border: '3px solid #0E0D0B', borderRadius: 20, boxShadow: '0 8px 0 #FF6F59', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', rotate: '-2deg' }}>
              <svg width="230" height="190" viewBox="0 0 240 200" aria-hidden="true" style={{ overflow: 'visible' }}>
                <ellipse cx="124" cy="182" rx="100" ry="10" fill="#0E0D0B" opacity="0.15" />
                <g className="shop-box" stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
                  <polygon points="20,110 50,92 150,92 120,110" fill="#F4EBD6" />
                  <polygon points="120,110 150,92 150,162 120,180" fill="#5A1E14" />
                  <rect x="20" y="110" width="100" height="70" fill="#FF6F59" />
                  <path transform="translate(50,130) scale(1.5)" d={HEART} fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="1.4" />
                </g>
                <g className="shop-box">
                  <g stroke="#0E0D0B" strokeWidth="3" strokeLinejoin="round">
                    <polygon points="100,70 136,48 226,48 190,70" fill="#FFE08A" />
                    <polygon points="190,70 226,48 226,140 190,162" fill="#3B2F7A" />
                    <rect x="100" y="70" width="90" height="92" fill="#0E0D0B" />
                    <rect x="125" y="96" width="40" height="40" rx="8" fill="#F4EBD6" />
                  </g>
                  <g fill="#0E0D0B">
                    <circle cx="135" cy="106" r="4" />
                    <circle cx="155" cy="126" r="4" />
                    <circle cx="145" cy="116" r="4" />
                  </g>
                </g>
              </svg>
              <span className="shop-tag" style={{ position: 'absolute', right: -14, top: 18, padding: '6px 12px', background: '#FFC72C', border: '2px solid #0E0D0B', borderRadius: 10, fontWeight: 800, fontSize: 13, color: '#0E0D0B', rotate: '8deg' }}>
                New in
              </span>
            </Link>
            <div className="stop-copy" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div data-reveal="left" className="mono" style={{ fontSize: 12, color: '#FFC72C' }}>
                Stop 03 · The shop
              </div>
              <h2 data-reveal="left" className="disp">
                Take it off the screen.
              </h2>
              <p data-reveal="left">Real decks, boards and big boxes — hand-picked for game night at home.</p>
              <Link data-reveal="left" to="/shop" className="more-link">
                Shop the games <span className="arr">→</span>
              </Link>
            </div>
          </section>

          {/* ============ STOP 04 · PLANS ============ */}
          <section className="stop-4" style={{ left: 640, top: 2540, width: 600, display: 'flex', gap: 32, alignItems: 'center' }}>
            <div className="stop-copy" style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 270 }}>
              <div data-reveal="right" className="mono" style={{ fontSize: 12, color: '#FFC72C' }}>
                Stop 04 · Your seat
              </div>
              <h2 data-reveal="right" className="disp">
                Pick your plan.
              </h2>
              <p data-reveal="right">Start free as a guest. Upgrade when you want to host every night.</p>
              <Link data-reveal="right" to="/pricing" className="more-link">
                Compare plans <span className="arr">→</span>
              </Link>
            </div>
            <div style={{ flexShrink: 0, width: 298, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/register" className="plan-row lift" style={{ height: 64, background: '#1A1814', border: '2px solid #3A352C', color: '#F4EBD6' }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Guest</span>
                <span className="disp" style={{ fontSize: 22 }}>
                  €0
                </span>
              </Link>
              <Link to="/register" className="plan-row lift" style={{ height: 76, background: '#FFC72C', border: '3px solid #0E0D0B', boxShadow: '0 6px 0 #F4EBD6', color: '#0E0D0B', marginLeft: -12, marginRight: 12 }}>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, fontSize: 17 }}>Player</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Our pick · every game</span>
                </span>
                <span className="disp" style={{ fontSize: 22 }}>
                  [PRICE]
                </span>
              </Link>
              <Link to="/register" className="plan-row lift" style={{ height: 64, background: '#1A1814', border: '2px solid #3A352C', color: '#F4EBD6' }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Family</span>
                <span className="disp" style={{ fontSize: 22 }}>
                  [PRICE]
                </span>
              </Link>
            </div>
          </section>

          {/* ============ CTA ============ */}
          <section className="cta" style={{ left: 80, top: 3160, width: 1280, height: 290, background: '#FFC72C', color: '#0E0D0B', border: '3px solid #0E0D0B', borderRadius: 32, boxShadow: '0 12px 0 #D49A00', padding: '0 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 640 }}>
              <h2 className="disp" style={{ margin: 0, fontSize: 64, lineHeight: 1, overflow: 'hidden', paddingBottom: 6 }}>
                {'Your seat is waiting.'.split(' ').map((w, i) => (
                  <span key={i} className="cta-word" style={{ display: 'inline-block', marginRight: '0.25em' }}>
                    {w}
                  </span>
                ))}
              </h2>
              <p style={{ margin: 0, fontSize: 19, color: '#3A2E10' }}>Create a free account in under a minute and invite your first table.</p>
              <div style={{ display: 'flex', gap: 14 }}>
                <Link to="/register" className="btn btn-dark" style={{ height: 56, padding: '0 28px', fontSize: 18 }}>
                  Create free account
                </Link>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', height: 56, padding: '0 20px', color: '#0E0D0B', fontWeight: 800, fontSize: 18 }}>
                  I have an account
                </Link>
              </div>
            </div>
            <svg className="cta-cards" width="360" height="260" viewBox="0 0 360 260" aria-hidden="true" style={{ overflow: 'visible' }}>
              <g className="cta-card-l">
                <rect x="60" y="40" width="130" height="182" rx="14" fill="#F4EBD6" stroke="#0E0D0B" strokeWidth="3" transform="rotate(-12 125 131)" />
                <text x="84" y="92" fontFamily="Archivo" fontWeight="900" fontSize="30" fill="#0E0D0B" transform="rotate(-12 125 131)">
                  Q
                </text>
                <path transform="translate(96,108) scale(3) rotate(-12 10 10)" d={DIAMOND} fill="#FF6F59" stroke="#0E0D0B" strokeWidth="1" />
              </g>
              <g className="cta-card-r">
                <rect x="150" y="30" width="130" height="182" rx="14" fill="#0E0D0B" stroke="#0E0D0B" strokeWidth="3" transform="rotate(10 215 121)" />
                <g transform="rotate(10 215 121)">
                  <rect x="164" y="44" width="102" height="154" rx="8" fill="none" stroke="#FFC72C" strokeWidth="2" />
                  <circle cx="215" cy="121" r="26" fill="#FFC72C" />
                  <circle cx="215" cy="112" r="6" fill="#0E0D0B" />
                  <path d="M206 132 C206 126 209 122 211 118 H219 C221 122 224 126 224 132 Z" fill="#0E0D0B" />
                </g>
              </g>
            </svg>
          </section>

          {/* ============ FOOTER ============ */}
          <footer style={{ left: 80, top: 3520, width: 1280, borderTop: '1px solid #2C2923', paddingTop: 44, display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32 }}>
              <div data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Wordmark size={28} />
                <p style={{ margin: 0, fontSize: 15, color: '#8F887A', maxWidth: 320 }}>Card games, board games and everything in between.</p>
              </div>
              {[
                { h: 'Play', l: [['All games', '/lobby'], ['Private rooms', '/lobby'], ['Plans', '/pricing']] },
                { h: 'Shop', l: [['Card decks', '/shop'], ['Board games', '/shop'], ['Accessories', '/shop']] },
                { h: 'Help', l: [['Game rules', '#'], ['Help centre', '#'], ['Contact', '#']] },
              ].map((col) => (
                <div key={col.h} data-reveal="up" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
                  <strong className="mono" style={{ fontSize: 12, color: '#8F887A' }}>
                    {col.h}
                  </strong>
                  {col.l.map(([label, to]) =>
                    to === '#' ? (
                      <a key={label} href="#" style={{ color: '#D8CFBC' }}>
                        {label}
                      </a>
                    ) : (
                      <Link key={label} to={to} style={{ color: '#D8CFBC' }}>
                        {label}
                      </Link>
                    ),
                  )}
                </div>
              ))}
            </div>
            <div data-reveal="fade" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#8F887A' }}>
              <span>© 2026 jeuxdesociete</span>
              <span>Terms · Privacy · English</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
