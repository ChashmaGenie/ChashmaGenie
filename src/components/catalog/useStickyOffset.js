import { useEffect, useState } from "react";

const HEADER_SELECTOR = "header";

const measureHeader = () => document.querySelector(HEADER_SELECTOR)?.getBoundingClientRect().height ?? 64;

export function useStickyOffset() {
  const [offset, setOffset] = useState(measureHeader);

  useEffect(() => {
    const header = document.querySelector(HEADER_SELECTOR);
    const update = () => setOffset(Math.round(measureHeader()));
    update();
    if (!header || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return offset;
}
