import { Skeleton } from "@/components/ui/skeleton";

export default function UserDetailLoading() {
  return (
    <div className="p-4 lg:p-8">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        ))}
      </div>

      {/* calendar */}
      <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="text-right">
            <Skeleton className="ml-auto h-7 w-12" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        </div>
        <div className="p-5">
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2"
              >
                <Skeleton className="h-4 w-full" />
                <div className="mt-2 flex flex-wrap gap-1">
                  <Skeleton className="h-1.5 w-1.5 rounded-full" />
                  <Skeleton className="h-1.5 w-1.5 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-2 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}