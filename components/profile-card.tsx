"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuthStore } from "@/lib/auth-store";

export function ProfileCard() {
  const status = useAuthStore((s) => s.status);
  const { data: session } = useSession();

  if (status !== "google" || !session?.user) return null;

  const user = session.user;
  const isAdmin = user.role === "admin";

  return (
    <div className="mb-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[1.01] active:shadow-lg active:border-zinc-300 dark:active:border-zinc-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <UserAvatar
            id={user.id ?? 0}
            name={user.name}
            userName={user.name}
            image={user.image}
            size="lg"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {user.name || "User"}
              </h2>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-colors"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </Link>
              ) : (
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  User
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
              {user.email || user.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
