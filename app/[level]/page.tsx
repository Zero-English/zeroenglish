import Link from "next/link";
import { getWordsByLevel } from "@/lib/data";
import { ArrowLeft, ArrowRight } from "lucide-react";
const levelConfig: Record<string, { bg: string; border: string; text: string; gradient: string; label: string }> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
  },
};

const levels = Object.keys(levelConfig);
const ITEMS_PER_PAGE = 10;

export function generateStaticParams() {
  return levels.map((level) => ({ level: level.toLowerCase() }));
}

function PageLink({ page, active, gradient }: { page: number; active: boolean; gradient: string }) {
  return (
    <Link
      href={`?page=${page}`}
      className={`relative inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
        active
          ? `bg-gradient-to-br ${gradient} text-white shadow-lg shadow-zinc-200/60 dark:shadow-black/30 scale-105 ring-2 ring-white/60 dark:ring-zinc-800/70 pointer-events-none`
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className={`relative ${active ? "scale-100" : ""}`}>{page}</span>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, gradient }: { currentPage: number; totalPages: number; gradient: string }) {
  const items: (number | "more")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
  } else {
    items.push(1);
    if (currentPage > 3) items.push("more");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) items.push(i);
    if (currentPage < totalPages - 2) items.push("more");
    items.push(totalPages);
  }

  const btn = (dir: "prev" | "next") => {
    const isPrev = dir === "prev";
    const disabled = isPrev ? currentPage === 1 : currentPage === totalPages;
    const href = disabled ? `?page=${currentPage}` : isPrev ? `?page=${currentPage - 1}` : `?page=${currentPage + 1}`;
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
          disabled
            ? "text-zinc-300 dark:text-zinc-700 cursor-default pointer-events-none"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 active:scale-95"
        }`}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        {isPrev ? (
          <ArrowLeft className="w-4 h-4"/>
        ) : null}
        <span>{isPrev ? "" : ""}</span>
        {!isPrev ? (
          <ArrowRight className="w-4 h-4"/>
        ) : null}
      </Link>
    );
  };

  return (
    <nav className="mt-10 mb-8" aria-label="Pagination">
      <div className="inline-flex items-center gap-1">
        {btn("prev")}
        <div className="w-px h-5 mx-1 bg-zinc-200 dark:bg-zinc-800" />
        {items.map((item, i) =>
          item === "more" ? (
            <span
              key={`e${i}`}
              className="inline-flex items-center justify-center w-[26px] h-9 text-sm tracking-wider text-zinc-300 dark:text-zinc-600 select-none"
            >
              ...
            </span>
          ) : (
            <PageLink key={item} page={item} active={item === currentPage} gradient={gradient} />
          )
        )}
        <div className="w-px h-5 mx-1 bg-zinc-200 dark:bg-zinc-800" />
        {btn("next")}
      </div>
    </nav>
  );
}

function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-6xl font-black text-zinc-200 dark:text-zinc-800 select-none">404</div>
      <h1 className="text-2xl font-bold text-zinc-400">Level not found</h1>
      <p className="text-sm text-zinc-400 dark:text-zinc-500">Choose A1, A2, B1, or B2 to start learning.</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        &larr; Back to levels
      </Link>
    </div>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { level } = await params;
  const { page: pageStr } = await searchParams;
  const upper = level.toUpperCase();

  if (!levels.includes(upper)) {
    return <NotFound />;
  }

  const c = levelConfig[upper];
  const allWords = getWordsByLevel(upper);
  const totalPages = Math.ceil(allWords.length / ITEMS_PER_PAGE);
  const pageNum = Number(pageStr);
  const currentPage = Math.max(1, Math.min(Number.isNaN(pageNum) ? 1 : pageNum, totalPages));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const words = allWords.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/80 via-transparent to-transparent dark:from-white/5" />
      <div className="fixed -top-32 right-[-8rem] h-[28rem] w-[28rem] -z-10 rounded-full bg-gradient-to-br from-white/70 via-white/40 to-transparent blur-3xl dark:from-white/10" />
      <div className="fixed -bottom-40 left-[-10rem] h-[30rem] w-[30rem] -z-10 rounded-full bg-gradient-to-br from-zinc-100 via-white to-transparent blur-3xl dark:from-zinc-900/60 dark:via-zinc-950/60" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-0.5">&larr;</span>
            Back to levels
          </Link>

          <div className="mt-8 mb-12">
            <div className="relative rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-6 sm:p-8 shadow-xl shadow-zinc-200/60 dark:shadow-black/30">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/70 via-transparent to-white/30 dark:from-white/5 pointer-events-none" />
              <div className="relative flex items-start gap-5">
                <div className={`h-14 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${c.gradient}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h1 className={`text-5xl sm:text-6xl font-black bg-gradient-to-br ${c.gradient} bg-clip-text text-transparent tracking-tight`}>
                      {upper}
                    </h1>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${c.text} ${c.bg} border ${c.border}`}>
                      {c.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm text-zinc-400 dark:text-zinc-500">
                    <span className="font-medium">{allWords.length} words</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span>Oxford 3000</span>
                    {totalPages > 1 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                        <span>{currentPage} of {totalPages} pages</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  Ready to learn
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {words.map((word) => (
              <div
                key={word.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5"
              >
                <div className={`absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b ${c.gradient} opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:w-1.5`} />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />
                <div className="pl-4 sm:pl-5">
                  <div className="flex items-baseline gap-2.5 mb-1.5">
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {word.word}
                    </h2>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800/60 rounded-md px-2 py-0.5">
                      {word.parts_of_speech}
                    </span>
                  </div>
                  {word.meaning_bn !== "..." && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
                      {word.meaning_bn}
                    </p>
                  )}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {word.definition_en}
                  </p>
                  {word.examples_en.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      {word.examples_en.map((ex, i) => (
                        <p key={i} className="text-sm text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                          &ldquo;{ex}&rdquo;
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <>
              <p className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Showing {start + 1}&ndash;{Math.min(start + ITEMS_PER_PAGE, allWords.length)} of {allWords.length}
              </p>
              <Pagination currentPage={currentPage} totalPages={totalPages} gradient={c.gradient} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
