"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalStorage } from "./state-storage";

interface ProfileTabState {
  activeTab: string;
}

export const useProfileTabStore = create<ProfileTabState>()(
  persist(
    () => ({ activeTab: "overview" }),
    {
      name: "profile-tab",
      storage: createLocalStorage<ProfileTabState>(),
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);

export function setActiveTab(tab: string): void {
  useProfileTabStore.setState({ activeTab: tab });
}

export function useActiveTab(): string {
  return useProfileTabStore((s) => s.activeTab);
}
