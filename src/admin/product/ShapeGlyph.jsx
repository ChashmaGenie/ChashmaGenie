const LENS_BY_SHAPE = {
  round: <circle cx="17" cy="14" r="11" />,
  square: <rect x="6" y="4" width="22" height="20" rx="3" />,
  rectangle: <rect x="5" y="7" width="24" height="15" rx="2" />,
  oval: <ellipse cx="17" cy="14" rx="12" ry="9" />,
  cat_eye: <path d="M5 10 Q5 5 10 6 L29 4 Q30 14 26 20 Q20 25 11 22 Q5 19 5 10Z" />,
  aviator: <path d="M5 6 Q17 3 29 6 Q29 17 24 22 Q17 27 10 22 Q5 17 5 6Z" />,
  geometric: <polygon points="11,4 23,4 30,14 23,24 11,24 4,14" />,
  browline: <path d="M4 6 L30 6 L30 17 Q28 24 17 24 Q6 24 4 17Z" />,
  wayfarer: <path d="M4 6 L30 6 Q30 20 24 23 Q16 26 8 22 Q4 18 4 6Z" />,
};

export function ShapeGlyph({ shape }) {
  const lens = LENS_BY_SHAPE[shape];
  return (
    <svg viewBox="0 0 64 28" width="64" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
      <g>{lens}</g>
      <g transform="translate(64 0) scale(-1 1)">{lens}</g>
      <path d="M29 11 Q32 8 35 11" />
    </svg>
  );
}
