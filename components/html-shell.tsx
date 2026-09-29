import "@/app/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Hind_Siliguri, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import SessionProvider from "@/components/session-provider";
import {
  SITE_URL,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
} from "@/lib/site-config";

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

/**
 * Metadata every route group that renders `HtmlShell` needs: the absolute URL
 * base for relative `canonical`/`og:image` values, the manifest, icons and the
 * theme colour. Each layout spreads this and then overrides only what is
 * actually different for that group, so there is a single place to change any
 * of it.
 *
 * Title, description, openGraph and twitter are deliberately *not* set here:
 * those are per-page values, and setting them on the shell leaked the homepage
 * copy onto every page. Each group sets its own default title and inherits the
 * per-page values from its children.
 */
export const shellMetadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    manifest: "/manifest.webmanifest",
    icons: "/assets/logo/favicon.webp",
    other: {
        "theme-color": "#f97316",
    },
};

/** Default social card used by any page that does not ship its own image. */
export const defaultSocialImage = SITE_OG_IMAGE;

export const defaultSiteMetadata: Metadata = {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    openGraph: {
        title: SITE_DEFAULT_TITLE,
        description: SITE_DEFAULT_DESCRIPTION,
        url: SITE_URL,
        siteName: SITE_NAME,
        type: "website",
        images: [SITE_OG_IMAGE],
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_DEFAULT_TITLE,
        description: SITE_DEFAULT_DESCRIPTION,
        images: [SITE_OG_IMAGE.url],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="bn"
            data-lang="bn"
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
