import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/sidebar-provider";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import FFooter from "@/components/FFooter";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn English Vocabulary in Bangla | Oxford 3000 Word List",
  description: "Master 3000 essential English words with Bangla meanings and example sentences. Learn at your own pace — A1 to B2 levels covered.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Vocab 3000",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full">
        <SidebarProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="w-full flex flex-col md:flex-row flex-1">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  {children}
                </div>
              </main>
              <MobileBottomNav/>
              <FFooter />
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
