import { useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useCatalog } from "@/lib/catalog.jsx";
import { imageUrl } from "@/lib/images.js";
import { formatPkr } from "@/lib/format.js";
import { cn } from "@/lib/cn.js";

const MAX_SUGGESTIONS = 6;

const matchesAllTokens = (product, tokens) => {
  const haystack = `${product.name} ${product.brand} ${product.category} ${product.shape ?? ""}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
};

const suggest = (products, query) => {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  return products.filter((product) => matchesAllTokens(product, tokens)).slice(0, MAX_SUGGESTIONS);
};

export function SearchBox({ className, onNavigate, autoFocus = false }) {
  const navigate = useNavigate();
  const listId = useId();
  const { products } = useCatalog();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = useMemo(() => suggest(products, query), [products, query]);
  const isOpen = focused && suggestions.length > 0;

  const go = (path) => {
    setQuery("");
    setFocused(false);
    onNavigate?.();
    navigate(path);
  };

  const submit = (event) => {
    event.preventDefault();
    const active = suggestions[activeIndex];
    if (active) return go(`/p/${active.slug}`);
    const trimmed = query.trim();
    if (trimmed) go(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
    }
    if (event.key === "Escape") setFocused(false);
  };

  return (
    <form role="search" onSubmit={submit} className={cn("relative", className)}>
      <label htmlFor={`${listId}-input`} className="sr-only">Search glasses</label>
      <Search className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-600" aria-hidden="true" />
      <input
        id={`${listId}-input`}
        type="search"
        autoFocus={autoFocus}
        autoComplete="off"
        value={query}
        placeholder="Search glasses"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        className="focus-ring min-h-[44px] w-full rounded-full border border-ink-300 bg-cream-50 ps-11 pe-4 text-base text-ink-800"
      />
      <ul
        id={listId}
        role="listbox"
        hidden={!isOpen}
        className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-ink-200 bg-cream-50 text-ink-800 shadow-sh-3"
      >
        {suggestions.map((product, index) => (
          <li key={product.id} id={`${listId}-${index}`} role="option" aria-selected={index === activeIndex}>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => go(`/p/${product.slug}`)}
              className={cn("flex min-h-[56px] w-full items-center gap-3 px-3 py-2 text-start hover:bg-ink-100", index === activeIndex && "bg-ink-100")}
            >
              <img src={imageUrl(product.images[0])} alt="" width="48" height="36" className="h-9 w-12 rounded bg-cream-200 object-contain" />
              <span className="flex-1 text-sm font-medium">{product.name}</span>
              <span className="tabular text-sm text-ink-600">{formatPkr(product.price)}</span>
            </button>
          </li>
        ))}
      </ul>
    </form>
  );
}
