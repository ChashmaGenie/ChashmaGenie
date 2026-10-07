import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input.jsx";

const DEBOUNCE_MS = 300;

export function ShopSearch({ filters, onChange }) {
  const [value, setValue] = useState(filters.q);
  const latest = useRef({ filters, onChange });
  const committed = useRef(filters.q);
  latest.current = { filters, onChange };

  useEffect(() => {
    if (filters.q === committed.current) return;
    committed.current = filters.q;
    setValue(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === committed.current) return undefined;
    const timer = setTimeout(() => {
      committed.current = trimmed;
      latest.current.onChange({ ...latest.current.filters, q: trimmed });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <form role="search" onSubmit={(event) => event.preventDefault()} className="relative w-full">
      <Search className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-600" aria-hidden="true" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Search glasses"
        placeholder="Search by name, shape, colour"
        maxLength={80}
        className="ps-11 pe-11"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue("")}
          className="focus-ring absolute end-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-ink-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
    </form>
  );
}
