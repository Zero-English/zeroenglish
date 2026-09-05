"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Pencil,
  Trash2,
  Ban,
} from "lucide-react";
import type { ApiUser, UserListResponse } from "./types";
import { UserAvatar } from "@/components/UserAvatar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BackButton } from "@/components/back-button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationNav } from "@/components/pagination-nav";

const PAGE_SIZES = [10, 20, 50];

const RICH = {
  stillLearning: [2, 5, 9, 14, 20, 28, 35, 41, 50, 58, 63, 72, 80, 91, 100],
  learned: [4, 6, 10, 15, 22, 30, 38, 46, 53, 60, 68, 75, 82, 90, 98],
  quizResult: 78,
  status: "Active" as const,
};

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/user?page=${page}&limit=${pageSize}`)
      .then((res) => res.json())
      .then((result: UserListResponse) => {
        if (cancelled) return;
        setLoading(false);
        if (!result.success) {
          setError(result.message || "Failed to load users");
          return;
        }
        setUsers(result.data || []);
        setTotal(result.pagination?.total ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 1);
        setSelected(new Set());
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError("Failed to load users");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  const selectedList: ApiUser[] = useMemo(
    () => users.filter((u) => selected.has(u.id)),
    [users, selected]
  );

  const allOnPageSelected =
    users.length > 0 && users.every((u) => selected.has(u.id));
  const someOnPageSelected =
    users.some((u) => selected.has(u.id)) && !allOnPageSelected;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        users.forEach((u) => next.delete(u.id));
      } else {
        users.forEach((u) => next.add(u.id));
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

  function clearSelection() {
    setSelected(new Set());
  }

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  }

  function editUser(user: ApiUser) {
    showMessage(`Edit user opened for ${user.user_name} (id: ${user.id})`);
  }

  function emailUser(user: ApiUser) {
    showMessage(`Email draft opened for ${user.user_name} (${user.email})`);
  }

  function suspendUser(user: ApiUser) {
    const isActive = RICH.status === "Active";
    showMessage(
      `${user.user_name} (id: ${user.id}) is now ${isActive ? "suspended" : "reactivated"}`
    );
  }

  function deleteUser(user: ApiUser) {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }

  function confirmDeleteUser() {
    if (!userToDelete) return;
    showMessage(`Deleted user ${userToDelete.user_name} (id: ${userToDelete.id})`);
    setUserToDelete(null);
  }

  function bulkEmail() {
    showMessage(`Email draft opened for ${selectedList.length} selected user(s)`);
  }

  function bulkSuspend() {
    showMessage(`Suspend action applied to ${selectedList.length} selected user(s)`);
  }

  function bulkDelete() {
    setBulkDeleteDialogOpen(true);
  }

  function confirmBulkDelete() {
    showMessage(`Deleted ${selectedList.length} selected user(s)`);
    setSelected(new Set());
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="p-4 lg:p-8">
      <BackButton />
      <header className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All registered users ({total})
        </p>
        {message && (
          <div className="mt-3 inline-flex rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
            {message}
          </div>
        )}
      </header>

      {selectedList.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{selectedList.length}</span>{" "}
            selected
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
              onClick={bulkEmail}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
            <button
              type="button"
              onClick={bulkSuspend}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <Ban className="h-3.5 w-3.5" />
              Suspend
            </button>
            <button
              type="button"
              onClick={bulkDelete}
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
                <th className="px-4 py-2.5 font-medium">Joined</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {Array.from({ length: 8 }).map((_, r) => (
                    <tr
                      key={r}
                      className="border-b border-gray-100 dark:border-gray-800/60"
                    >
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      {Array.from({ length: 6 }).map((_, c) => (
                        <td key={c} className="px-4 py-3">
                          <Skeleton className="h-4 w-12" />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-6" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-6" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-8 w-6" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : error ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-rose-600 dark:text-rose-400">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  return (
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
                          aria-label={`Select ${user.user_name}`}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          <UserAvatar
                            id={user.id}
                            name={user.name}
                            userName={user.user_name}
                            image={user.image}
                            size="sm"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.name || user.user_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                        {user.email.toLowerCase()}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {user.bookmarkedCount}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {RICH.stillLearning.length}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {RICH.learned.length}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            RICH.quizResult >= 80
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : RICH.quizResult >= 60
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                          }`}
                        >
                          {RICH.quizResult}%
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
                            RICH.status === "Active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {RICH.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => editUser(user)}
                            title="Edit"
                            aria-label={`Edit ${user.user_name}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => suspendUser(user)}
                            title={RICH.status === "Active" ? "Suspend" : "Reactivate"}
                            aria-label={`${RICH.status === "Active" ? "Suspend" : "Reactivate"} ${user.user_name}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => emailUser(user)}
                            title="Email"
                            aria-label={`Email ${user.user_name}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            title="Delete"
                            aria-label={`Delete ${user.user_name}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
            </select>
            <span>
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {total === 0 ? 0 : `${start}-${end}`}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {total}
              </span>
            </span>
          </div>
          <PaginationNav
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.user_name}? This action cannot be undone.`}
        confirmText="Delete User"
        onConfirm={confirmDeleteUser}
      />

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Users"
        description={`Are you sure you want to delete ${selectedList.length} selected user(s)? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}
