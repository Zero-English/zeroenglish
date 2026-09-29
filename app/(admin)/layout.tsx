import type { Metadata,Viewport  } from "next";
import HtmlShell, { shellMetadata } from "@/components/html-shell";
import { SITE_TITLE_TEMPLATE } from "@/lib/site-config";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...shellMetadata,
  title: {
    default: `Admin${SITE_TITLE_TEMPLATE.replace("%s ", "")}`,
    template: SITE_TITLE_TEMPLATE,
  },
  description: "Zero English admin panel for managing users and vocabulary.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <HtmlShell>{children}</HtmlShell>;
}
