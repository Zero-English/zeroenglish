"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PaginationNav } from "@/components/pagination-nav";

export function WrittenPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    const qs = params.toString();
    router.push(qs ? `/written?${qs}` : "/written");
  }

  return <PaginationNav page={page} totalPages={totalPages} onPageChange={go} />;
}
