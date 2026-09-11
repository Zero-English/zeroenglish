import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions, bindIntentStore } from "@/lib/auth";
import { BIND_COOKIE } from "@/lib/bind-intent";
import { ALLOWED_SITE_HOSTS } from "@/lib/site-domains";

const baseAuth = NextAuth(authOptions);

// Cookie armed by POST /api/v1/auth/bind/begin when a guest clicks
// "Continue with Google" to bind an account. The OAuth callback request
// carries it; if present we run the callback with a request-scoped bind intent
// (AsyncLocalStorage) so the signIn callback can reject existing accounts and
// forbid rebinding an already-registered Google account onto guest data.

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
    const isCallback = params.nextauth?.[0] === "callback";
    const hasBindIntent = req.cookies.get(BIND_COOKIE)?.value === "1";

    const res = await bindIntentStore.run(
        { pending: isCallback && hasBindIntent },
        () => baseAuth(req, { params: ctx.params }),
    );

    if (isCallback && hasBindIntent) {
        // NextAuth returns a plain Response here (cookies already serialized
        // into "Set-Cookie" headers), so append the cookie expiry instead of
        // mutating res.cookies.
        const headers = new Headers(res.headers);
        headers.append(
            "Set-Cookie",
            `${BIND_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
        );
        return new NextResponse(res.body, {
            status: res.status,
            statusText: res.statusText,
            headers,
        });
    }

    return res;
}

export { handler as GET, handler as POST };
