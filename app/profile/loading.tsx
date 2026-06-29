import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />
      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 space-y-2">
            <Skeleton className="h-9 sm:h-10 w-44 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <div className="space-y-6">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-9 w-28 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 p-5 space-y-3"
                >
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-8 w-12 rounded-md" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
