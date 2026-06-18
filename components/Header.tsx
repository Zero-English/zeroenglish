"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/components/sidebar-provider";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import logo from "../public/assets/logo.png";

export function Header() {
  const { toggle } = useSidebar();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const lastScrollY = useRef(0);

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

  return (
    <motion.header
      initial={false}
      animate={{y: isHidden ? "-100%" : "0%",}}
      transition={{type: "spring",stiffness: 250,damping: 30,mass: 1,}}

    className={` bg-background/95 backdrop-blur md:border-b supports-backdrop-filter:bg-background/80 sticky top-0 z-30 ${isScrolled ? "border-b" : ""}

        ${isHidden ? "-translate-y-full" : "translate-y-0"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={toggle}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/" className="flex items-center space-x-2 dark:bg-white dark:p-2 dark:rounded-md">
          <Image src={logo} alt="Logo" className="h-5 w-auto" />
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Search className="h-5 w-5" />
        </Link>
      </nav>
    </motion.header>
  );
}
