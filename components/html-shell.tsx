import "@/app/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Hind_Siliguri, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import SessionProvider from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bangla",
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Learn English Vocabulary in Bangla | Zero English",
    description:
        "Master essential English words with Bangla meanings and example sentences. Learn at your own pace — A1 to C2 levels covered.",
    manifest: "/manifest.webmanifest",
    icons: "/assets/logo/favicon.webp",
    openGraph: {
        title: "Learn English Vocabulary in Bangla | Zero English",
        description:
            "Master essential English words with Bangla meanings and example sentences. Learn at your own pace — A1 to C2 levels covered.",
        images: [
            {
                url: "/assets/logo/open-graph.png",
                width: 1254,
                height: 1254,
                alt: "Zero English - Learn English Vocabulary in Bangla",
            },
        ],
        type: "website",
        siteName: "Zero English",
    },
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
                hindSiliguri.variable,
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
            </body>
        </html>
    );
}
