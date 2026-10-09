"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import {
  PanelLeft,
  Users,
  BookOpen,
  Brain,
  ClipboardList,
  Image as ImageIcon,
  Newspaper,
  Menu,
  UserRound,
  ExternalLink,
  LogOut,
  ChevronDown,
  Megaphone,
  LayoutTemplate,
  Sun,
  Moon,
  Laptop,
  Mail,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/quizzes", label: "Quizzes", icon: Brain },
  { href: "/admin/exams", label: "Exams", icon: ClipboardList },
  { href: "/admin/emails", label: "Emails", icon: Mail },
  { href: "/admin/popup", label: "Popup", icon: Megaphone },
];

function NavLinks({
  isOpen: showLabels,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center px-2.5 py-2 rounded-md text-xs font-medium transition-colors gap-2.5 whitespace-nowrap",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-sidebar-foreground/70"
              )}
            />
            <AnimatePresence initial={false}>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileMenu({
  isOpen: showLabel,
  onLogout,
}: {
  isOpen: boolean;
  onLogout: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            "flex items-center rounded-md text-xs font-medium transition-colors gap-2.5 whitespace-nowrap outline-none hover:bg-sidebar-accent/60",
            showLabel ? "px-2.5 py-2 w-full text-left" : "justify-center p-2 w-full"
          )}
        >
          <UserAvatar
            id={user?.id ?? 0}
            name={user?.name}
            userName={user?.name}
            image={user?.image}
            size="sm"
            className="size-6 text-[10px] shrink-0"
          />
          {showLabel && (
            <>
              <span className="flex-1 min-w-0">
                <span className="block truncate text-xs font-medium text-sidebar-foreground">
                  {user?.name || "Admin"}
                </span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {user?.email || "admin@zeroenglish.com"}
                </span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-52">
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <p className="text-xs font-medium text-foreground">{user?.name || "Admin"}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {user?.email || "admin@zeroenglish.com"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user?.id ?? ""}`} className="cursor-pointer gap-2 text-xs">
            <UserRound className="size-3.5" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/" className="cursor-pointer gap-2 text-xs">
            <ExternalLink className="size-3.5" />
            View Site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer gap-2 text-xs">
            {mounted && resolvedTheme === "dark" ? (
              <Moon className="size-3.5 text-muted-foreground" />
            ) : (
              <Sun className="size-3.5 text-muted-foreground" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36">
            <DropdownMenuRadioGroup
              value={mounted ? theme : "system"}
              onValueChange={(val) => setTheme(val)}
            >
              <DropdownMenuRadioItem value="light" className="cursor-pointer gap-2 text-xs">
                <Sun className="size-3.5 text-muted-foreground" />
                <span>Light</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="cursor-pointer gap-2 text-xs">
                <Moon className="size-3.5 text-muted-foreground" />
                <span>Dark</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="cursor-pointer gap-2 text-xs">
                <Laptop className="size-3.5 text-muted-foreground" />
                <span>System</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={onLogout}
          className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
        >
          <LogOut className="size-3.5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminSidebar({
  isOpen,
  isDesktopOpen,
  close,
  toggleDesktop,
  onMenu,
}: {
  isOpen: boolean;
  isDesktopOpen: boolean;
  close: () => void;
  toggleDesktop: () => void;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const isStudio =
    pathname?.includes("/admin/templates/new") ||
    (pathname?.includes("/admin/templates/") && pathname?.includes("/edit"));

  const handleLogout = () => {
    close();
    void signOut({ callbackUrl: "/admin" });
  };

  return (
    <>
      {/* Mobile top hamburger trigger (hidden on studio editor to preserve back button) */}
      {!isStudio && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onMenu}
          aria-label="Open admin menu"
          className="md:hidden fixed top-3 left-3 z-40 bg-background/95 backdrop-blur shadow-xs"
        >
          <Menu className="size-4" />
        </Button>
      )}

      {/* Desktop simple sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isDesktopOpen ? 220 : 56 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="hidden md:flex sticky top-0 z-30 h-screen md:shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden select-none"
      >
        {/* Header / Brand */}
        <div
          className={cn(
            "flex items-center h-14 border-b border-sidebar-border px-3",
            isDesktopOpen ? "justify-between" : "justify-center"
          )}
        >
          {isDesktopOpen && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold tracking-tight text-foreground truncate">
                Zero English
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                Admin
              </Badge>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleDesktop}
            aria-label={isDesktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          >
            <PanelLeft className="size-3.5" />
          </Button>
        </div>

        {/* Navigation list */}
        <NavLinks isOpen={isDesktopOpen} />

        {/* Profile / Actions footer */}
        <div className="p-2 border-t border-sidebar-border mt-auto">
          <ProfileMenu isOpen={isDesktopOpen} onLogout={handleLogout} />
        </div>
      </motion.aside>

      {/* Mobile Drawer (shadcn Sheet) */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
        <SheetContent
          side="left"
          className="w-60 gap-0 p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col"
        >
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
            <span className="text-xs font-bold tracking-tight text-foreground">
              Zero English
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
              Admin
            </Badge>
          </div>
          <NavLinks isOpen onNavigate={close} />
          <div className="mt-auto border-t border-sidebar-border p-2">
            <ProfileMenu isOpen onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}