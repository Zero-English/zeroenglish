"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  UserRound,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Laptop,
  LayoutGrid,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
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

export function AdminUserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/admin" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Admin account menu"
          className="flex items-center justify-center p-1 rounded-full border border-border/80 bg-background hover:bg-muted/70 active:scale-95 transition-all outline-none"
        >
          <UserAvatar
            id={(user as any)?.id ?? 0}
            name={user?.name}
            userName={user?.name}
            image={user?.image}
            size="sm"
            className="size-7 text-[11px] shrink-0"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1.5">
        <DropdownMenuLabel className="font-normal px-2.5 py-2">
          <div className="flex items-center gap-2.5">
            <UserAvatar
              id={(user as any)?.id ?? 0}
              name={user?.name}
              userName={user?.name}
              image={user?.image}
              size="md"
              className="size-9 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user?.name || "Administrator"}
                </span>
                <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                  <ShieldCheck className="size-2.5" />
                  Admin
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground truncate">
                {user?.email || "admin@zeroenglish.com"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin" className="cursor-pointer gap-2.5 text-xs py-2">
            <LayoutGrid className="size-4 text-muted-foreground" />
            <span>Admin Hub</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={(user as any)?.id ? `/admin/users/${(user as any).id}` : "/profile"}
            className="cursor-pointer gap-2.5 text-xs py-2"
          >
            <UserRound className="size-4 text-muted-foreground" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/" className="cursor-pointer gap-2.5 text-xs py-2">
            <ExternalLink className="size-4 text-muted-foreground" />
            <span>View Public Site</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer gap-2.5 text-xs py-2">
            {mounted && resolvedTheme === "dark" ? (
              <Moon className="size-4 text-muted-foreground" />
            ) : (
              <Sun className="size-4 text-muted-foreground" />
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
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault();
            void handleLogout();
          }}
          className="cursor-pointer gap-2.5 text-xs py-2 text-destructive focus:text-destructive"
        >
          {signingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

