"use client";

import dynamic from "next/dynamic";

function EditorLoading() {
  return (
    <div className="space-y-3 py-4" aria-hidden="true">
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
    </div>
  );
}

export const NoteBlockEditorDynamic = dynamic(
  () => import("./note-block-editor").then((mod) => mod.NoteBlockEditor),
  { ssr: false, loading: () => <EditorLoading /> }
);
