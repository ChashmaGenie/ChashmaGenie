import { formatPkr } from "@/lib/format.js";
import { cn } from "@/lib/cn.js";

const SIZES = { sm: "text-sm", md: "text-base", lg: "text-xl", hero: "font-display text-3xl" };

export function Price({ amount, compareAt, from = false, size = "md", className }) {
  const hasDiscount = compareAt && compareAt > amount;
  return (
    <p className={cn("tabular inline-flex flex-wrap items-baseline gap-x-2 font-semibold text-ink-800", SIZES[size], className)}>
      <span>
        {from ? <span className="me-1 text-sm font-medium text-ink-600">From</span> : null}
        {formatPkr(amount)}
      </span>
      {hasDiscount ? (
        <s className="text-sm font-normal text-ink-600">
          <span className="sr-only">Was </span>
          {formatPkr(compareAt)}
        </s>
      ) : null}
    </p>
  );
}
