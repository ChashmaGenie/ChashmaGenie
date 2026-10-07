const LENS_SHAPES = {
  round: <circle cx="11.5" cy="10" r="8" />,
  square: <rect x="3" y="3" width="17" height="15" rx="2.5" />,
  rectangle: <rect x="2.5" y="5" width="19" height="11" rx="2" />,
  oval: <ellipse cx="11.5" cy="10" rx="9.5" ry="7" />,
  cat_eye: <path d="M2 3.5 L21 6.5 L20 15 Q11 18.5 4 14.5 Z" />,
  aviator: <path d="M2 4 H21 Q21.5 17 11.5 17.5 Q2 16 2 4 Z" />,
  geometric: <polygon points="6,3 17,3 21,10 17,17 6,17 2,10" />,
  browline: <path d="M2 3.5 H21 V9 Q21 17 11.5 17 Q2 17 2 9 Z" />,
  wayfarer: <path d="M2 5.5 Q2 3 4.5 3 H20 Q21.5 3 21 5.5 L19.5 14.5 Q19 17 16.5 17 H6.5 Q4.5 17 4 14.5 Z" />,
};

export function ShapeIcon({ shape, className = "h-5 w-10" }) {
  const lens = LENS_SHAPES[shape];
  if (!lens) return null;
  return (
    <svg viewBox="0 0 48 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className={className}>
      <g>{lens}</g>
      <path d="M21.5 8 Q24 6 26.5 8" />
      <g transform="translate(48 0) scale(-1 1)">{lens}</g>
    </svg>
  );
}
