import { ArrowLeft, BookOpen } from "lucide-react";
import { HardNavLink } from "./hard-nav-link";

export function NotFoundContent() {
  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-20 text-center animate-fade-up">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Error 404
      </p>
      <h1 className="mt-3 text-6xl font-black tracking-tight text-foreground sm:text-7xl">
        Lost?
      </h1>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <HardNavLink
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </HardNavLink>
        <HardNavLink
          href="/vocabulary"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <BookOpen className="h-4 w-4" />
          Browse Vocabulary
        </HardNavLink>
      </div>
    </div>
  );
}