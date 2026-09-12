"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationNav } from "@/components/pagination-nav";

type PickerMedia = {
  id: number;
  url: string;
  name: string;
  altText: string;
  mimeType: string;
};

const PAGE_LIMIT = 12;

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: PickerMedia) => void;
}) {
  const [media, setMedia] = useState<PickerMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const requestId = useRef(0);

  const thumbnailUrl = (url: string, mimeType: string) =>
    mimeType === "image/svg+xml" ? url : `${url}?tr=w-320,h-320`;

  const load = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/v1/media?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (requestId.current !== id) return;
        if (json.success && Array.isArray(json.data)) {
          setMedia(json.data);
          setTotalPages(json.pagination?.totalPages ?? 1);
          setTotal(json.pagination?.total ?? 0);
        } else {
          setMedia([]);
        }
      })
      .catch(() => {
        if (requestId.current === id) setMedia([]);
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, open]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Choose an image</DialogTitle>
          <DialogDescription>Pick a cover image from the media library.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media..."
            className="pl-8"
          />
        </div>

        <div className="max-h-[46vh] overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-14 text-center dark:border-gray-700">
              <ImageIcon className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No images found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 transition-colors hover:border-primary/50 focus:border-primary focus:outline-none"
                  title={item.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl(item.url, item.mimeType)}
                    alt={item.altText || item.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <p className="truncate px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {item.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {!loading && total > PAGE_LIMIT && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {total} image{total === 1 ? "" : "s"}
            </span>
            <PaginationNav page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}