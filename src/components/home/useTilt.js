import { useEffect, useRef } from "react";

const MAX_TILT_DEGREES = 14;
const EASING = 0.12;
const REST = { x: 0, y: 0 };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pointerOffset = (event, element) => {
  const rect = element.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
    y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
  };
};

const applyPose = (element, pose) => {
  element.style.setProperty("--tilt-x", `${(-pose.y * MAX_TILT_DEGREES).toFixed(2)}deg`);
  element.style.setProperty("--tilt-y", `${(pose.x * MAX_TILT_DEGREES).toFixed(2)}deg`);
  element.style.setProperty("--glare-x", `${((pose.x + 1) * 50).toFixed(1)}%`);
  element.style.setProperty("--glare-y", `${((pose.y + 1) * 50).toFixed(1)}%`);
};

export function useTilt() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return undefined;

    let target = REST;
    let current = REST;
    let frame = 0;

    const step = () => {
      current = {
        x: current.x + (target.x - current.x) * EASING,
        y: current.y + (target.y - current.y) * EASING,
      };
      applyPose(element, current);
      const settled = Math.abs(target.x - current.x) < 0.002 && Math.abs(target.y - current.y) < 0.002;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const aim = (nextTarget) => {
      target = nextTarget;
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onMove = (event) => aim(pointerOffset(event, element));
    const onLeave = () => aim(REST);

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("pointercancel", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return ref;
}
