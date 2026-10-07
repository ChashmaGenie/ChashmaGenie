const LABEL = "fill-ink-800 text-[13px] font-semibold";
const DIMENSION_LINE = "stroke-sky-700";

function Measure({ x1, x2, y }) {
  return (
    <g className={DIMENSION_LINE} strokeWidth="2" fill="none">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} />
    </g>
  );
}

export function FitDiagram({ size }) {
  return (
    <svg viewBox="0 0 400 240" role="img" aria-labelledby="fit-title fit-desc" className="h-auto w-full max-w-md">
      <title id="fit-title">Frame measurements</title>
      <desc id="fit-desc">
        Front view of glasses showing lens width of {size.lens} millimetres and bridge width of {size.bridge} millimetres, and a side view showing temple length of {size.temple} millimetres.
      </desc>
      <g className="stroke-ink-800" strokeWidth="4" fill="none" strokeLinecap="round">
        <rect x="40" y="52" width="130" height="86" rx="30" />
        <rect x="230" y="52" width="130" height="86" rx="30" />
        <path d="M170 82 Q200 62 230 82" />
        <path d="M40 78 L22 72" />
        <path d="M360 78 L378 72" />
      </g>
      <Measure x1={40} x2={170} y={34} />
      <text x="105" y="22" textAnchor="middle" className={LABEL}>{`Lens width ${size.lens} mm`}</text>
      <Measure x1={170} x2={230} y={158} />
      <text x="200" y="182" textAnchor="middle" className={LABEL}>{`Bridge ${size.bridge} mm`}</text>
      <g className="stroke-ink-800" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 208 L300 208 Q326 208 336 222 L340 230" />
      </g>
      <text x="198" y="194" textAnchor="middle" className={LABEL}>{`Temple length ${size.temple} mm`}</text>
    </svg>
  );
}
