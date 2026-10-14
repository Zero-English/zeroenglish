"use client";

import { useSyncExternalStore, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import {
  Home,
  Search,
  User,
  BookOpenCheck,
  LibraryBig,
  Trophy,
  Newspaper,
  LogIn,
  LogOut,
  SquarePen,
  Languages,
  Sun,
  Moon,
  Shield,
  Info,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { useAuthStatus, useAuthStore } from "@/lib/auth-store";
import { useSelectedLevel } from "@/lib/level-store";
import { useLanguage } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import logo from "@/public/assets/logo/main-logo.webp";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 } as const;

export function Sidebar() {
  const hidden = useQuizChrome((s) => s.hidden);
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();
  const { status } = useAuthStatus();
  const { level } = useSelectedLevel();
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, setTheme, systemTheme } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const { data: session } = useSession();

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isLoggedIn = status !== "none";
  const user = session?.user;
  const canContribute =
    user?.role === "admin" || user?.role === "contributor";

  const vocabularyHref = isLoggedIn && level ? `/vocabulary/${level.toLowerCase()}` : "/vocabulary";

  const navLinks: { href: string; label: string; icon: typeof Home }[] = [
    { href: "/", label: t("হোম", "Home"), icon: Home },
    { href: vocabularyHref, label: t("শব্দভাণ্ডার", "Vocabulary"), icon: LibraryBig },
    { href: "/search", label: t("অনুসন্ধান", "Search"), icon: Search },
    { href: "/quiz", label: t("কুইজ", "Quiz"), icon: BookOpenCheck },
    { href: "/leaderboard", label: t("লিডারবোর্ড", "Leaderboard"), icon: Trophy },
    { href: "/news", label: t("নিউজ", "News"), icon: Newspaper },
    ...(canContribute
      ? [{ href: "/contribute", label: t("কন্ট্রিবিউট", "Contribute"), icon: SquarePen }]
      : []),
  ];

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    close();
    setProfileDrawerOpen(false);
    logout();
    await Promise.allSettled([
      fetch("/api/v1/auth/logout", { method: "POST" }),
      signOut({ redirect: false }),
    ]);
    router.push("/");
    router.refresh();
  };

  if (hidden) return null;

  const isProfileActive = pathname === "/profile" || pathname === "/login" || profileDrawerOpen;

  return (
    <>
      {/* Desktop Floating Bottom Dock */}
      <aside
        aria-label="Floating Navigation Dock"
        className="hidden md:flex fixed bottom-5 inset-x-0 mx-auto w-max z-40 pointer-events-none"
      >
        <div className="pointer-events-auto flex flex-row items-center gap-1.5 p-2 rounded-2xl border border-border/80 bg-background/85 dark:bg-card/75 backdrop-blur-xl shadow-2xl shadow-black/15 dark:shadow-black/35">
          {/* Dock Navigation Items */}
          <nav className="flex flex-row items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative flex size-11 items-center justify-center rounded-xl transition-all",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95"
                  )}
                  aria-label={link.label}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dock-active-pill-bottom"
                      transition={spring}
                      className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/20 shadow-xs"
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.2, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative z-10"
                  >
                    <link.icon className="size-5 shrink-0" />
                  </motion.div>

                  {/* Dock Tooltip positioned above */}
                  <span className="pointer-events-none absolute bottom-full mb-3 hidden group-hover:flex items-center rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95">
                    {link.label}
                  </span>
                </Link>
              );
            })}

            <Separator orientation="vertical" className="h-6 mx-0.5 bg-border/80" />

            {/* Profile Drawer Trigger Button in Dock */}
            <button
              type="button"
              onClick={() => setProfileDrawerOpen((prev) => !prev)}
              aria-label={t("প্রোফাইল ও মেনু", "Profile & Menu")}
              className={cn(
                "group relative flex size-11 items-center justify-center rounded-xl transition-all",
                isProfileActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95"
              )}
            >
              {isProfileActive && (
                <motion.span
                  layoutId="dock-active-pill-bottom"
                  transition={spring}
                  className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/20 shadow-xs"
                />
              )}
              <motion.div
                whileHover={{ scale: 1.2, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative z-10 flex items-center justify-center"
              >
                {isLoggedIn && user ? (
                  <UserAvatar
                    id={(user as { id?: number }).id ?? 1}
                    name={user.name}
                    userName={user.name}
                    image={user.image}
                    size="sm"
                    className="size-6 text-[11px]"
                  />
                ) : (
                  <User className="size-5 shrink-0" />
                )}
              </motion.div>

              {/* Dock Tooltip positioned above */}
              <span className="pointer-events-none absolute bottom-full mb-3 hidden group-hover:flex items-center rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95">
                {isLoggedIn ? t("প্রোফাইল ও মেনু", "Profile & Menu") : t("মেনু ও লগইন", "Menu & Login")}
              </span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile Drawer (Left Header Menu - Sheet) */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
        <SheetContent
          side="left"
          className="w-64 gap-0 p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
        >
          <SheetTitle className="sr-only">{t("নেভিগেশন মেনু", "Navigation Menu")}</SheetTitle>
          <div className="flex items-center p-4 border-b border-sidebar-border h-14">
            <Link
              href="/"
              onClick={close}
              className="flex items-center space-x-2"
            >
              <Image src={logo} alt="Zero English" className="h-5 w-auto dark:brightness-0 dark:invert" />
            </Link>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={cn(
                      "relative flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors gap-3 whitespace-nowrap",
                      isActive
                        ? "text-sidebar-accent-foreground font-semibold bg-sidebar-accent shadow-xs"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    <link.icon
                      className={cn(
                        "size-4 shrink-0 relative transition-colors",
                        isActive ? "text-primary" : "text-sidebar-foreground/70"
                      )}
                    />
                    <span className={cn("relative truncate", isActive && "text-foreground font-semibold")}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
            {isLoggedIn && (
              <div className="p-3">
                <Separator className="mb-3" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-xs font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors gap-3 whitespace-nowrap"
                >
                  <LogOut className="size-4 shrink-0" />
                  <span className="truncate">{t("লগ আউট", "Log out")}</span>
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Profile & Options Drawer (Right-side shadcn UI Vaul Drawer) */}
      <Drawer direction="right" open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen}>
        <DrawerContent className="h-full">
          <div className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="p-4 pb-2 border-b border-border/80">
              <DrawerTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <User className="size-4 text-primary" />
                <span>{t("প্রোফাইল ও মেনু", "Profile & Menu")}</span>
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                {t("প্রোফাইল, সেটিংস এবং প্রয়োজনীয় অপশনস", "Profile, settings and important options")}
              </DrawerDescription>
            </DrawerHeader>

            {/* User Status / Profile Card */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border/80">
                <div className="flex items-center gap-3 min-w-0">
                  {isLoggedIn && user ? (
                    <UserAvatar
                      id={(user as { id?: number }).id ?? 1}
                      name={user.name}
                      userName={user.name}
                      image={user.image}
                      size="md"
                    />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {isLoggedIn && user ? user.name || "Learner" : t("স্বাগতম", "Welcome")}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isLoggedIn && user
                        ? user.email || t("সক্রিয় শিক্ষার্থী", "Active Learner")
                        : t("লগইন করুন সম্পূর্ণ সুবিধা পেতে", "Sign in to sync your progress")}
                    </p>
                  </div>
                </div>

                {isLoggedIn ? (
                  <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                    <Link href="/profile" onClick={() => setProfileDrawerOpen(false)}>
                      {t("প্রোফাইল", "Profile")}
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild className="h-7 text-xs gap-1">
                    <Link href="/login" onClick={() => setProfileDrawerOpen(false)}>
                      <LogIn className="size-3.5" />
                      <span>{t("লগইন", "Login")}</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Settings Bar (Language & Theme) */}
            <div className="px-3 py-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="justify-between h-9 px-3 text-xs"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Languages className="size-3.5" />
                    <span>{t("ভাষা", "Language")}</span>
                  </span>
                  <span className="font-semibold text-foreground">
                    {lang === "bn" ? "বাংলা" : "English"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="justify-between h-9 px-3 text-xs"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {mounted && currentTheme === "dark" ? (
                      <Sun className="size-3.5" />
                    ) : (
                      <Moon className="size-3.5" />
                    )}
                    <span>{t("থিম", "Theme")}</span>
                  </span>
                  <span className="font-semibold capitalize text-foreground">
                    {mounted ? currentTheme : "system"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Main Option Navigation Links */}
            <div className="px-3 py-2 space-y-1 overflow-y-auto flex-1">
              <p className="px-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("প্রয়োজনীয় অপশন", "Important Options")}
              </p>

              <Link
                href="/search"
                onClick={() => setProfileDrawerOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Search className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("শব্দ অনুসন্ধান", "Search Words")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("তাৎক্ষণিক অর্থ খুঁজুন", "Find bilingual definitions")}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </Link>

              <Link
                href="/profile"
                onClick={() => setProfileDrawerOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("আমার শব্দতালিকা ও অগ্রগতি", "My Words & Progress")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("বুকমার্ক ও শেখা শব্দাবলী", "Bookmarks & learned lists")}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </Link>

              <Link
                href="/news"
                onClick={() => setProfileDrawerOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Newspaper className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("নিউজ ও ব্লগ", "News & Articles")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("ইংরেজি শেখার টিপস ও গাইড", "Learning guides & updates")}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </Link>

              {canContribute && (
                <Link
                  href="/contribute"
                  onClick={() => setProfileDrawerOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <SquarePen className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("কন্ট্রিবিউট করুন", "Contribute Words")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("নতুন শব্দ জমা দিন", "Submit vocabulary additions")}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </Link>
              )}

              {/* Admin Panel Button */}
              <Link
                href="/admin"
                onClick={() => setProfileDrawerOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Shield className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("অ্যাডমিন প্যানেল", "Admin Panel")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("সিস্টেম ও কনটেন্ট ম্যানেজমেন্ট", "System & content management")}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </Link>

              {/* Facebook Page Button */}
              <a
                href="https://facebook.com/zeroenglishorg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <FacebookIcon className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("ফেসবুক পেইজ", "Facebook Page")}</p>
                    <p className="text-[10px] text-muted-foreground">facebook.com/zeroenglishorg</p>
                  </div>
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground/60" />
              </a>

              <Link
                href="/about"
                onClick={() => setProfileDrawerOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Info className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("আমাদের সম্পর্কে", "About Platform")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("জিরো ইংলিশ এর লক্ষ্য ও তথ্য", "Platform info & contacts")}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </Link>
            </div>

            <Separator className="my-1" />

            {/* Drawer Footer Actions */}
            <div className="p-3 pt-2">
              {isLoggedIn ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-center gap-2 h-9 text-xs"
                >
                  <LogOut className="size-3.5" />
                  <span>{t("লগ আউট করুন", "Sign out")}</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  asChild
                  className="w-full justify-center gap-2 h-9 text-xs"
                >
                  <Link href="/login" onClick={() => setProfileDrawerOpen(false)}>
                    <LogIn className="size-3.5" />
                    <span>{t("লগইন / রেজিস্টার করুন", "Sign in / Register")}</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
