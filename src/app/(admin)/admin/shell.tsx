"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./sidebar";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";

export default function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const pathname = usePathname();

  const isStudio =
    pathname?.includes("/admin/templates/new") ||
    (pathname?.includes("/admin/templates/") && pathname?.includes("/edit")) ||
    pathname?.includes("/admin/grammar/section/") ||
    pathname?.includes("/admin/grammar/category/") ||
    pathname?.includes("/admin/grammar/rule/");

  return (
    <div
      className={`flex flex-col bg-background text-foreground md:flex-row ${
        isStudio ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Sticky Mobile Header (< 768px / md) */}
      {!isStudio && <AdminMobileHeader />}

      {/* Persistent Desktop Sidebar (>= 768px / md) */}
      <AdminSidebar
        isDesktopOpen={isDesktopOpen}
        toggleDesktop={() => setIsDesktopOpen((prev) => !prev)}
      />

      {/* Main Viewport Container */}
      <main
        className={`flex-1 min-w-0 w-full ${
          isStudio ? "h-full overflow-hidden flex flex-col" : "min-h-0"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
