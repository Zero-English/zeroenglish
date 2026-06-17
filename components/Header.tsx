"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/components/sidebar-provider";
import logo from "../public/assets/logo.png";

export function Header() {
  const { toggle } = useSidebar();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/quiz", label: "Quiz" },
    { href: "/beginner", label: "Beginner" },
    { href: "/intermediate", label: "Intermediate" },
    { href: "/advanced", label: "Advanced" },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 sticky top-0 z-30">
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
        {/* <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div> */}

        <button>
          <Bell className="h-6 w-6" />
        </button>
      </nav>
    </header>
  );
}
