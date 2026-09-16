import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerContainer } from "@/components/stagger";

function S({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-xl", className)} />;
}

function SkeletonBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />
      {children}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="mb-14 text-center">
            <S className="mx-auto mb-5 h-6 w-48 rounded-full" />
            <S className="mx-auto h-12 w-80 max-w-full rounded-xl sm:w-[26rem]" />
            <S className="mx-auto mt-3 h-12 w-56 max-w-full rounded-xl sm:w-72" />
            <S className="mx-auto mt-6 h-4 w-[22rem] max-w-full rounded-full" />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <S className="h-11 w-40 rounded-xl" />
              <S className="h-11 w-32 rounded-xl" />
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
              <S className="h-16 w-32 rounded-2xl" />
              <S className="h-16 w-32 rounded-2xl" />
              <S className="h-16 w-32 rounded-2xl" />
            </div>
          </section>

          <section className="mb-14">
            <div className="mb-5 space-y-2">
              <S className="h-7 w-44 rounded-lg" />
              <S className="h-4 w-64 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <S key={i} className="h-36 rounded-3xl" />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-5 space-y-2">
              <S className="h-7 w-48 rounded-lg" />
              <S className="h-4 w-52 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <S key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function VocabularySkeleton() {
  return (
    <SkeletonBackdrop>
      <section className="relative px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <S className="h-6 w-48 rounded-full" />
          <S className="mt-5 h-10 w-64 rounded-xl sm:h-12" />
          <S className="mt-3 h-4 w-80 max-w-full rounded-full" />
          <div className="mt-6 grid max-w-md grid-cols-3 gap-2.5">
            <S className="h-20 rounded-2xl" />
            <S className="h-20 rounded-2xl" />
            <S className="h-20 rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 space-y-2">
            <S className="h-7 w-48 rounded-lg" />
            <S className="h-4 w-56 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <S key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    </SkeletonBackdrop>
  );
}

export function LevelSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <S className="h-4 w-28 rounded-lg" />
          <div className="mt-7 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-4">
              <S className="h-7 w-44 rounded-full" />
              <S className="h-14 w-24 rounded-2xl sm:h-16" />
              <S className="h-4 w-72 max-w-full rounded-full" />
              <S className="h-4 w-52 max-w-full rounded-full" />
            </div>
            <div className="mt-2 flex items-center gap-5 sm:mt-0">
              <S className="h-28 w-28 shrink-0 rounded-full sm:h-32 sm:w-32" />
              <div className="w-36 space-y-2">
                <S className="h-7 w-16 rounded-lg" />
                <S className="h-3 w-24 rounded-full" />
                <S className="h-1.5 w-full rounded-full" />
                <S className="h-3 w-20 rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <S key={i} className="h-9 w-20 rounded-full" />
              ))}
            </div>
            <S className="h-9 w-28 rounded-xl" />
          </div>

          <div className="mt-4 space-y-4 pb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <S key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function SearchSkeleton() {
  return (
    <SkeletonBackdrop>
      <section className="relative px-4 pt-10 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <S className="h-6 w-44 rounded-full" />
          <S className="mt-5 h-10 w-52 rounded-xl sm:h-12" />
          <S className="mt-3 h-4 w-96 max-w-full rounded-full" />
        </div>
      </section>

      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <S className="h-12 w-full rounded-xl" />
          <div className="mt-5 flex items-center gap-2">
            <S className="h-4 w-12 rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <S key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="mt-8 space-y-4 pb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <S key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    </SkeletonBackdrop>
  );
}

