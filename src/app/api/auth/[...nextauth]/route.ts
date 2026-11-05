import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { ALLOWED_SITE_HOSTS } from "@/lib/site-domains";

const baseAuth = NextAuth(authOptions);

// NextAuth v4 hardcodes the default base path (/api/auth) for the OAuth
// redirect/callback URLs it generates on the server. To keep sign-in and the
// Google callback working, this route MUST live at /api/auth/[...nextauth].
// We additionally pin NEXTAUTH_URL to the live request host so sign-in/return
// URLs match whatever domain the app is served from. The host is only trusted
// when it comes from an allow-listed domain, so spoofed Host /
// X-Forwarded-Host headers cannot steer OAuth redirect URLs.

const normalizedHost = (value: string | null): string | undefined => {
    const h = value?.trim().toLowerCase().replace(/\/+$/, "");
    return h ? h : undefined;
};

function configHost(): string | undefined {
    const configured = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
    if (!configured) return undefined;
    try {
        return new URL(configured).host.toLowerCase();
    } catch {
        return undefined;
    }
}

function buildAutoUrl(req: NextRequest): string | undefined {
    const configured = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
    // Only auto-derive when no URL is configured or we're on the dev default.
    if (configured && configured !== "http://localhost:3000") return undefined;

    const host = normalizedHost(
        req.headers.get("x-forwarded-host") || req.headers.get("host")
    );
    if (!host) return undefined;

    const trusted =
        host === configHost() || (ALLOWED_SITE_HOSTS as readonly string[]).includes(host);
    if (!trusted) return undefined;

    let proto = (req.headers.get("x-forwarded-proto") || "http")
        .split(",")[0]
        .trim()
        .toLowerCase();
    if (proto !== "https" && proto !== "http") proto = "http";

    return `${proto}://${host}`;
}

async function handler(
    req: NextRequest,
    ctx: { params: Promise<{ nextauth: string[] }> },
) {
    const autoUrl = buildAutoUrl(req);
    if (autoUrl) {
        process.env.NEXTAUTH_URL = autoUrl;
    }

    const params = await ctx.params;
    // NextAuth redirects failed OAuth flows to its built-in signin page with
    // ?error=OAuthCallback. Send those users to the home page instead.
    if (
        params.nextauth?.[0] === "signin" &&
        req.nextUrl.searchParams.get("error") === "OAuthCallback"
    ) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return baseAuth(req, { params: ctx.params });
}

export { handler as GET, handler as POST };
