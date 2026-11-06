"use client";

import { AdminHeaderNav } from "./admin-header-nav";
import { AdminUserMenu } from "./admin-user-menu";

export function AdminMobileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md h-14 px-4 flex items-center justify-between md:hidden select-none">
      <AdminHeaderNav />
      <AdminUserMenu />
    </header>
  );
}
