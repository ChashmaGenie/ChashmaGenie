export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const scrollBehavior = () => (prefersReducedMotion() ? "auto" : "smooth");
