import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ id, eyebrow, title, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
      <div>
        {eyebrow ? <p className="label-caps mb-2 text-teal-600">{eyebrow}</p> : null}
        <h2 id={id} className="text-2xl md:text-4xl">{title}</h2>
      </div>
      {action ? (
        <Link to={action.to} className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded font-semibold text-sky-700 hover:underline">
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
