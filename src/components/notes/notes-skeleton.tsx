"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function NotesListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 rounded-xl border border-border/60 bg-card p-3"
        >
          <Skeleton className="w-1 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NoteEditorSkeleton() {
  return (
    <div className="space-y-4 p-6" aria-hidden="true">
      <Skeleton className="h-8 w-3/5" />
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
