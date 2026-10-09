"use client";

import { useRouter } from "next/navigation";
import { PaginationNav } from "@/components/pagination-nav";

export function NewsPagination({
  page,
  totalPages,
  basePath = "/news",
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  const router = useRouter();

  function go(p: number) {
    if (p <= 1) {
      router.push(basePath);
    } else {
      router.push(`${basePath}?page=${p}`);
    }
  }

  return <PaginationNav page={page} totalPages={totalPages} onPageChange={go} />;
}