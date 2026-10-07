const FOCUSABLE = 'input:not([type="hidden"]), select, textarea, button';

export const focusField = (path) => {
  const wrapper = document.querySelector(`[data-field="${path}"]`);
  if (!wrapper) return;
  wrapper.scrollIntoView({ block: "center", behavior: "smooth" });
  wrapper.querySelector(FOCUSABLE)?.focus({ preventScroll: true });
};
