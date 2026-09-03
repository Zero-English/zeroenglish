"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ExternalLink, LogOut, Menu, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TITLES: Record<string, string> = {
  "/admin/users": "Users",
  "/admin/vocabulary": "Vocabulary",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/admin/users/")) return "User Detail";
  return "Admin";
}

export default function AdminHeader({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const title = resolveTitle(pathname);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 0);

      if (currentScrollY < 300) {
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={false}
      animate={{ y: isHidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-backdrop-filter:dark:bg-gray-900/80 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center p-2 -ml-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
              Zero English Admin Panel
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="inline-flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <UserAvatar
                  id={user?.id ?? 0}
                  name={user?.name}
                  userName={user?.name}
                  image={user?.image}
                  size="md"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => void signOut({ callbackUrl: "/admin" })}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
