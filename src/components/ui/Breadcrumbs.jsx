import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-600">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.to && !isLast ? (
                <Link to={item.to} className="focus-ring inline-flex min-h-[44px] items-center rounded underline-offset-2 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-ink-800" : undefined}>
                  {item.label}
                </span>
              )}
              {isLast ? null : <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
