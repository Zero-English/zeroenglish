import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:7273",
    "https://zeroenglish.vercel.app",
    "https://ze.tahmidhasan.net",
    "https://zeroenglish.tahmidhasan.net",
    "https://zeroenglish.org",
];

export async function proxy(request: NextRequest) {
    const origin = request.headers.get("origin");
    // Create response first
    let response: NextResponse;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        response = new NextResponse(null, { status: 204 });
    } else {
        response = NextResponse.next();
    }

    // Apply CORS headers only for allowed origins
    if (origin && allowedOrigins.includes(origin)) {
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
