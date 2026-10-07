const LENS_PATHS = {
  round: <circle cx="13" cy="12" r="10" />,
  square: <rect x="3" y="3" width="20" height="18" rx="3" />,
  rectangle: <rect x="2" y="5" width="22" height="14" rx="2" />,
  oval: <ellipse cx="13" cy="12" rx="11" ry="8" />,
  cat_eye: <path d="M3 6 L23 4 Q25 15 17 19 Q7 21 4 14 Z" />,
  aviator: <path d="M2 5 H24 Q24 20 13 20 Q2 20 2 5 Z" />,
  geometric: <path d="M8 3 H18 L24 12 L18 21 H8 L2 12 Z" />,
  browline: <path d="M3 7 V12 Q3 20 13 20 Q23 20 23 12 V7 M2 4 H24" />,
  wayfarer: <path d="M2 5 H24 L22 17 Q21 20 17 20 H9 Q5 20 4 17 Z" />,
};

export function ShapeIcon({ shape, className }) {
  const lens = LENS_PATHS[shape];
  if (!lens) return null;
  return (
    <svg viewBox="0 0 62 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" className={className}>
      <g>{lens}</g>
      <path d="M26 10 Q31 6 36 10" />
      <g transform="translate(36 0)">{lens}</g>
    </svg>
  );
}
