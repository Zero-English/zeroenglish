"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { useT } from "@/components/language-provider";
import { useAuthStore } from "@/lib/auth-store";
import {
  useLoginRequiredStore,
  closeLoginRequired,
} from "@/lib/login-required";
import { Loader2, LogIn } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function LoginRequiredDrawer() {
  const open = useLoginRequiredStore((s) => s.open);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const pathname = usePathname();
  const t = useT();
  const [busy, setBusy] = useState(false);

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { signIn } = await import("next-auth/react");
      await signIn("google", {
        redirect: false,
        callbackUrl: pathname ?? "/profile",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleGuest = () => {
    closeLoginRequired();
    continueAsGuest();
  };

  return (
    <Drawer open={open} onOpenChange={(next) => { if (!next) closeLoginRequired(); }}>
      <DrawerContent className="mx-auto max-w-lg rounded-t-3xl">
        <div className="px-6 pb-8 pt-2">
          <div className="mb-5 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-orange-500/30">
              <LogIn className="h-6 w-6" />
            </div>
          </div>
          <DrawerTitle className="text-center text-base font-bold sm:text-lg">
            {t("লগইন প্রয়োজন", "Login required")}
          </DrawerTitle>
          <DrawerDescription className="mt-1.5 text-center text-xs sm:text-sm leading-relaxed">
            {t(
              "শেখা, বুকমার্ক এবং কুইজের অগ্রগতি সংরক্ষণ করতে একটি প্রোফাইল তৈরি করুন।",
              "Create a profile to save your learned words, bookmarks, and quiz progress."
            )}
          </DrawerDescription>
          <div className="mt-5 space-y-2">
            <Button
              size="lg"
              className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
              onClick={() => void handleGoogle()}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              {t("Google দিয়ে চালিয়ে যান", "Continue with Google")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleGuest}
              disabled={busy}
            >
              {t("অতিথি হিসেবে চালিয়ে যান", "Continue as Guest")}
            </Button>
            <DrawerClose asChild>
              <Button size="lg" variant="ghost" className="w-full" disabled={busy}>
                {t("পরে", "Maybe later")}
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}