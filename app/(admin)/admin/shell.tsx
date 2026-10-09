"use client";

import AdminSidebar from "./sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const pathname = usePathname();

  const isStudio =
    pathname?.includes("/admin/templates/new") ||
    (pathname?.includes("/admin/templates/") && pathname?.includes("/edit"));

  return (
    <div
      className={`flex flex-col bg-background text-foreground md:flex-row ${
        isStudio ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <AdminSidebar
        isOpen={isOpen}
        isDesktopOpen={isDesktopOpen}
        close={() => setIsOpen(false)}
        toggleDesktop={() => setIsDesktopOpen((prev) => !prev)}
        onMenu={() => setIsOpen(true)}
      />
      <main
        className={`flex-1 min-w-0 w-full ${
          isStudio ? "h-full overflow-hidden flex flex-col" : ""
        }`}
      >
        {!isStudio && <div className="h-14 md:hidden" aria-hidden="true" />}
        {children}
      </main>
    </div>
  );
}