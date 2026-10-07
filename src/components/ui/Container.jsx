import { cn } from "@/lib/cn.js";

export function Container({ as: Element = "div", className, children, ...rest }) {
  return (
    <Element className={cn("container-page", className)} {...rest}>
      {children}
    </Element>
  );
}
