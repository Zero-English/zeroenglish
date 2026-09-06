import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function S({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70",
        className
      )}
    />
  );
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

export default HomeSkeleton;