import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions, markBindIntentPending, clearBindIntent } from "@/lib/auth";
import { BIND_COOKIE } from "@/lib/bind-intent";

const baseAuth = NextAuth(authOptions);

// Cookie armed by POST /api/v1/auth/bind/begin when a guest clicks
// "Continue with Google" to bind an account. The OAuth callback request
// carries it; if present we mark a bind intent so the signIn callback can
// reject existing accounts and create new ones (which then receive the
// guest's synced data).

// NextAuth v4 hardcodes the default base path (/api/auth) for the OAuth
// redirect/callback URLs it generates on the server. To keep sign-in and the
// Google callback working, this route MUST live at /api/auth/[...nextauth].
// We additionally pin NEXTAUTH_URL to the live request host so sign-in/return
// URLs match whatever domain the app is served from (localhost in dev, the
// real public domain in production) instead of a hardcoded URL.

async function handler(
    req: NextRequest,
    ctx: { params: Promise<{ nextauth: string[] }> },
) {
    const configured = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
    const host =
        req.headers.get("x-forwarded-host") || req.headers.get("host") || undefined;
    const proto = req.headers.get("x-forwarded-proto") || "http";

    if (host && (!configured || configured === "http://localhost:3000")) {
        process.env.NEXTAUTH_URL = `${proto}://${host}`;
    }

    const params = await ctx.params;
    const isCallback = params.nextauth?.[0] === "callback";
    const hasBindIntent = req.cookies.get(BIND_COOKIE)?.value === "1";
    if (isCallback && hasBindIntent) {
        markBindIntentPending();
    }

    const res = await baseAuth(req, { params: ctx.params });

    if (isCallback && hasBindIntent) {
        clearBindIntent();
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
