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
import { SiteSchema } from "@/components/seo/site-schema";
import { shellMetadata } from "@/components/html-shell";
import {
  SITE_NAME,
  SITE_DEFAULT_TITLE,
  SITE_TITLE_TEMPLATE,
  SITE_BRAND_DESCRIPTION_EN,
} from "@/lib/site-config";

export const metadata: Metadata = {
  ...shellMetadata,
  // Pages supply only the part that differs; the brand is appended for them.
  title: {
    default: SITE_DEFAULT_TITLE,
    template: SITE_TITLE_TEMPLATE,
  },
  // Describes only what the site actually does today. The previous copy
  // promised "grammar" and "composition" lessons that do not exist.
  description: SITE_BRAND_DESCRIPTION_EN,
  // No `alternates` and no `openGraph.url` here on purpose. A canonical in a
  // layout is inherited by every page that does not override it, so a
  // layout-level `canonical: "/"` makes the entire site canonicalise to the
  // homepage. Likewise a fixed `openGraph.url` makes every share preview point
  // back at `/`. Both belong to the individual pages, and each one that is
  // indexable now sets them.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "bn_BD",
  },
  twitter: {
    card: "summary_large_image",
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
      <SiteSchema />
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
