import Link from "next/link";
import { notFound } from "next/navigation";
import { getWordsByLevel } from "@/lib/data";
import { WordPagination } from "@/components/word-pagination";
import { WordCard } from "@/components/word-card";

const VALID_LEVELS = ["A1", "A2", "B1", "B2"] as const;

interface LevelConfig {
  readonly bg: string;
  readonly border: string;
  readonly text: string;
  readonly gradient: string;
  readonly label: string;
}

const levelConfig: Record<(typeof VALID_LEVELS)[number], LevelConfig> = {
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

const ITEMS_PER_PAGE = 10;

export interface LevelPageContentProps {
  level: string;
  pageNum?: number;
}

export function LevelPageContent({ level, pageNum = 1 }: LevelPageContentProps) {
  const upper = level.toUpperCase();

  if (!VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number])) {
    notFound();
  }

  const config = levelConfig[upper as (typeof VALID_LEVELS)[number]];
  const allWords = getWordsByLevel(upper);

  if (allWords.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(allWords.length / ITEMS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(pageNum, totalPages));

  if (pageNum < 1 || pageNum > totalPages || Number.isNaN(pageNum)) {
    notFound();
  }

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
            <div className="relative rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80  p-6 sm:p-8 ">
              <div className="relative flex items-start gap-5">
                <div className={`h-14 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${config.gradient}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h1 className={`text-5xl sm:text-6xl font-black bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent tracking-tight`}>
                      {upper}
                    </h1>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.text} ${config.bg} border ${config.border}`}>
                      {config.label}
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
              <WordCard key={word.id} word={word} gradient={config.gradient} />
            ))}
          </div>

          {totalPages > 1 && (
            <>
              <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Showing {start + 1}&ndash;{Math.min(start + ITEMS_PER_PAGE, allWords.length)} of {allWords.length}
              </p>
              <WordPagination currentPage={currentPage} totalPages={totalPages} level={level} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
