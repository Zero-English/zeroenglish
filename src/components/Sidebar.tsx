"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { useAuthStatus, useAuthStore } from "@/lib/auth-store";
import { useSelectedLevel } from "@/lib/level-store";
import { useT } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import logo from "@/public/assets/logo/main-logo.webp";

const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 } as const;

export function Sidebar() {
  const hidden = useQuizChrome((s) => s.hidden);
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { status } = useAuthStatus();
  const { level } = useSelectedLevel();
  const t = useT();
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = status !== "none";
  const vocabularyHref = isLoggedIn && level ? `/vocabulary/${level.toLowerCase()}` : "/vocabulary";
  const { data: session } = useSession();
  const canContribute =
    session?.user?.role === "admin" || session?.user?.role === "contributor";

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
    isLoggedIn
      ? { href: "/profile", label: t("প্রোফাইল", "Profile"), icon: User }
      : { href: "/login", label: t("লগইন", "Login"), icon: LogIn },
  ];

  const handleLogout = async () => {
    close();
    logout();
    await Promise.allSettled([
      fetch("/api/v1/auth/logout", { method: "POST" }),
      signOut({ redirect: false }),
    ]);
    window.location.replace("/");
  };

  if (hidden) return null;

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
          </nav>

          {/* Logout Dock Item */}
          {isLoggedIn && (
            <>
              <Separator orientation="vertical" className="h-6 mx-1 bg-border/80" />
              <button
                type="button"
                onClick={handleLogout}
                aria-label={t("লগ আউট", "Log out")}
                className="group relative flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.2, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <LogOut className="size-5 shrink-0" />
                </motion.div>
                <span className="pointer-events-none absolute bottom-full mb-3 hidden group-hover:flex items-center rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-destructive shadow-md border border-border whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95">
                  {t("লগ আউট", "Log out")}
                </span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (shadcn Sheet) */}
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
    </>
  );
}
