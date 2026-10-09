import type { Metadata } from "next";
import HtmlShell, { shellMetadata } from "@/components/html-shell";

export const metadata: Metadata = {
  ...shellMetadata,
  title: "You're Offline | Zero English",
  description: "No internet connection",
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