export function QuizSkeleton() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-3xl">
        <div className="mb-12 text-center">
          <S className="mx-auto mb-5 h-6 w-36 rounded-full" />
          <S className="mx-auto h-10 w-72 max-w-full rounded-xl sm:h-12 sm:w-96" />
          <S className="mx-auto mt-3 h-4 w-80 max-w-full rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <S className="h-40 rounded-3xl sm:col-span-2" />
          <S className="h-36 rounded-3xl" />
          <S className="h-36 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <S className="h-4 w-24 rounded-lg" />
          <div className="mb-6 mt-5 space-y-2">
            <S className="h-7 w-48 rounded-lg" />
            <S className="h-4 w-64 rounded-full" />
          </div>
          <S className="h-16 w-full rounded-2xl" />
          <S className="mt-4 h-44 w-full rounded-2xl" />
          <div className="mt-6 flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <S key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
          <div className="mt-6 space-y-3 pb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <S key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function LoginSkeleton() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-6 text-center">
            <S className="mx-auto mb-3 h-12 w-12 rounded-xl" />
            <S className="mx-auto h-7 w-40 rounded-lg" />
            <S className="mx-auto mt-3 h-4 w-56 rounded-full" />
          </div>
          <S className="h-10 w-full rounded-lg" />
          <div className="mt-4 space-y-2">
            <S className="h-5 w-16 rounded" />
            <S className="h-11 w-full rounded-xl" />
            <S className="mt-1 h-5 w-16 rounded" />
            <S className="h-11 w-full rounded-xl" />
          </div>
          <S className="mt-6 h-11 w-full rounded-xl" />
          <div className="my-5 flex items-center gap-3">
            <S className="h-px flex-1" />
            <S className="h-3 w-10 rounded" />
            <S className="h-px flex-1" />
          </div>
          <S className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative mx-auto max-w-3xl px-4 py-12">
        <S className="h-9 w-64 rounded-xl" />
        <div className="mt-8 space-y-4">
          <S className="h-4 w-full rounded-full" />
          <S className="h-4 w-11/12 rounded-full" />
          <S className="h-4 w-4/5 rounded-full" />
        </div>
        <div className="mt-8 space-y-3">
          <S className="h-6 w-40 rounded-lg" />
          <S className="h-4 w-full rounded-full" />
          <S className="h-4 w-5/6 rounded-full" />
          <S className="h-4 w-2/3 rounded-full" />
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function LeaderboardSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <S className="mb-6 h-4 w-16 rounded-full" />
          <div className="mb-1 text-center">
            <S className="mx-auto mb-4 h-16 w-16 rounded-2xl" />
            <S className="mx-auto h-8 w-52 rounded-xl" />
            <S className="mx-auto mt-2 h-4 w-80 max-w-full rounded-full" />
          </div>
          <div className="mt-6 flex justify-center">
            <S className="h-10 w-56 rounded-full" />
          </div>
          <div className="mt-6 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
            <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
              <div className="flex flex-col items-center">
                <S className="h-14 w-14 rounded-full sm:h-16 sm:w-16" />
                <S className="mt-2 h-3 w-16 rounded-full" />
                <S className="mt-2 h-6 w-14 rounded-full" />
                <S className="mt-3 h-10 w-full rounded-t-xl" />
              </div>
              <div className="flex flex-col items-center">
                <S className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
                <S className="mt-2 h-3 w-16 rounded-full" />
                <S className="mt-2 h-6 w-14 rounded-full" />
                <S className="mt-3 h-[4.5rem] w-full rounded-t-xl" />
              </div>
              <div className="flex flex-col items-center">
                <S className="h-12 w-12 rounded-full sm:h-14 sm:w-14" />
                <S className="mt-2 h-3 w-16 rounded-full" />
                <S className="mt-2 h-6 w-14 rounded-full" />
                <S className="mt-3 h-9 w-full rounded-t-xl" />
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <S className="h-28 rounded-2xl" />
            <S className="h-28 rounded-2xl" />
            <S className="h-28 rounded-2xl" />
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <S key={i} className="mx-4 my-3 h-12 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function NewsSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <S className="mx-auto h-6 w-24 rounded-full" />
            <S className="mx-auto mt-4 h-9 w-52 rounded-xl sm:h-10" />
            <S className="mx-auto mt-3 h-4 w-96 max-w-full rounded-full" />
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/60"
              >
                <S className="aspect-[4/3] w-full rounded-none" />
                <div className="flex flex-1 flex-col p-5">
                  <S className="h-3 w-24 rounded-full" />
                  <S className="mt-3 h-5 w-3/4 rounded-lg" />
                  <S className="mt-2 h-4 w-full rounded-full" />
                  <S className="mt-1.5 h-4 w-5/6 rounded-full" />
                  <S className="mt-4 h-4 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <S className="h-3 w-24 rounded-full" />
            <S className="h-9 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function NewsArticleSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <S className="mb-8 h-4 w-32 rounded-full" />
          <S className="h-8 w-4/5 rounded-xl sm:h-10" />
          <S className="mt-4 h-4 w-1/2 rounded-full" />
          <div className="mt-8 flex items-center gap-3">
            <S className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <S className="h-3 w-32 rounded-full" />
              <S className="h-3 w-24 rounded-full" />
            </div>
          </div>
          <S className="mt-8 aspect-[16/9] w-full rounded-2xl" />
          <div className="mt-8 space-y-4">
            <S className="h-4 w-full rounded-full" />
            <S className="h-4 w-full rounded-full" />
            <S className="h-4 w-11/12 rounded-full" />
            <S className="h-4 w-3/4 rounded-full" />
          </div>
          <div className="mt-8 space-y-4">
            <S className="h-4 w-full rounded-full" />
            <S className="h-4 w-5/6 rounded-full" />
            <S className="h-4 w-2/3 rounded-full" />
          </div>
          <div className="mt-12 space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <S className="h-3 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function QuizExamSkeleton() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <S className="mx-auto mb-4 h-6 w-44 rounded-full" />
          <S className="mx-auto h-10 w-64 max-w-full rounded-xl sm:h-12 sm:w-80" />
          <S className="mx-auto mt-3 h-4 w-96 max-w-full rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-3xl border-2 border-zinc-200/70 bg-white/70 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between">
                <S className="h-14 w-14 rounded-2xl" />
                <S className="h-7 w-24 rounded-full" />
              </div>
              <S className="mt-5 h-6 w-3/4 rounded-lg" />
              <S className="mt-2 h-4 w-32 rounded-full" />
              <div className="mt-4 flex gap-2">
                <S className="h-7 w-24 rounded-lg" />
                <S className="h-7 w-16 rounded-lg" />
              </div>
              <S className="mt-4 h-12 w-full rounded-2xl" />
              <S className="mt-4 h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PublicProfileSkeleton() {
  return (
    <SkeletonBackdrop>
      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <S className="mb-6 h-4 w-16 rounded-full" />

          <StaggerContainer className="flex flex-col gap-5">
            {/* Twitter-style profile card */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm">
              <div className="h-24 bg-gradient-to-br from-zinc-200 to-zinc-300/70 sm:h-36 dark:from-zinc-800 dark:to-zinc-800/40">
                <S className="absolute left-3 top-3 h-6 w-28 rounded-full sm:left-6 sm:top-5" />
              </div>
              <div className="relative px-4 pb-6 sm:px-6">
                <div className="-mt-12 sm:-mt-16">
                  <S className="h-24 w-24 rounded-full ring-4 ring-white dark:ring-zinc-950 sm:h-28 sm:w-28" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <S className="h-5 w-40 rounded-lg" />
                  <S className="h-5 w-16 rounded-full" />
                </div>
                <S className="mt-2 h-4 w-32 rounded-full" />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <S className="h-4 w-36 rounded-full" />
                  <S className="h-4 w-24 rounded-full" />
                </div>
                <div className="mt-4 flex items-center gap-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <S className="h-4 w-4" />
                      <S className="h-5 w-8 rounded-md" />
                      <S className="h-3 w-14 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-zinc-200/60 p-1 dark:bg-zinc-800/60">
              {Array.from({ length: 3 }).map((_, i) => (
                <S key={i} className="h-8 flex-1 rounded-lg" />
              ))}
            </div>

            {/* Overview content */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              <div className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 p-5 sm:p-6 lg:col-span-4 dark:bg-zinc-950/60 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <S className="h-9 w-9 rounded-xl" />
                  <S className="h-4 w-32 rounded-lg" />
                </div>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <S className="h-40 w-40 rounded-full" />
                  <S className="h-4 w-28 rounded-full" />
                </div>
              </div>
              <div className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 p-5 sm:p-6 lg:col-span-8 dark:bg-zinc-950/60 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <S className="h-9 w-9 rounded-xl" />
                  <S className="h-4 w-40 rounded-lg" />
                </div>
                <div className="mt-6 space-y-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <S className="h-5 w-9 rounded-md" />
                          <S className="h-3 w-12 rounded-full" />
                        </div>
                        <S className="h-3 w-8 rounded-full" />
                      </div>
                      <S className="mt-2 h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </div>
    </SkeletonBackdrop>
  );
}

export function VocabularyExamResultSkeleton() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <S className="mb-6 h-4 w-16 rounded-full" />
          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 p-6 text-center sm:p-8 dark:bg-zinc-950/60">
            <div className="flex items-center justify-center gap-2">
              <S className="h-10 w-10 rounded-xl" />
              <S className="h-5 w-32 rounded-lg" />
            </div>
            <S className="mx-auto mt-4 h-16 w-40 rounded-xl sm:h-20" />
            <S className="mx-auto mt-3 h-4 w-40 rounded-full" />
            <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <S key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <S key={i} className="h-6 w-10 rounded-md" />
              ))}
            </div>
          </div>
          <S className="mt-5 h-24 w-full rounded-2xl" />
          <div className="mt-6">
            <S className="mb-4 h-5 w-40 rounded-lg" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <S key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="mt-6">
            <S className="mb-4 h-5 w-32 rounded-lg" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <S key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeSkeleton;

export { VocabularyExamResultSkeleton as QuizResultSkeleton };