"use client";

import { create } from "zustand";

export type ProfileData = {
  id: number;
  name: string | null;
  user_name: string;
  email: string;
  image: string | null;
  institutionName: string | null;
  bio: string | null;
  class: string | null;
  gender: string | null;
  socialLinks: string[];
};

interface ProfileState {
  profile: ProfileData | null;
  loaded: boolean;
  setProfile: (profile: ProfileData | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loaded: false,
  setProfile: (profile) => set({ profile, loaded: true }),
}));

export function useProfile(): ProfileData | null {
  return useProfileStore((s) => s.profile);
}