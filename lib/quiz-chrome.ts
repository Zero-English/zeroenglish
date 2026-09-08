"use client";

import { create } from "zustand";

interface QuizChromeState {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

export const useQuizChrome = create<QuizChromeState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));