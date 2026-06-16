"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar-provider";
import logo from "@/public/assets/logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/quiz", label: "Quiz" },
  { href: "/profile", label: "Profile" }
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
          fixed top-0 inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          flex flex-col transition-transform duration-300 ease-in-out
          md:sticky md:z-auto md:translate-x-0 md:max-h-[calc(100vh-65px)] md:top-[65px]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:border-b-0">
          
          <button
            onClick={close}
            className="p-1 rounded-md hover:bg-gray-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="md:hidden px-4 pb-2 pt-2 text-sm text-gray-500">
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
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                {link.label}
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
