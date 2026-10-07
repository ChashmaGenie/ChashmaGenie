import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const internalPathOf = (anchor) => {
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : null;
};

const isPlainLeftClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function useUnsavedGuard(dirty) {
  const navigate = useNavigate();
  const released = useRef(false);
  const [pendingPath, setPendingPath] = useState(null);

  useEffect(() => {
    if (!dirty) return undefined;
    const warnBeforeUnload = (event) => {
      if (released.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const interceptLinkClick = (event) => {
      if (released.current || event.defaultPrevented || !isPlainLeftClick(event)) return;
      const path = internalPathOf(event.target.closest?.("a[href]"));
      if (!path || path === `${window.location.pathname}${window.location.search}`) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingPath(path);
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", interceptLinkClick, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", interceptLinkClick, true);
    };
  }, [dirty]);

  const requestLeave = useCallback(
    (path) => {
      if (!dirty || released.current) navigate(path);
      else setPendingPath(path);
    },
    [dirty, navigate],
  );

  const leaveNow = useCallback(
    (path) => {
      released.current = true;
      setPendingPath(null);
      navigate(path);
    },
    [navigate],
  );

  const stay = useCallback(() => setPendingPath(null), []);

  return { pendingPath, requestLeave, leaveNow, stay };
}
