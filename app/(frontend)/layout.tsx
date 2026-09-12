import type { Metadata, Viewport } from "next";
import HtmlShell from "@/components/html-shell";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/sidebar-provider";
import { LanguageProvider } from "@/components/language-provider";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { TopLoader } from "@/components/top-loader";
import { Toaster } from "@/components/ui/sonner";
import { AppHydration } from "@/components/app-hydration";
import {ActivityTracker} from "@/components/activity-tracker";
import { LoginRequiredDrawer } from "@/components/login-required-drawer";
import { SessionAdopter } from "@/components/session-adopter";
import { PopupHost } from "@/components/popup/popup-host";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://zeroenglish.org"
  ),
  title: "Everything You Need to Master English | Zero English",
  description:
    "Master English in one place with Zero English — learn grammar, vocabulary, composition, quizzes, and more through a complete English learning experience.",
  manifest: "/manifest.webmanifest",
  icons: "/assets/logo/favicon.webp",
  openGraph: {
    title: "Everything You Need to Master English | Zero English",
    description:
      "Master English in one place with Zero English — learn grammar, vocabulary, composition, quizzes, and more through a complete English learning experience.",
    images: [
      {
        url: "/assets/logo/open-graph.png",
        width: 1254,
        height: 1254,
        alt: "Zero English | Everything You Need to Master English",
      },
    ],
    type: "website",
    siteName: "Zero English",
  },
  other: {
    "theme-color": "#000000",
  },
  robots: {
    index: true,
    follow: true,
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HtmlShell>
      <TopLoader />
      <AppHydration />
      <SidebarProvider>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen md:flex-row">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <Header />
              <ActivityTracker />
              <main className="flex-1 min-w-0 w-full">{children}</main>
              <MobileBottomNav />
              <Footer />
            </div>
            <LoginRequiredDrawer />
            <SessionAdopter />
            <PopupHost />
          </div>
        </LanguageProvider>
      </SidebarProvider>
      <Toaster />
    </HtmlShell>
  );
}
