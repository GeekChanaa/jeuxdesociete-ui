import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

/** The die-with-pawn brand mark. `inverse` = ink die with yellow pips (for yellow grounds). */
export function DieMark({ size = 40, inverse = false, strokeW = 3, ...rest }: Omit<P, "stroke"> & { size?: number; inverse?: boolean; strokeW?: number }) {
  const face = inverse ? '#0E0D0B' : '#FFC72C';
  const side = inverse ? '#3A2E10' : '#D49A00';
  const pip = inverse ? '#FFC72C' : '#0E0D0B';
  const outline = inverse ? undefined : '#0E0D0B';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" {...rest}>
      <rect x="7" y="7" width="38" height="38" rx="10" fill={side} stroke={outline} strokeWidth={outline ? strokeW : 0} />
      <rect x="3" y="3" width="38" height="38" rx="10" fill={face} stroke={outline} strokeWidth={outline ? strokeW : 0} />
      <g fill={pip}>
        <circle cx="11.5" cy="11.5" r="3" />
        <circle cx="32.5" cy="11.5" r="3" />
        <circle cx="11.5" cy="32.5" r="3" />
        <circle cx="32.5" cy="32.5" r="3" />
        <circle cx="22" cy="16.5" r="3.6" />
        <path d="M17 30 C17 26 19.2 23 20.3 20.5 H23.7 C24.8 23 27 26 27 30 Z" />
        <rect x="16.5" y="28.5" width="11" height="3.6" rx="1.8" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = 26, mono = false }: { size?: number; mono?: boolean }) {
  return (
    <span className="disp" style={{ fontSize: size, lineHeight: 1 }}>
      {mono ? (
        'jeuxdesociete'
      ) : (
        <>
          <span style={{ color: '#FFC72C' }}>jeux</span>
          <span style={{ color: '#F4EBD6' }}>desociete</span>
        </>
      )}
    </span>
  );
}

/** Pawn paths in a 40×56 box, for use inside an <svg> or <g>. */
export function PawnShape({ fill, stroke = '#0E0D0B', strokeWidth = 3 }: { fill: string; stroke?: string; strokeWidth?: number }) {
  return (
    <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
      <circle cx="20" cy="12" r="9" />
      <path d="M9 50 C9 40 14 32 16 24 H24 C26 32 31 40 31 50 Z" />
      <rect x="12" y="20" width="16" height="6" rx="3" />
      <rect x="5" y="46" width="30" height="9" rx="4.5" />
    </g>
  );
}

export function Pawn({ fill, width = 40, height = 56, strokeWidth = 3, ...rest }: P & { fill: string; strokeWidth?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 40 56" aria-hidden="true" {...rest}>
      <PawnShape fill={fill} strokeWidth={strokeWidth} />
    </svg>
  );
}

export const HEART = 'M10 17 C3 12 1 8.5 1 6 C1 3.2 3.2 1 6 1 C7.8 1 9.2 2 10 3.4 C10.8 2 12.2 1 14 1 C16.8 1 19 3.2 19 6 C19 8.5 17 12 10 17 Z';
export const SPADE = 'M10 1 C13 5 19 8 19 12 C19 14.8 16.8 16.5 14.5 16.5 C13 16.5 11.8 15.8 11 14.8 L12 19 H8 L9 14.8 C8.2 15.8 7 16.5 5.5 16.5 C3.2 16.5 1 14.8 1 12 C1 8 7 5 10 1 Z';
export const DIAMOND = 'M10 1 L18 10 L10 19 L2 10 Z';

export function Check({ color = '#2EC4B6', width = 2.6, size = 22 }: { color?: string; width?: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M5 12.5 L10 17 L19 7" />
    </svg>
  );
}

export function Arrow({ color = '#0E0D0B', size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12 H19 M13 6 L19 12 L13 18" />
    </svg>
  );
}
