import { Skeleton } from "@/components/ui/skeleton";

export default function LearningEventsListLoading() {
  return (
    <div className="p-4 lg:p-8">
      <Skeleton className="mb-6 h-4 w-40" />

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="px-4 py-2.5">
                    <Skeleton className="h-3 w-14" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, r) => (
                <tr
                  key={r}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800/60"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-4 w-9" />
                  </td>
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-4 w-32" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}