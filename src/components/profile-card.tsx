"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Globe,
  ShieldCheck,
  Settings,
  Building2,
  GraduationCap,
  User as UserIcon,
  Link2,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuthStore } from "@/lib/auth-store";
import { useProfileStore, type ProfileData } from "@/lib/profile-store";
import { SyncStatus } from "@/components/sync-status";
import { useT } from "@/components/language-provider";
import { setActiveTab } from "@/lib/profile-tab-store";
import { useLearnedWords } from "@/lib/use-learned-words";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

export function ProfileBentoIdentity({
  totalWords = 0,
}: {
  totalWords?: number;
}) {
  const status = useAuthStore((s) => s.status);
  const { data: session } = useSession();
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [error, setError] = useState(false);
  const { learnedIds, loaded: learnedLoaded } = useLearnedWords();

  const totalLearned = learnedIds.size;
  const overallPct = totalWords > 0 ? Math.min(100, Math.round((totalLearned / totalWords) * 100)) : 0;

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

  const user = session?.user;
  const isGoogle = status === "google" && !!user;
  const isAdmin = user?.role === "admin";
  const displayName = isGoogle ? user.name || "Learner" : t("অতিথি শিক্ষার্থী", "Guest Learner");
  const displayEmail = isGoogle ? user.email || user.name : t("ডিভাইস লোকাল প্রোফাইল", "Device Local Account");

  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - overallPct / 100);

  return (
    <div className={cn(CARD, "h-full p-4 sm:p-6 flex flex-col justify-between")}>
      <div>
        {/* Top Split: User Avatar + Name & Mastery Ring */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-border/60">
          {/* User Details */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="rounded-full ring-2 ring-primary/20 p-0.5">
                <UserAvatar
                  id={user?.id ?? 0}
                  name={displayName}
                  userName={displayName}
                  image={user?.image}
                  size="lg"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs ring-2 ring-background">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:size-3.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="truncate text-base sm:text-xl font-semibold text-foreground tracking-tight">
                  {displayName}
                </h2>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground border border-border/80 transition-colors"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {t("অ্যাডমিন", "Admin")}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] sm:text-xs font-medium text-muted-foreground border border-border/60">
                    <Award className="h-3 w-3" />
                    {t("শিক্ষার্থী", "Learner")}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs sm:text-sm text-muted-foreground font-normal">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Circular Mastery Meter */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0">
              <svg width="56" height="56" viewBox="0 0 80 80" className="-rotate-90 sm:w-16 sm:h-16">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  strokeWidth="6"
                  className="stroke-muted"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={learnedLoaded ? offset : circumference}
                  strokeLinecap="round"
                  className="stroke-primary transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold tabular-nums text-foreground">
                  {learnedLoaded ? `${overallPct}%` : "…"}
                </span>
              </div>
            </div>
            <div className="min-w-0 pr-1 text-right sm:text-left">
              <div className="text-[11px] font-medium text-muted-foreground">
                {t("সামগ্রিক দক্ষতা", "Overall Mastery")}
              </div>
              <div className="text-sm font-bold tabular-nums text-foreground">
                {learnedLoaded ? `${totalLearned} / ${totalWords}` : "…"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {t("শব্দ আয়ত্ত হয়েছে", "words mastered")}
              </div>
            </div>
          </div>
        </div>

        {/* Academic & Attribute Tags */}
        <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {profile?.institutionName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border/60 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-foreground">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate max-w-[180px] sm:max-w-none">{profile.institutionName}</span>
            </span>
          )}
          {profile?.class && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border/60 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
              {profile.class}
            </span>
          )}
          {profile?.gender && profile.gender !== "NOT_SET" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border/60 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-foreground">
              <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {t(
                profile.gender === "MALE" ? "পুরুষ" : "মহিলা",
                profile.gender === "MALE" ? "Male" : "Female"
              )}
            </span>
          )}

          {isGoogle && (
            <Link
              href={`/profile/${user.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted shadow-2xs transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              {t("পাবলিক প্রোফাইল", "Public Profile")}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted shadow-2xs transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            {t("সেটিংস", "Settings")}
          </button>
        </div>

        {/* Bio & Social Links */}
        {profile?.bio && (
          <p className="mt-3 text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2">
            {profile.bio}
          </p>
        )}

        {profile && profile.socialLinks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {profile.socialLinks.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline transition-colors"
              >
                <Link2 className="h-3 w-3" />
                {safeHostname(link)}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between flex-wrap gap-2">
        <SyncStatus />
      </div>
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

export function ProfileCard() {
  return null;
}