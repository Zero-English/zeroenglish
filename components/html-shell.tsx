import "@/app/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Hind_Siliguri, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import SessionProvider from "@/components/session-provider";
import { SITE_URL, SITE_NAME, SITE_DEFAULT_DESCRIPTION } from "@/lib/site-config";

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
    metadataBase: new URL(SITE_URL),
    title: "Learn English Vocabulary in Bangla | Zero English",
    description: SITE_DEFAULT_DESCRIPTION,
    manifest: "/manifest.webmanifest",
    icons: "/assets/logo/favicon.webp",
    openGraph: {
        title: "Learn English Vocabulary in Bangla | Zero English",
        description: SITE_DEFAULT_DESCRIPTION,
        locale: "en_US",
        url: SITE_URL,
        siteName: SITE_NAME,
        images: [
            {
                url: "/assets/logo/open-graph.png",
                width: 1254,
                height: 1254,
                alt: "Zero English - Learn English Vocabulary in Bangla",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Learn English Vocabulary in Bangla | Zero English",
        description: SITE_DEFAULT_DESCRIPTION,
        images: ["/assets/logo/open-graph.png"],
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
                    src="https://www.googletagmanager.com/gtag/js?id=G-FPN6QHHBXY"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FPN6QHHBXY');`}
                </Script>
            </head>
            <body className="min-h-full left-env-space right-env-space" cz-shortcut-listen="true" suppressHydrationWarning>
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
