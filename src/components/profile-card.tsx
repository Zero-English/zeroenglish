"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Globe, ShieldCheck, Settings, Building2, GraduationCap, User, Link2, Sparkles } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuthStore } from "@/lib/auth-store";
import { useProfileStore, type ProfileData } from "@/lib/profile-store";
import { SyncStatus } from "@/components/sync-status";
import { useT } from "@/components/language-provider";
import { setActiveTab } from "@/lib/profile-tab-store";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

export function ProfileCard() {
  const status = useAuthStore((s) => s.status);
  const { data: session } = useSession();
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status !== "google") return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/profile", { cache: "no-store" });
        const body = (await res.json()) as {
          success: boolean;
          data?: ProfileData | null;
        };
        if (!cancelled && body.success && body.data) setProfile(body.data);
        else if (!cancelled) setError(true);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, setProfile]);

  if (status !== "google" || !session?.user) return null;

  const user = session.user;
  const isAdmin = user.role === "admin";
  const hasDetails =
    profile &&
    (profile.institutionName ||
      profile.class ||
      (profile.gender && profile.gender !== "NOT_SET") ||
      profile.bio ||
      profile.socialLinks.length > 0);

  return (
    <div className={cn(CARD, "mb-6 p-5 sm:p-6 transition-all duration-300 hover:border-black/[0.12] dark:hover:border-white/[0.15]")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar
              id={user.id ?? 0}
              name={user.name}
              userName={user.name}
              image={user.image}
              size="lg"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {user.name || "User"}
              </h2>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60 transition-colors"
                >
                  <ShieldCheck className="h-3 w-3" />
                  {t("অ্যাডমিন", "Admin")}
                </Link>
              ) : (
                <span className="inline-flex items-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-black/[0.05] dark:border-white/[0.08]">
                  {t("শিক্ষার্থী", "Learner")}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {user.email || user.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {profile && profile.institutionName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
              <Building2 className="h-3.5 w-3.5" />
              {profile.institutionName}
            </span>
          )}
          {profile && profile.class && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
              <GraduationCap className="h-3.5 w-3.5" />
              {profile.class}
            </span>
          )}
          {profile && profile.gender && profile.gender !== "NOT_SET" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
              <User className="h-3.5 w-3.5" />
              {t(
                profile.gender === "MALE" ? "পুরুষ" : "মহিলা",
                profile.gender === "MALE" ? "Male" : "Female"
              )}
            </span>
          )}
          <Link
            href={`/profile/${user.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-white/50 dark:bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {t("পাবলিক প্রোফাইল", "Public Profile")}
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-white/50 dark:bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            {t("সেটিংস", "Settings")}
          </button>
        </div>
      </div>

      {hasDetails && (
        <div className="mt-4 border-t border-black/[0.06] dark:border-white/[0.08] pt-4">
          {profile?.bio && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </p>
          )}
          {profile && profile.socialLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {profile.socialLinks.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {safeHostname(link)}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          {t("প্রোফাইল তথ্য লোড করা যায়নি।", "Could not load profile details.")}
        </p>
      )}

      <SyncStatus />
    </div>
  );
}

function safeHostname(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}