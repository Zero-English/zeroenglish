import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
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

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
