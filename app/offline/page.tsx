import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "You're Offline",
  description: "No internet connection",
};

export default function OfflinePage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="animate-fade-up text-center">
        <WifiOff className="h-16 w-16 mx-auto text-zinc-300 dark:text-zinc-600 mb-6" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          You&apos;re Offline
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
          This page hasn&apos;t been visited yet. Once you&apos;re back online, visit the pages you need and they&apos;ll be available offline.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
