"use client";

import Link from "next/link";
import { Search, Menu, Sun, Moon, Languages } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/components/sidebar-provider";
import { useLanguage } from "@/components/language-provider";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { useQuizChrome } from "@/lib/quiz-chrome";
import logo from "../public/assets/logo.png";

export function Header() {
  const hidden = useQuizChrome((s) => s.hidden);
  const { toggle } = useSidebar();
  const { lang, toggleLanguage } = useLanguage();
  const { theme, setTheme, systemTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const lastScrollY = useRef(0);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const currentTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Border after 1px scroll
      setIsScrolled(currentScrollY > 0);

      // Always show near top
      if (currentScrollY < 300) {
        setIsHidden(false);
      } else {
        // Hide when scrolling down
        if (currentScrollY > lastScrollY.current) {
          setIsHidden(true);
        }
        // Show when scrolling up
        else if (currentScrollY < lastScrollY.current) {
          setIsHidden(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (hidden) return null;

  return (
    <motion.header
      initial={false}
      animate={{ y: isHidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={` bg-background/95 backdrop-blur md:border-b supports-backdrop-filter:bg-background/80 sticky top-0 z-30 ${isScrolled ? "border-b" : ""}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={logo} alt="Logo" className="h-5 w-auto dark:brightness-0 dark:invert" />  
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleLanguage}
            aria-label={lang === "bn" ? "Switch to English" : "Switch to Bangla"}
            title={lang === "bn" ? "Switch to English" : "Switch to Bangla"}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Languages className="h-5 w-5" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {lang === "bn" ? "বাং" : "EN"}
            </span>
          </button>
          <button
            onClick={toggleTheme}
            aria-label={
              mounted && currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mounted && (currentTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            ))}
          </button>
          <button
            onClick={toggle}
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
