"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PanelLeft, Home, Search, User, BookOpenCheck, LogIn } from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { useAuthStatus } from "@/lib/auth-store";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import logo from "../public/assets/logo.png";

function NavLinks({
  isOpen: showLabels,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { status } = useAuthStatus();
  const isLoggedIn = status === "guest" || status === "authenticated";
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/quiz", label: "Quiz", icon: BookOpenCheck },
    isLoggedIn
      ? { href: "/profile", label: "Profile", icon: User }
      : { href: "/login", label: "Login", icon: LogIn },
  ];

  return (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors gap-3 whitespace-nowrap ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            <AnimatePresence initial={false}>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
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

export function Sidebar() {
  const { isOpen, isDesktopOpen, close, toggleDesktop } = useSidebar();

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
          <NavLinks isOpen={isDesktopOpen} />
        </div>
      </motion.aside>

      {/* Mobile drawer (shadcn Sheet) */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
        <SheetContent
          side="left"
          className="w-64 gap-0 p-0 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center p-4 border-b">
            <Link
              href="/"
              onClick={close}
              className="flex items-center space-x-2 dark:bg-white dark:p-2 dark:rounded-md"
            >
              <Image src={logo} alt="Logo" className="h-5 w-auto" />
            </Link>
          </div>
          <NavLinks isOpen onNavigate={close} />
        </SheetContent>
      </Sheet>
    </>
  );
}
