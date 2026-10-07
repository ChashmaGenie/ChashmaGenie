import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToHash = (hash) => {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (!target) return;
  target.scrollIntoView({ block: "start" });
};

export const useHashScroll = () => {
  const { hash } = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollToHash(hash));
    return () => cancelAnimationFrame(frame);
  }, [hash]);
};
