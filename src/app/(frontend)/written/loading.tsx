import { Skeleton } from "@/components/ui/skeleton";

export default function WrittenLoading() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <Skeleton className="h-6 w-24 mx-auto rounded-full" />
        <Skeleton className="h-10 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="pt-3 border-t border-border/50 flex justify-between items-center">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
