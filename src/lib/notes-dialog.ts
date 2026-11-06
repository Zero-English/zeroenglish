"use client";

import { create } from "zustand";
import { requestLogin } from "@/lib/login-required";

interface NotesDialogState {
  open: boolean;
}

export const useNotesDialogStore = create<NotesDialogState>(() => ({
  open: false,
}));

/** Opens the notes dialog, routing visitors to the login drawer first. */
export function openNotesDialog(): void {
  if (requestLogin()) return;
  useNotesDialogStore.setState({ open: true });
}

export function closeNotesDialog(): void {
  useNotesDialogStore.setState({ open: false });
}
