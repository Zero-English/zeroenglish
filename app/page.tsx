import Link from "next/link";
import { getLevelStats } from "@/lib/data";

const levelColors: Record<string, { bg: string; border: string; text: string; gradient: string; label: string }> = {
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

export default function Home() {
  const stats = getLevelStats();

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="animate-fade-up text-center mb-12">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Vocabulary
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Master English words — pick your level and start learning
        </p>
      </div>

      <div className="flex flex-wrap gap-5 justify-center max-w-2xl">
        {stats.map(({ level, count }, i) => {
          const c = levelColors[level];
          return (
            <Link
              key={level}
              href={`/${level.toLowerCase()}`}
              className={`group relative flex flex-col items-center justify-center w-44 h-44 sm:w-48 sm:h-48 rounded-3xl border-2 ${c.border} ${c.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98]`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
              />
              <div className="relative flex flex-col items-center">
                <span
                  className={`text-4xl sm:text-5xl font-black bg-gradient-to-br ${c.gradient} bg-clip-text text-transparent`}
                >
                  {level}
                </span>
                <span className={`text-xs font-medium mt-1.5 ${c.text}`}>
                  {c.label}
                </span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500 mt-3">
                  {count} words
                </span>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 group-hover:w-12 transition-all duration-300" />
            </Link>
          );
        })}
      </div>

      <p className="animate-fade-up-3 text-xs text-zinc-400 dark:text-zinc-600 mt-16">
        Oxford 3000 word list
      </p>
    </div>
  );
}
