"use client";

import dynamic from "next/dynamic";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { closeNotesDialog, useNotesDialogStore } from "@/lib/notes-dialog";

function NotesDialogLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-md space-y-3 px-6" aria-hidden="true">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

const NotesWorkspace = dynamic(
  () =>
    import("@/components/notes/notes-workspace").then(
      (mod) => mod.NotesWorkspace
    ),
  {
    ssr: false,
    loading: () => <NotesDialogLoading />,
  }
);

export function NotesDialog() {
  const open = useNotesDialogStore((state) => state.open);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeNotesDialog();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[92dvh] max-h-[92dvh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:h-[85dvh] sm:max-h-[85dvh] lg:max-w-6xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>আমার নোট / My Notes</DialogTitle>
          <DialogDescription>
            আপনার ব্যক্তিগত পড়ার নোটবুক। এখানে নোট লিখুন, খুঁজুন এবং সংরক্ষণ
            করুন। Your private study notebook — write, search and save notes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <NotesWorkspace onClose={closeNotesDialog} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
