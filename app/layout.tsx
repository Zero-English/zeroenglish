import type { Metadata } from "next";
import Script from "next/script";
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
  title: "Learn English Oxford 3000 Word Vocabulary in Bangla | Zero English",
  description: "Master 3000 essential English words with Bangla meanings and example sentences. Learn at your own pace — A1 to B2 levels covered.",
  manifest: "/manifest.webmanifest",
  icons: "/assets/icon.jpeg",
  other: {
    "theme-color": "#f97316",
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QYD6X9WTL4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-QYD6X9WTL4');`}
        </Script>
      </head>
      <body className="min-h-full">
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `!function(){const e=matchMedia("(prefers-color-scheme: dark)");e.matches&&document.documentElement.classList.add("dark"),e.addEventListener("change",function(){document.documentElement.classList.toggle("dark",e.matches)})}()`,
          }}
        />
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
        <Script
          id="sw-register"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `"serviceWorker" in navigator&&navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"})`,
          }}
        />
      </body>
    </html>
  );
}
