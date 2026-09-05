"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { PanelLeft, Users, BookOpen, Activity, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/admin/learning-events", label: "Learning Events", icon: Activity },
];

function NavLinks({
  isOpen: showLabels,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors gap-3 whitespace-nowrap ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <AnimatePresence initial={false}>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {item.label}
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
  isOpen: showLabel,
  onLogout,
}: {
  isOpen: boolean;
  onLogout: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors gap-3 whitespace-nowrap ${
        showLabel ? "" : "justify-center"
      } text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/20`}
    >
      <LogOut className="h-5 w-5 shrink-0" />
      {showLabel && <span className="truncate">Log out</span>}
    </button>
  );
}

export default function AdminSidebar({
  isOpen,
  isDesktopOpen,
  close,
  toggleDesktop,
}: {
  isOpen: boolean;
  isDesktopOpen: boolean;
  close: () => void;
  toggleDesktop: () => void;
}) {
  const handleLogout = () => {
    close();
    void signOut({ callbackUrl: "/admin" });
  };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isDesktopOpen ? 256 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex sticky top-0 z-30 h-screen md:shrink-0 flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <div
          className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-800 ${
            isDesktopOpen ? "justify-between px-4" : "justify-center px-2"
          }`}
        >
          {isDesktopOpen && (
            <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Zero English
              </span>
              <span className="text-xs font-medium text-primary">Admin</span>
            </div>
          )}
          <button
            onClick={toggleDesktop}
            aria-label={isDesktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
        <NavLinks isOpen={isDesktopOpen} />
        <div className="p-3">
          <LogoutButton isOpen={isDesktopOpen} onLogout={handleLogout} />
        </div>
      </motion.aside>

      {/* Mobile drawer (shadcn Sheet) */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
        <SheetContent
          side="left"
          className="w-64 gap-0 p-0 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800"
        >
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-200 dark:border-gray-800">
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Zero English
            </span>
            <span className="text-xs font-medium text-primary">Admin</span>
          </div>
          <NavLinks isOpen onNavigate={close} />
          <div className="mt-auto border-t border-gray-200 p-3 dark:border-gray-800">
            <LogoutButton isOpen onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}