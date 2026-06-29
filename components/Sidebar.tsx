"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar-provider";
import logo from "@/public/assets/logo.png";
import {Home, Search, User, BookOpenCheck} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/quiz", label: "Quiz", icon: BookOpenCheck },
  { href: "/profile", label: "Profile", icon: User }
];

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed top-0 inset-y-0 left-0 z-50 md:hover:w-64 group transform bg-white border-r dark:bg-black w-64 md:w-fit
          flex flex-col transition-all duration-300 delay-150 ease-in-out
          md:sticky md:z-auto md:translate-x-0 md:max-h-[calc(100vh-65px)] md:top-[65px]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b md:border-b-0">
          
          <button
            onClick={close}
            className="p-1 rounded-md hover:bg-gray-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="md:hidden px-4 pb-2 pt-2 text-sm">
          Navigation
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors gap-3
                  ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
                  }
                `}
              >
                <link.icon className="h-5 w-5" />
                <span className="truncate md:hidden group-hover:block">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="outline" className="w-full" onClick={close}>
            Sign In
          </Button>
          <Button className="w-full" onClick={close}>
            Get Started
          </Button>
        </div> */}
      </aside>
    </>
  );
}
