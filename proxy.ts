import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ALLOWED_SITE_ORIGINS } from "@/lib/site-domains";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? "300", 10) || 300;
const RATE_LIMIT_BUCKET_CAP = 100_000;

// Fixed-window in-memory rate limiter keyed by client IP. Suitable for the
// single-process Node deployment; per-instance limits on multi-replica setups.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0].trim();
        if (first) return first;
    }
    return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimited(request: NextRequest): NextResponse | null {
    const now = Date.now();
    const windowStart = Math.floor(now / RATE_LIMIT_WINDOW_MS);
    const key = `${getClientIp(request)}:${windowStart}`;
    let bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        bucket = { count: 0, resetAt: (windowStart + 1) * RATE_LIMIT_WINDOW_MS };
        rateBuckets.set(key, bucket);
    }
    bucket.count += 1;

    if (rateBuckets.size > RATE_LIMIT_BUCKET_CAP) {
        for (const [k, b] of rateBuckets) {
            if (b.resetAt <= now) rateBuckets.delete(k);
        }
    }

    if (bucket.count > RATE_LIMIT_MAX) {
        return NextResponse.json(
            { data: null, message: "Too many requests, please try again later", success: false },
            { status: 429 }
        );
    }
    return null;
}

export async function proxy(request: NextRequest) {
    const origin = request.headers.get("origin");

    // Rate-limit API traffic (except CORS preflights) to blunt DoS abuse.
    if (
        request.nextUrl.pathname.startsWith("/api/v1") &&
        request.method !== "OPTIONS"
    ) {
        const limited = rateLimited(request);
        if (limited) return limited;
    }

    let response: NextResponse;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        response = new NextResponse(null, { status: 204 });
    } else {
        response = NextResponse.next();
    }

    // Apply CORS headers only for allowed origins
    if (origin && ALLOWED_SITE_ORIGINS.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        response.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Vary", "Origin");
    }

    if (request.nextUrl.pathname.startsWith("/admin")) {
        const token = await getToken({
            req: request,
            secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", request.url);
            return NextResponse.redirect(loginUrl);
        }

        if (token.role !== "admin") {
            return NextResponse.redirect(new URL("/profile", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ["/api/v1/:path*", "/admin/:path*"],
};
