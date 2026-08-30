"use client";

import { BindAccount } from "@/components/bind-account";
import { useAuthStore } from "@/lib/auth-store";

export function ProfileAuthBanner() {
  const status = useAuthStore((s) => s.status);

  if (status !== "guest") return null;

  return <BindAccount />;
}