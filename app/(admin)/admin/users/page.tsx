"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Ban,
  Mail,
} from "lucide-react";
import { dummyUsers, type AdminUser } from "../_data/users";

const PAGE_SIZES = [10, 20, 50];

export default function AdminUsersPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(dummyUsers.length / pageSize);
  const currentUsers = useMemo(() => {
    if (pageSize === 0) return dummyUsers;
    return dummyUsers.slice((page - 1) * pageSize, page * pageSize);
  }, [page, pageSize]);

  const start = pageSize === 0 ? 1 : (page - 1) * pageSize + 1;
  const end = pageSize === 0 ? dummyUsers.length : Math.min(page * pageSize, dummyUsers.length);

  const allOnPageSelected =
    currentUsers.length > 0 &&
    currentUsers.every((u) => selected.has(u.id));
  const someOnPageSelected =
    currentUsers.some((u) => selected.has(u.id)) && !allOnPageSelected;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        currentUsers.forEach((u) => next.delete(u.id));
      } else {
        currentUsers.forEach((u) => next.add(u.id));
      }
      return next;
    });
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllAcrossPages() {
    setSelected(new Set(dummyUsers.map((u) => u.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  const selectedList: AdminUser[] = dummyUsers.filter((u) => selected.has(u.id));

  return (
    <div className="p-4 lg:p-8">
      <header className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All registered users ({dummyUsers.length})
        </p>
      </header>

      {selectedList.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{selectedList.length}</span>{" "}
            selected
            {selectedList.length < dummyUsers.length && (
              <button
                onClick={selectAllAcrossPages}
                className="ml-3 text-xs font-medium text-primary hover:underline"
              >
                Select all ({dummyUsers.length})
              </button>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={clearSelection}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <Ban className="h-3.5 w-3.5" />
              Suspend
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            All Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="w-12 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someOnPageSelected;
                    }}
                    onChange={toggleAll}
                    aria-label="Select all on page"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Bookmarked</th>
                <th className="px-4 py-2.5 font-medium">Still Learning</th>
                <th className="px-4 py-2.5 font-medium">Learned</th>
                <th className="px-4 py-2.5 font-medium">Quiz Result</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  className={`cursor-pointer border-b border-gray-100 last:border-0 transition-colors dark:border-gray-800 ${
                    selected.has(user.id)
                      ? "bg-primary/5"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggleOne(user.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${user.name}`}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${user.avatarColor}`}
                      >
                        {user.name.charAt(0)}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                    {user.bookmarked}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                    {user.stillLearning}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                    {user.learned}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.quizResult >= 80
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : user.quizResult >= 60
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                      }`}
                    >
                      {user.quizResult}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <label htmlFor="page-size" className="shrink-0">
              Show
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
              <option value={0}>All</option>
            </select>
            <span>
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {start}-{end}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {dummyUsers.length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
