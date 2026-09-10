import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Learn English Vocabulary in Bangla | Zero English",
  description:
    "Master essential English words with Bangla meanings and example sentences. Learn at your own pace — A1 to C2 levels covered.",
  manifest: "/manifest.webmanifest",
  icons: "/assets/icon.jpeg",
  other: {
    "theme-color": "#f97316",
  },
  robots: {
    index: true,
    follow: true,
  },
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
          </div>
        </LanguageProvider>
      </SidebarProvider>
      <Toaster />
    </HtmlShell>
  );
}
