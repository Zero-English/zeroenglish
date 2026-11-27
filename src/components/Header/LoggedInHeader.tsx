"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  ChevronLeft,
  LayoutDashboard,
  User,
  NotebookPen,
  GraduationCap,
  Trophy,
  SquarePen,
  Shield,
  LogOut,
  X,
  Languages,
  Sun,
  Moon,
  BookOpen,
  PenTool,
  BrainCircuit,
} from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { useAuthStore } from "@/lib/auth-store";
import { openNotesDialog } from "@/lib/notes-dialog";
import { getHeaderPage } from "@/lib/header-page";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import logo from "@/public/assets/logo/main-logo.webp";

export function LoggedInHeader() {
  const { data: session } = useSession();
  const logout = useAuthStore((s) => s.logout);
  const { lang, toggleLanguage } = useLanguage();
  const { theme, setTheme, systemTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const canContribute = user?.role === "admin" || user?.role === "contributor";
  const currentTheme = theme === "system" ? systemTheme : theme;

  const headerPage = getHeaderPage(pathname);
  const isDashboard = pathname === "/dashboard" || pathname === "/";

  // Resolve hierarchy navigation
  const backHref =
    headerPage?.parentHref ?? (isDashboard ? null : "/dashboard");
  const backLabel =
    lang === "en"
      ? (headerPage?.parentTitleEn ?? "Dashboard")
      : (headerPage?.parentTitleBn ?? "ড্যাশবোর্ড");

  const currentTitle = headerPage
    ? lang === "en"
      ? headerPage.titleEn
      : headerPage.titleBn
    : isDashboard
      ? lang === "en"
        ? "Dashboard"
        : "ড্যাশবোর্ড"
      : "Zero English";

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    logout();
    await Promise.allSettled([
      fetch("/api/v1/auth/logout", { method: "POST" }),
      signOut({ redirect: false }),
    ]);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 select-none border-b border-black/[0.06] bg-white/90 backdrop-blur-xl backdrop-saturate-150 transition-colors dark:border-white/[0.08] dark:bg-[#0c0c0e]/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
        {/* LEFT ZONE: Back / Parent Link (min-w-[80px]) */}
        <div className="flex min-w-[80px] sm:min-w-[120px] items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 -ml-1 py-1.5 pr-2 text-xs font-semibold text-[#242423] transition-colors hover:text-primary active:scale-95 dark:text-[#f3f3f2]"
              aria-label={`Back to ${backLabel}`}
            >
              <ChevronLeft className="size-4 shrink-0 text-primary" />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">
                {backLabel}
              </span>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-transform hover:opacity-90 active:scale-95"
            >
              <Image
                src={logo}
                alt="Zero English"
                className="h-5 w-auto dark:brightness-0 dark:invert"
                priority
              />
            </Link>
          )}
        </div>

        {/* CENTER ZONE: Navigation Hierarchy (Truncate & Centered) */}
        <div className="flex-1 min-w-0 px-2 text-center flex items-center justify-center">
          <div className="truncate text-xs sm:text-[13px] font-semibold text-foreground">
            {currentTitle}
          </div>
        </div>

        {/* RIGHT ZONE: Quick Tools & Menu (min-w-[80px]) */}
        <div className="flex min-w-[80px] sm:min-w-[120px] items-center justify-end gap-1.5 sm:gap-2">
          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={lang === "bn" ? "Switch to English" : "Switch to Bangla"}
            className="hidden sm:inline-flex h-8 items-center gap-1 rounded-lg bg-[#f1f1ef] px-2 text-xs font-semibold text-[#242423] transition-all hover:bg-[#e7e7e4] active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]"
          >
            <Languages className="size-3" />
            <span>{lang === "bn" ? "বাং" : "EN"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hidden sm:flex size-8 items-center justify-center rounded-lg bg-[#f1f1ef] text-[#242423] transition-all hover:bg-[#e7e7e4] active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]"
          >
            {currentTheme === "dark" ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
          </button>

          {/* Desktop Profile Dropdown */}
          {user && (
            <div className="hidden md:inline-flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="User profile menu"
                    className="relative size-8 shrink-0 overflow-hidden rounded-full ring-2 ring-black/[0.06] transition-all hover:ring-black/20 active:scale-95 dark:ring-white/[0.1] dark:hover:ring-white/30"
                  >
                    <UserAvatar
                      id={(user as { id?: number }).id ?? 1}
                      name={user.name}
                      userName={user.name}
                      image={user.image}
                      size="sm"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-56 rounded-[22px] border border-black/[0.06] bg-white/95 p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_24px_48px_-12px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#1c1c1e]/95"
                >
                  <div className="rounded-[16px] bg-[#f1f1ef] p-2.5 dark:bg-[#252528]">
                    <p className="truncate text-xs font-bold text-[#242423] dark:text-[#f3f3f2]">
                      {user.name || "Learner"}
                    </p>
                    {user.email && (
                      <p className="truncate text-[11px] text-[#242423]/60 dark:text-zinc-400">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-black/[0.06] dark:bg-white/[0.08]" />
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>{lang === "en" ? "Dashboard" : "ড্যাশবোর্ড"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer"
                  >
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <User className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>{lang === "en" ? "My Profile" : "প্রোফাইল"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openNotesDialog()}
                    className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2.5"
                  >
                    <NotebookPen className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                    <span>{lang === "en" ? "My Notes" : "আমার নোট"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer"
                  >
                    <Link
                      href="/profile?tab=learned&type=grammar"
                      className="flex items-center gap-2.5"
                    >
                      <GraduationCap className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>
                        {lang === "en"
                          ? "My Grammar Rules"
                          : "আমার ব্যাকরণ রুলস"}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer"
                  >
                    <Link
                      href="/leaderboard"
                      className="flex items-center gap-2.5"
                    >
                      <Trophy className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>
                        {lang === "en" ? "Leaderboard" : "লিডারবোর্ড"}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  {canContribute && (
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer"
                    >
                      <Link
                        href="/contribute"
                        className="flex items-center gap-2.5"
                      >
                        <SquarePen className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                        <span>
                          {lang === "en" ? "Contribute" : "কন্ট্রিবিউট"}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer"
                    >
                      <Link href="/admin" className="flex items-center gap-2.5">
                        <Shield className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                        <span>
                          {lang === "en" ? "Admin Panel" : "অ্যাডমিন প্যানেল"}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-black/[0.06] dark:bg-white/[0.08]" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    variant="destructive"
                    className="rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer gap-2.5 text-rose-600 focus:text-rose-600 dark:text-rose-400"
                  >
                    <LogOut className="size-3.5" />
                    <span>{lang === "en" ? "Sign out" : "লগ আউট"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Menu Sheet Trigger (Mobile & Compact) */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f1ef] px-2.5 text-xs font-semibold text-[#242423] transition-all hover:bg-[#e7e7e4] active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]"
              >
                <span>{lang === "en" ? "Menu" : "মেনু"}</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-80 flex-col gap-0 border-l border-black/[0.06] bg-white/95 p-0 text-[#242423] shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#1c1c1e]/95 dark:text-[#f3f3f2]"
              showCloseButton={false}
            >
              {/* Sheet Header Module */}
              <div className="m-3 flex items-center justify-between rounded-[20px] bg-[#f1f1ef] p-3 dark:bg-[#252528]">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user ? (
                    <UserAvatar
                      id={(user as { id?: number }).id ?? 1}
                      name={user.name}
                      userName={user.name}
                      image={user.image}
                      size="sm"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      ZE
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#242423] dark:text-[#f3f3f2]">
                      {user?.name || "Learner"}
                    </p>
                    <p className="truncate text-[10px] text-[#242423]/60 dark:text-zinc-400">
                      {user?.email || "Zero English"}
                    </p>
                  </div>
                </div>
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#242423] shadow-xs transition-all hover:bg-zinc-100 active:scale-95 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:hover:bg-zinc-800"
                  >
                    <X className="size-3.5" />
                  </button>
                </SheetClose>
              </div>

              {/* Navigation Hierarchy Modules */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                <SheetTitle className="sr-only">
                  {lang === "en" ? "App Navigation" : "অ্যাপ নেভিগেশন"}
                </SheetTitle>

                {/* Main Hubs */}
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      pathname === "/dashboard"
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "text-[#242423]/80 hover:bg-[#f1f1ef] dark:text-zinc-200 dark:hover:bg-[#252528]",
                    )}
                  >
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>{lang === "en" ? "Dashboard" : "ড্যাশবোর্ড"}</span>
                  </Link>

                  <Link
                    href="/vocabulary"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      pathname.startsWith("/vocabulary")
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "text-[#242423]/80 hover:bg-[#f1f1ef] dark:text-zinc-200 dark:hover:bg-[#252528]",
                    )}
                  >
                    <BookOpen className="size-4 shrink-0" />
                    <span>{lang === "en" ? "Vocabulary" : "শব্দভাণ্ডার"}</span>
                  </Link>

                  <Link
                    href="/grammar"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      pathname.startsWith("/grammar")
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "text-[#242423]/80 hover:bg-[#f1f1ef] dark:text-zinc-200 dark:hover:bg-[#252528]",
                    )}
                  >
                    <GraduationCap className="size-4 shrink-0" />
                    <span>
                      {lang === "en" ? "Grammar Lessons" : "গ্রামার লেসন"}
                    </span>
                  </Link>

                  <Link
                    href="/written"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      pathname.startsWith("/written")
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "text-[#242423]/80 hover:bg-[#f1f1ef] dark:text-zinc-200 dark:hover:bg-[#252528]",
                    )}
                  >
                    <PenTool className="size-4 shrink-0" />
                    <span>
                      {lang === "en" ? "Written Practice" : "লিখিত প্রস্তুতি"}
                    </span>
                  </Link>

                  <Link
                    href="/quiz/daily"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      pathname.startsWith("/quiz")
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "text-[#242423]/80 hover:bg-[#f1f1ef] dark:text-zinc-200 dark:hover:bg-[#252528]",
                    )}
                  >
                    <BrainCircuit className="size-4 shrink-0" />
                    <span>
                      {lang === "en"
                        ? "Daily Quiz & Exams"
                        : "দৈনিক কুইজ ও পরীক্ষা"}
                    </span>
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      pathname === "/leaderboard"
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "text-[#242423]/80 hover:bg-[#f1f1ef] dark:text-zinc-200 dark:hover:bg-[#252528]",
                    )}
                  >
                    <Trophy className="size-4 shrink-0" />
                    <span>{lang === "en" ? "Leaderboard" : "লিডারবোর্ড"}</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      pathname === "/profile"
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "text-[#242423]/80 hover:bg-[#f1f1ef] dark:text-zinc-200 dark:hover:bg-[#252528]",
                    )}
                  >
                    <User className="size-4 shrink-0" />
                    <span>
                      {lang === "en" ? "My Profile" : "আমার প্রোফাইল"}
                    </span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
                    >
                      <Shield className="size-4 shrink-0" />
                      <span>
                        {lang === "en" ? "Admin Panel" : "অ্যাডমিন প্যানেল"}
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Sheet Footer Module */}
              <div className="m-3 rounded-[22px] bg-[#f1f1ef] p-3 dark:bg-[#252528] space-y-2">
                <div className="flex items-center justify-between gap-2 px-1">
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#242423]/70 hover:bg-white active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-[#1c1c1e]"
                  >
                    <Languages className="size-3.5" />
                    <span>{lang === "bn" ? "বাংলা" : "English"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#242423]/70 hover:bg-white active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-[#1c1c1e]"
                  >
                    {currentTheme === "dark" ? (
                      <Sun className="size-3.5" />
                    ) : (
                      <Moon className="size-3.5" />
                    )}
                    <span>{currentTheme === "dark" ? "Light" : "Dark"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-500/20 active:scale-95 dark:text-rose-400"
                >
                  <LogOut className="size-3.5" />
                  <span>{lang === "en" ? "Sign out" : "লগ আউট"}</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
