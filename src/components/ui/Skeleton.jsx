import { cn } from "@/lib/cn.js";

export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xl", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-page section-y" role="status" aria-label="Loading">
      <Skeleton className="mb-6 h-10 w-1/2" />
      <Skeleton className="mb-3 h-4 w-full" />
      <Skeleton className="mb-3 h-4 w-5/6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
