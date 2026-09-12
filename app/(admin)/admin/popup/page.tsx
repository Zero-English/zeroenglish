"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Plus, Pencil, Trash2, RotateCcw, CalendarClock, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BackButton } from "@/components/back-button";
import { PaginationNav } from "@/components/pagination-nav";
import { thumbnailUrl } from "@/components/blog/use-media-library";
import {
  popupAnimationLabelMap,
  popupAudienceLabelMap,
  popupPageRuleLabelMap,
  type PopupDetail,
  type PopupItem,
  type PopupListResponse,
} from "../_data/popups";
import { PopupFormDialog, type PopupPayload } from "./popup-form-dialog";

const PAGE_SIZES = [10, 20, 50, 100];

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminPopupsPage() {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PopupDetail | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [popupToDelete, setPopupToDelete] = useState<PopupItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPopups = useCallback(() => {
    const id = ++requestId.current;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });
    if (search.trim()) params.set("search", search.trim());

    fetch(`/api/v1/popup?${params.toString()}`)
      .then((res) => res.json())
      .then((result: PopupListResponse) => {
        if (requestId.current !== id) return;
        setLoading(false);
        if (!result.success) {
          notify(result.message || "Failed to load popups");
          return;
        }
        setPopups(result.data || []);
        setTotal(result.pagination?.total ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 1);
      })
      .catch(() => {
        if (requestId.current !== id) return;
        setLoading(false);
        notify("Failed to load popups");
      });
  }, [page, pageSize, search]);

  useEffect(() => {
    loadPopups();
  }, [loadPopups, refreshKey]);

  function notify(msg: string) {
    setMessage(msg);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 2500);
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  async function openEdit(popup: PopupItem) {
    try {
      const res = await fetch(`/api/v1/popup/${popup.id}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEditing(json.data as PopupDetail);
        setFormOpen(true);
      } else {
        notify(json.message || "Failed to load popup");
      }
    } catch {
      notify("Failed to load popup");
    }
  }

  async function handleSave(payload: PopupPayload) {
    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/v1/popup/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/v1/popup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json();
      if (json.success) {
        setFormOpen(false);
        setEditing(null);
        setRefreshKey((k) => k + 1);
        notify(editing ? "Popup updated" : "Popup created");
      } else {
        notify(json.message || "Failed to save popup");
      }
    } catch {
      notify("Failed to save popup");
    }
  }

  function handleDelete(popup: PopupItem) {
    setPopupToDelete(popup);
    setDeleteDialogOpen(true);
  }

  async function confirmDeletePopup() {
    if (!popupToDelete) return;
    try {
      const res = await fetch(`/api/v1/popup/${popupToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setPopups((prev) => prev.filter((x) => x.id !== popupToDelete.id));
        setTotal((prev) => Math.max(0, prev - 1));
        notify("Popup deleted");
      } else {
        notify(json.message || "Failed to delete popup");
      }
    } catch {
      notify("Failed to delete popup");
    }
    setPopupToDelete(null);
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="p-3 lg:p-4">
      <BackButton />
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `Manage popups (${total} popups)`}
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>
            <Plus />
            Create Popup
          </Button>
        </div>
      </header>

      {message && (
        <div className="mb-4 inline-flex rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Toolbar / Filters */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name..."
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={!searchInput}
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Images</th>
                <th className="px-4 py-2.5 font-medium">Audience</th>
                <th className="px-4 py-2.5 font-medium">Page rule</th>
                <th className="px-4 py-2.5 font-medium">Schedule</th>
                <th className="px-4 py-2.5 font-medium">Animation</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-6" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-10 w-16 rounded" />
                        <Skeleton className="h-10 w-8 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-14" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-16" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && popups.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <Megaphone className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    No popups found. Create your first popup to get started.
                  </td>
                </tr>
              )}

              {popups.map((popup) => (
                <tr
                  key={popup.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400">{popup.id}</td>
                  <td className="px-4 py-2.5 max-w-sm">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {popup.name}
                    </p>
                    {popup.link && (
                      <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                        {popup.link}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {popup.landscapeMedia ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnailUrl(
                            popup.landscapeMedia.url,
                            popup.landscapeMedia.mimeType
                          )}
                          alt={popup.landscapeMedia.name}
                          className="h-10 w-16 rounded object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-16 items-center justify-center rounded bg-gray-100 text-[0.625rem] text-gray-400 dark:bg-gray-800">
                          —
                        </span>
                      )}
                      {popup.portraitMedia ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnailUrl(
                            popup.portraitMedia.url,
                            popup.portraitMedia.mimeType
                          )}
                          alt={popup.portraitMedia.name}
                          className="h-10 w-8 rounded object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-8 items-center justify-center rounded bg-gray-100 text-[0.625rem] text-gray-400 dark:bg-gray-800">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge>{popupAudienceLabelMap[popup.audience]}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="primary">
                      {popupPageRuleLabelMap[popup.pageRule]}
                    </Badge>
                    {popup.pageRule === "SPECIFIC_PATHS" &&
                      popup.includePaths.length > 0 && (
                        <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                          {popup.includePaths.join(", ")}
                        </p>
                      )}
                  </td>
                  <td className="px-4 py-2.5">
                    {popup.scheduleEnabled ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                        <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                        Scheduled
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Always on
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {popupAnimationLabelMap[popup.animation]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        popup.active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {popup.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {formatDate(popup.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(popup)}
                        title="Edit"
                        aria-label={`Edit popup ${popup.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(popup)}
                        title="Delete"
                        aria-label={`Delete popup ${popup.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <label htmlFor="page-size" className="shrink-0">
              Rows per page
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
              {loading ? (
                <Skeleton className="inline-block h-3.5 w-32 align-middle" />
              ) : total === 0 ? (
                "No results"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {start}-{end}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {total}
                  </span>
                </>
              )}
            </span>
          </div>
          <PaginationNav
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <PopupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Popup"
        description={
          popupToDelete
            ? `Are you sure you want to delete "${popupToDelete.name}"? Linked images are not deleted and this action cannot be undone.`
            : "Are you sure you want to delete this popup? This action cannot be undone."
        }
        confirmText="Delete Popup"
        onConfirm={confirmDeletePopup}
      />
    </div>
  );
}