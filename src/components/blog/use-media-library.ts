"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PickerMedia = {
  id: number;
  url: string;
  name: string;
  altText: string;
  mimeType: string;
};

export const MEDIA_PAGE_LIMIT = 12;

export function thumbnailUrl(url: string, mimeType: string) {
  return mimeType === "image/svg+xml" ? url : `${url}?tr=w-320,h-320`;
}

export function useMediaLibrary(enabled: boolean) {
  const [media, setMedia] = useState<PickerMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(MEDIA_PAGE_LIMIT),
    });
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
    if (!enabled) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, page, debouncedSearch]);

  return {
    media,
    loading,
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
  };
}