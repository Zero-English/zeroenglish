import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />
      <div className="text-center mb-12">
        <Skeleton className="h-12 sm:h-16 w-72 sm:w-96 mx-auto mb-3 rounded-lg" />
        <Skeleton className="h-5 w-56 sm:w-64 mx-auto rounded-md" />
      </div>
      <div className="flex flex-wrap gap-5 justify-center max-w-2xl">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="w-35 h-35 sm:w-48 sm:h-48 rounded-3xl"
          />
        ))}
      </div>
      <Skeleton className="h-4 w-36 mx-auto mt-16 rounded-md" />
    </div>
  );
}
