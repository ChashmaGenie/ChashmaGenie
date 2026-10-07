import { COLORS, labelOf } from "@shared/enums.js";
import { cn } from "@/lib/cn.js";

const MAX_SWATCHES = 5;

export const swatchStyle = (colorKey) => {
  const color = COLORS.find((entry) => entry.value === colorKey);
  return { background: color?.gradient ?? color?.hex ?? "#111111" };
};

export function ColorSwatches({ colors, selected, onSelect }) {
  const visible = colors.slice(0, MAX_SWATCHES);
  const extra = colors.length - visible.length;
  return (
    <div className="flex min-h-[44px] items-center gap-1">
      <ul className="flex items-center" aria-label="Colours">
        {visible.map((colorKey) => (
          <li key={colorKey}>
            <button
              type="button"
              aria-label={labelOf(COLORS, colorKey)}
              aria-pressed={selected === colorKey}
              onClick={() => onSelect(selected === colorKey ? null : colorKey)}
              className="focus-ring grid h-11 w-11 place-items-center rounded-full"
            >
              <span
                className={cn("block h-4 w-4 rounded-full border border-ink-300", selected === colorKey && "ring-2 ring-ink-800 ring-offset-2 ring-offset-cream-100")}
                style={swatchStyle(colorKey)}
              />
            </button>
          </li>
        ))}
      </ul>
      {extra > 0 ? <span className="text-xs font-medium text-ink-600">+{extra}</span> : null}
      <span className="ms-1 truncate text-xs text-ink-600" aria-live="polite">
        {selected ? labelOf(COLORS, selected) : ""}
      </span>
    </div>
  );
}
