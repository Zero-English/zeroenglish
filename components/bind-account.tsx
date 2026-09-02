"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { ShieldCheck, LogOut } from "lucide-react";

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

export function BindAccount() {
    const logout = useAuthStore((s) => s.logout);

    const handleBind = async () => {
        await signIn("google", { callbackUrl: "/profile" });
    };

    const handleLogout = async () => {
        logout();
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <div className="rounded-2xl border border-orange-200/70 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/90 to-amber-50/60 dark:from-orange-950/30 dark:to-amber-950/20 backdrop-blur-sm p-5 sm:p-6 mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40">
                        <ShieldCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Bind Your Account
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                            You&apos;re currently using a guest account. Bind it
                            with Google to keep your progress safe and sync it
                            across devices.
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="default"
                        className="h-10 gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => void handleBind()}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        title="Sign out"
                        onClick={() => void handleLogout()}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
