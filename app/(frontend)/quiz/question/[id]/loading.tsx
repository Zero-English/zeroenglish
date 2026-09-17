function Skel({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 ${className}`} />
  );
}

export default function QuizQuestionLoading() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Skel className="mb-6 h-4 w-28" />
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Skel className="h-6 w-20 rounded-full" />
            <Skel className="h-6 w-24 rounded-full" />
            <Skel className="h-6 w-14 rounded-full" />
          </div>
          <Skel className="mt-6 h-7 w-4/5" />
          <Skel className="mt-3 h-7 w-1/2" />
          <div className="mt-8 space-y-2.5">
            <Skel className="h-14 w-full rounded-xl" />
            <Skel className="h-14 w-full rounded-xl" />
            <Skel className="h-14 w-full rounded-xl" />
            <Skel className="h-14 w-3/4 rounded-xl" />
          </div>
          <Skel className="mt-6 h-20 w-full rounded-2xl" />
          <Skel className="mt-4 h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}