import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Image from "next/image";
import { ThemeProvider } from "@/components/theme-provider";
import { NotFoundContent } from "@/components/not-found/not-found-content";
import { HardNavLink } from "@/components/not-found/hard-nav-link";
import logo from "../public/assets/logo.png";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`h-full ${geistSans.variable} ${geistMono.variable} font-sans antialiased ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
              <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <HardNavLink href="/" className="flex items-center space-x-2">
                  <Image
                    src={logo}
                    alt="Zero English"
                    className="h-5 w-auto dark:brightness-0 dark:invert"
                  />
                </HardNavLink>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  404
                </span>
              </nav>
            </header>
            <main className="flex flex-1 items-center justify-center">
              <NotFoundContent />
            </main>
            <footer className="border-t border-border bg-muted/40 text-muted-foreground">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-sm sm:flex-row sm:px-6 lg:px-8">
                <p>
                  &copy; {new Date().getFullYear()} Zero English. All rights
                  reserved.
                </p>
                <p>Learning English has never been easier.</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}