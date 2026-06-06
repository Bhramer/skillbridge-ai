"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export default function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse bg-slate-200 rounded-lg", className)}
        />
      ))}
    </>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-container">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-4 w-72 mt-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <LoadingSkeleton className="h-28" count={4} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LoadingSkeleton className="h-64" count={2} />
      </div>
    </div>
  );
}
