import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const baseAuth = NextAuth(authOptions);

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

    return baseAuth(req, { params: ctx.params });
}

export { handler as GET, handler as POST };
