"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PanelLeft, Home, Search, User, BookOpenCheck, LibraryBig, Trophy, Newspaper, LogIn, LogOut } from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { useAuthStatus, useAuthStore } from "@/lib/auth-store";
import { useSelectedLevel } from "@/lib/level-store";
import { useT } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import logo from "../public/assets/logo/main-logo.webp";

const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 } as const;

function NavLinks({
  isOpen: showLabels,
  onNavigate,
  activeId,
}: {
  isOpen: boolean;
  onNavigate?: () => void;
  activeId: string;
}) {
  const pathname = usePathname();
  const { status } = useAuthStatus();
  const { level } = useSelectedLevel();
  const t = useT();
  const isLoggedIn = status !== "none";
  // const vocabularyHref = level ? `/vocabulary/${level.toLowerCase()}` : "/vocabulary";
  const vocabularyHref = "/vocabulary"; // Fixed by Mahir because it should go to /vocabulary not /vocabulary/:level
  const navLinks = [
    { href: "/", label: t("হোম", "Home"), icon: Home },
    { href: vocabularyHref, label: t("শব্দভাণ্ডার", "Vocabulary"), icon: LibraryBig },
    { href: "/search", label: t("অনুসন্ধান", "Search"), icon: Search },
    { href: "/quiz", label: t("কুইজ", "Quiz"), icon: BookOpenCheck },
    { href: "/leaderboard", label: t("লিডারবোর্ড", "Leaderboard"), icon: Trophy },
    { href: "/news", label: t("নিউজ", "News"), icon: Newspaper },
    isLoggedIn
      ? { href: "/profile", label: t("প্রোফাইল", "Profile"), icon: User }
      : { href: "/login", label: t("লগইন", "Login"), icon: LogIn },
  ];

  return (
    <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors gap-3 whitespace-nowrap text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            {isActive && (
              <motion.span
                layoutId={activeId}
                transition={spring}
                className="absolute inset-0 rounded-md border bg-primary/15"
              />
            )}
            <link.icon className={cn("h-5 w-5 shrink-0 relative", isActive && "text-primary")} />
            <AnimatePresence initial={false}>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn("relative truncate", isActive && "text-primary font-semibold")}
                >
                  {link.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({
  showLabels,
  onLogout,
}: {
  showLabels: boolean;
  onLogout: () => void;
}) {
  const t = useT();
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-3">
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors gap-3 whitespace-nowrap"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {showLabels && <span className="truncate">{t("লগ আউট", "Log out")}</span>}
      </button>
    </div>
  );
}

export function Sidebar() {
  const hidden = useQuizChrome((s) => s.hidden);
  const { isOpen, isDesktopOpen, close, toggleDesktop } = useSidebar();
  const { status } = useAuthStatus();
  const t = useT();
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = status !== "none";

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
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isDesktopOpen ? 256 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex sticky top-0 z-30 h-screen md:shrink-0 flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={toggleDesktop}
            aria-label={isDesktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <NavLinks isOpen={isDesktopOpen} activeId="sidebar-active-desktop" />
          {isLoggedIn && (
            <LogoutButton showLabels={isDesktopOpen} onLogout={handleLogout} />
          )}
        </div>
      </motion.aside>

      {/* Mobile drawer (shadcn Sheet) */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
        <SheetContent
          side="left"
          className="w-64 gap-0 p-0 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800"
        >
          <SheetTitle className="sr-only">{t("নেভিগেশন মেনু", "Navigation Menu")}</SheetTitle>
          <div className="flex items-center p-4 border-b h-16">
            <Link
              href="/"
              onClick={close}
              className="flex items-center space-x-2"
            >
              <Image src={logo} alt="Logo" className="h-5 w-auto dark:brightness-0 dark:invert" />
            </Link>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <NavLinks isOpen onNavigate={close} activeId="sidebar-active-mobile" />
            {isLoggedIn && (
              <LogoutButton showLabels onLogout={handleLogout} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
