"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { AuthStatus } from "@/lib/auth-store";
import { useAuthStatus } from "@/lib/auth-store";

type PopupMedia = {
  id: number;
  url: string;
  name: string;
  mimeType: string;
  width: number | null;
  height: number | null;
};

type ActivePopup = {
  id: number;
  name: string;
  link: string;
  landscapeMedia: PopupMedia | null;
  portraitMedia: PopupMedia | null;
  audience: string;
  pageRule: string;
  includePaths: string[];
  animation: string;
};

const DISMISSED_KEY = "zeroenglish:dismissed-popups";
const MOBILE_QUERY = "(max-width: 767px)";

function getDismissedIds(): number[] {
  try {
    const raw = window.sessionStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is number => typeof v === "number")
      : [];
  } catch {
    return [];
  }
}

function matchesAudience(status: AuthStatus, audience: string): boolean {
  switch (audience) {
    case "LOGGED_OUT_ONLY":
      return status === "none";
    case "LOGGED_IN_ONLY":
      return status === "google";
    case "GUEST_ONLY":
      return status === "guest";
    default:
      return true;
  }
}

function matchesPageRule(
  pageRule: string,
  includePaths: string[],
  pathname: string
): boolean {
  if (pageRule === "HOME") return pathname === "/";
  if (pageRule === "SPECIFIC_PATHS") {
    return includePaths.some((path) => pathname.startsWith(path));
  }
  return true;
}

function imageUrlFor(popup: ActivePopup, isMobile: boolean): PopupMedia | null {
  if (isMobile && popup.portraitMedia) return popup.portraitMedia;
  return popup.landscapeMedia ?? popup.portraitMedia;
}

function animationVariants(animation: string) {
  switch (animation) {
    case "ZOOM":
      return { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 } };
    case "SLIDE_UP":
      return { initial: { opacity: 0, y: 48 }, animate: { opacity: 1, y: 0 } };
    case "SLIDE_DOWN":
      return { initial: { opacity: 0, y: -48 }, animate: { opacity: 1, y: 0 } };
    case "NONE":
      return { initial: false, animate: {} };
    default:
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
  }
}

function dimensionTransform(media: PopupMedia, isMobile: boolean): string {
  if (media.mimeType === "image/svg+xml") return media.url;
  return isMobile ? `${media.url}?tr=w-480` : `${media.url}?tr=w-900`;
}

export function PopupHost() {
  const pathname = usePathname();
  const { status, hydrated } = useAuthStatus();

  const [popups, setPopups] = useState<ActivePopup[]>([]);
  const [dismissed, setDismissed] = useState<number[]>(() =>
    typeof window === "undefined" ? [] : getDismissedIds()
  );
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/popup/active")
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: ActivePopup[] }) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) setPopups(json.data);
      })
      .catch(() => {
        if (!cancelled) setPopups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const visiblePopups = useMemo(() => {
    if (!hydrated) return [];
    return popups.filter(
      (popup) =>
        matchesAudience(status, popup.audience) &&
        matchesPageRule(popup.pageRule, popup.includePaths, pathname) &&
        !dismissed.includes(popup.id) &&
        imageUrlFor(popup, isMobile)
    );
  }, [popups, status, hydrated, pathname, dismissed, isMobile]);

  const dismiss = useCallback((id: number) => {
    setDismissed((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        window.sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors (private mode, quota)
      }
      return next;
    });
  }, []);

  return (
    <>
      {visiblePopups.map((popup) => {
        const media = imageUrlFor(popup, isMobile)!;
        const variants = animationVariants(popup.animation);
        const portrait = isMobile && popup.portraitMedia !== null;
        return (
          <AnimatePresence key={popup.id}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4"
              onClick={() => dismiss(popup.id)}
            >
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={popup.name}
                initial={variants.initial === false ? undefined : variants.initial}
                animate={
                  variants.initial === false ? undefined : variants.animate
                }
                exit={
                  variants.initial === false
                    ? undefined
                    : { opacity: 0, scale: 0.95 }
                }
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="relative z-10"
                onClick={(e) => e.stopPropagation()}
                style={portrait ? { width: "min(90vw, 340px)" } : { width: "min(94vw, 620px)" }}
              >
                <button
                  type="button"
                  onClick={() => dismiss(popup.id)}
                  aria-label="Close popup"
                  className="absolute -top-3 -right-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
                {popup.link ? (
                  <button
                    type="button"
                    onClick={() => {
                      dismiss(popup.id);
                      window.location.href = popup.link;
                    }}
                    aria-label={`Open ${popup.link}`}
                    className="block overflow-hidden rounded-xl shadow-xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dimensionTransform(media, isMobile)}
                      alt={media.name}
                      className={portrait ? "w-full rounded-xl object-cover" : "w-full rounded-xl object-cover"}
                    />
                  </button>
                ) : (
                  <div className="overflow-hidden rounded-xl shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dimensionTransform(media, isMobile)}
                      alt={media.name}
                      className="w-full rounded-xl object-cover"
                    />
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </>
  );
}