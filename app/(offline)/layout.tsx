import type { Metadata } from "next";
import HtmlShell from "@/components/html-shell";

export const metadata: Metadata = {
  title: "You're Offline",
  description: "No internet connection",
  manifest: "/manifest.webmanifest",
  icons: "/assets/icon.jpeg",
  other: {
    "theme-color": "#f97316",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflineLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <HtmlShell>{children}</HtmlShell>;
}
