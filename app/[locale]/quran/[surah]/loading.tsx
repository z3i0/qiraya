import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SurahLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-48 rounded-lg" />
      </div>

      {/* Verses Skeleton */}
      <div className="space-y-4 pt-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-border/40 bg-card/40 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-16 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
