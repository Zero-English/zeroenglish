import "@/app/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import SessionProvider from "@/components/session-provider";

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
    title: "Learn English Oxford 3000 Word Vocabulary in Bangla | Zero English",
    description:
        "Master 3000 essential English words with Bangla meanings and example sentences. Learn at your own pace — A1 to B2 levels covered.",
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                geistSans.variable,
                geistMono.variable,
                "font-sans",
                inter.variable,
            )}
            suppressHydrationWarning
        >
            <head>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-6BF3FVESN8"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-6BF3FVESN8');`}
                </Script>
            </head>
            <body className="min-h-full">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionProvider>{children}</SessionProvider>
                </ThemeProvider>
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
