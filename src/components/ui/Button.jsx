import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn.js";

const VARIANTS = {
  primary: "bg-gold-400 text-ink-800 hover:bg-gold-500 border border-transparent",
  secondary: "bg-transparent text-ink-800 border border-ink-800 hover:bg-ink-100",
  ghost: "bg-transparent text-ink-800 border border-transparent hover:bg-ink-100",
  teal: "bg-teal-600 text-white hover:bg-teal-700 border border-transparent",
  danger: "bg-danger-600 text-white hover:opacity-90 border border-transparent",
  onDark: "bg-transparent text-cream-100 border border-transparent hover:bg-white/10",
};

const SIZES = {
  sm: "min-h-[44px] px-4 text-sm",
  md: "min-h-[48px] px-5 text-base",
  lg: "min-h-[56px] px-7 text-lg",
};

const baseClasses =
  "focus-ring inline-flex select-none items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const pickElement = ({ to, href }) => {
  if (to) return { Element: Link, linkProps: { to } };
  if (href) return { Element: "a", linkProps: { href } };
  return { Element: "button", linkProps: { type: "button" } };
};

export const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, fullWidth = false, to, href, disabled, className, children, ...rest },
  ref,
) {
  const { Element, linkProps } = pickElement({ to, href });
  const isButton = Element === "button";
  const blocked = disabled || loading;
  return (
    <Element
      ref={ref}
      {...linkProps}
      {...rest}
      {...(isButton ? { disabled: blocked } : {})}
      aria-busy={loading || undefined}
      aria-disabled={!isButton && blocked ? true : undefined}
      className={cn(baseClasses, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Element>
  );
});

export const IconButton = forwardRef(function IconButton(
  { label, variant = "ghost", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      {...rest}
      className={cn(baseClasses, VARIANTS[variant], "h-11 w-11 min-h-[44px] min-w-[44px] p-0", className)}
    >
      {children}
    </button>
  );
});
