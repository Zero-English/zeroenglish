"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Deterministic pseudo-random so the same "hard-coded" data is shown every render.
function seededCount(year: number, month: number, day: number) {
  const n = Math.sin(
    year * 10000 +
      month * 500 +
      day * (day % 2 === 0 ? 13 : 7) +
      (month % 3)
  );
  const r = Math.abs(n) * 1000;
  const bucket = (Math.floor(r) % 11);
  if (bucket < 3) return 0;
  if (bucket < 6) return 1;
  if (bucket < 8) return 2;
  if (bucket < 10) return 3;
  return 4;
}

function getColor(count: number) {
  if (count === 0) {
    return "bg-zinc-100 dark:bg-zinc-800/60";
  }
  if (count <= 1) {
    return "bg-emerald-200 dark:bg-emerald-900/60";
  }
  if (count <= 2) {
    return "bg-emerald-400 dark:bg-emerald-700";
  }
  if (count <= 3) {
    return "bg-emerald-500 dark:bg-emerald-500";
  }
  return "bg-emerald-700 dark:bg-emerald-400";
}

export default function DailyProgress({ year = 2026 }: { year?: number }) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      let total = 0;
      const days = Array.from({ length: daysInMonth }, (_, d) => {
        const day = d + 1;
        const count = seededCount(year, m, day);
        total += count;
        return { day, count };
      });
      return { month: m, name: MONTH_NAMES[m], days, total };
    });
  }, [year]);

  const grandTotal = useMemo(
    () => months.reduce((sum, m) => sum + m.total, 0),
    [months]
  );

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Daily Learned Words
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daily progress or learned word count for {year}.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {grandTotal}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              words reviewed in {year}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {showDetails ? "Hide details" : "View details"}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Month summary cards */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {months.map((m) => (
            <div
              key={m.month}
              className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 px-3 py-2"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {m.name}
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {m.total}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-0.5">
                {m.days
                  .filter((d) => d.count > 0)
                  .slice(0, 10)
                  .map((d) => (
                    <span
                      key={d.day}
                      className="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500"
                    />
                  ))}
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                {m.days.filter((d) => d.count > 0).length} active days
              </p>
            </div>
          ))}
        </div>

        {/* One heatmap grid per month */}
        {showDetails && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {months.map((m) => {
            const firstWeekday = new Date(year, m.month, 1).getDay();
            return (
              <div key={m.month}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {m.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {m.total} words
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstWeekday }).map((_, i) => (
                    <span key={`pad-${i}`} />
                  ))}
                  {m.days.map((d) => (
                    <button
                      key={d.day}
                      type="button"
                      aria-label={`${MONTH_NAMES[m.month]} ${d.day}: ${d.count} words`}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTooltip({
                          date: `${MONTH_NAMES[m.month]} ${d.day}, ${year}`,
                          count: d.count,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`aspect-square h-6 w-6 rounded-[4px] ${getColor(d.count)} transition-transform hover:scale-110 ${d.count === 0 ? "cursor-default" : ""}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Legend */}
        <div className="mt-5 flex items-center justify-end gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((c) => (
            <span
              key={c}
              className={`h-2.5 w-2.5 rounded-[3px] ${getColor(c)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-zinc-700"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          {tooltip.date}: {tooltip.count} word{tooltip.count === 1 ? "" : "s"}
        </div>
      )}
    </section>
  );
}
