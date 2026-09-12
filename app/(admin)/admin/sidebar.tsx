"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import {
  PanelLeft,
  Users,
  BookOpen,
  Brain,
  ClipboardList,
  Image,
  Newspaper,
  Menu,
  UserRound,
  ExternalLink,
  LogOut,
  ChevronDown,
  Megaphone,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/quizzes", label: "Quizzes", icon: Brain },
  { href: "/admin/exams", label: "Exams", icon: ClipboardList },
  { href: "/admin/popup", label: "Popup", icon: Megaphone },
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

function ProfileMenu({
  isOpen: showLabel,
  onLogout,
}: {
  isOpen: boolean;
  onLogout: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={`flex items-center rounded-md text-sm font-medium transition-colors gap-3 whitespace-nowrap ${
            showLabel
              ? "px-3 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-800"
              : "justify-center px-2 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <UserAvatar
            id={user?.id ?? 0}
            name={user?.name}
            userName={user?.name}
            image={user?.image}
            size="sm"
            className="shrink-0"
          />
          {showLabel ? (
            <span className="flex-1 min-w-0 text-left">
              <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name || "Admin"}
              </span>
              <span className="block truncate text-xs font-normal text-gray-500 dark:text-gray-400">
                {user?.email || "admin@zeroenglish.com"}
              </span>
            </span>
          ) : null}
          {showLabel ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {user?.name || "Admin"}
          </p>
          <p className="truncate text-xs font-normal text-gray-500 dark:text-gray-400">
            {user?.email || "admin@zeroenglish.com"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user?.id ?? ""}`}>
            <UserRound className="h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminSidebar({
  isOpen,
  isDesktopOpen,
  close,
  toggleDesktop,
  onMenu,
}: {
  isOpen: boolean;
  isDesktopOpen: boolean;
  close: () => void;
  toggleDesktop: () => void;
  onMenu: () => void;
}) {
  const handleLogout = () => {
    close();
    void signOut({ callbackUrl: "/admin" });
  };

  return (
    <>
      {/* Floating mobile menu button */}
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open admin menu"
        className="md:hidden fixed top-3 left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/95"
      >
        <Menu className="h-5 w-5" />
      </button>

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
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <ProfileMenu isOpen={isDesktopOpen} onLogout={handleLogout} />
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
            <ProfileMenu isOpen onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}