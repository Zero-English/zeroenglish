"use client";

import dynamic from "next/dynamic";

export const BlockNoteEditorDynamic = dynamic(
  () => import("./blocknote-editor").then((m) => m.BlockNoteEditor),
  { ssr: false },
);