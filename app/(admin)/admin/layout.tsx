"use client";

import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import { useState } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 md:flex-row">
      <AdminSidebar
        isOpen={isOpen}
        isDesktopOpen={isDesktopOpen}
        close={() => setIsOpen(false)}
        toggleDesktop={() => setIsDesktopOpen((prev) => !prev)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader onMenu={() => setIsOpen(true)} />
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
