import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminShell from "./shell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Admin | Zero English",
  description: "Zero English admin panel for managing users and vocabulary.",
  manifest: "/manifest.webmanifest",
  icons: "/assets/logo/favicon.webp",
  other: {
    "theme-color": "#f97316",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (role !== "admin") {
    // Contributors get redirected to their submission area; any other role is
    // sent home. Either way, /admin is admin-only.
    redirect(role === "contributor" ? "/contribute" : "/");
  }

  return (
    <AdminShell>{children}</AdminShell>
  );
}