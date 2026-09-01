"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion } from "motion/react";

const TITLES: Record<string, string> = {
  "/admin/users": "Users",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/admin/users/")) return "User Detail";
  return "Admin";
}

export default function AdminHeader({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
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
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2.5 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-4 sm:flex dark:border-gray-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              A
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Admin
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                admin@zeroenglish.com
              </p>
            </div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white sm:hidden">
            A
          </span>
        </div>
      </div>
    </motion.header>
  );
}
