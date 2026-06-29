import { Skeleton } from "@/components/ui/skeleton";

export default function LevelPageLoading() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />
      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-4 w-24 mb-8 rounded-md" />
          <div className="mb-12">
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <Skeleton className="h-14 w-1.5 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <Skeleton className="h-14 sm:h-16 w-20 rounded-lg" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-1 w-1 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-1 w-1 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </div>
                </div>
                <Skeleton className="hidden sm:block h-8 w-32 rounded-2xl" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-28 rounded-md" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48 rounded-md" />
                    <Skeleton className="h-4 w-full max-w-md rounded-md" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-56 mx-auto mt-8 mb-5 rounded-md" />
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
