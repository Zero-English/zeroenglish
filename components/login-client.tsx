"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthStore, useAuthHydrated } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserRound, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Classic } from "@/components/classic";

async function signInGoogle(callbackUrl: string = "/profile") {
    const { signIn } = await import("next-auth/react");
    return signIn("google", { callbackUrl, redirect: true });
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
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

export function LoginClient() {
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const status = useAuthStore((s) => s.status);
  const setGoogleAuth = useAuthStore((s) => s.setGoogleAuth);
  const hydrated = useAuthHydrated();
  const { data: session } = useSession();
  const router = useRouter();
  const greeted = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (session?.user && !greeted.current) {
      greeted.current = true;
      setGoogleAuth(session.user.name ?? null, session.user.email ?? null);
      toast.success(`Welcome back, ${session.user.name ?? "there"}!`);
      return;
    }
    if (status !== "none") {
      router.replace("/profile");
    }
  }, [hydrated, session, status, router, setGoogleAuth]);

    if (!hydrated) {
        return (
            <div className="flex min-h-dvh items-center justify-center text-zinc-400">
                <Classic className="size-6" />
            </div>
        );
    }

  const handleGoogle = () => {
    void signInGoogle("/profile");
  };

  const handleGuest = () => {
    continueAsGuest();
    toast.success("Continuing as Guest");
  };

    return (
        <div className="relative min-h-dvh overflow-hidden">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
            <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

            <div className="relative flex min-h-dvh items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div className="w-full max-w-sm">
                    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 sm:p-8">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-sm">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                                Zero English
                            </h1>
                            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                                Sign in to track your learning progress.
                            </p>
                        </div>

                        <Tabs defaultValue="login">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">
                                    Register
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="mt-4">
                                <Button
                                    variant="outline"
                                    className="h-11 w-full gap-2.5 text-sm font-medium"
                                    onClick={handleGoogle}
                                >
                                    <GoogleIcon />
                                    Continue with Google
                                </Button>
                            </TabsContent>

                            <TabsContent value="register" className="mt-4">
                                <Button
                                    variant="outline"
                                    className="h-11 w-full gap-2.5 text-sm font-medium"
                                    onClick={() =>
                                        void signInGoogle("/profile")
                                    }
                                >
                                    <GoogleIcon />
                                    Sign up with Google
                                </Button>
                            </TabsContent>
                        </Tabs>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white/90 px-3 text-zinc-400 dark:bg-zinc-950/80">
                                    or
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            className="h-11 w-full gap-2 text-sm font-medium"
                            onClick={handleGuest}
                        >
                            <UserRound className="h-4 w-4" />
                            Continue as Guest
                        </Button>

                        <p className="mt-4 text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
                            Continue as guest to explore the app.
                            <br />
                            You can bind a Google account later.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
