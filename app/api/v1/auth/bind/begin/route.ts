import { NextResponse } from "next/server";
import { BIND_COOKIE, BIND_COOKIE_MAX_AGE } from "@/lib/bind-intent";

/**
 * @openapi
 * /api/v1/auth/bind/begin:
 *   post:
 *     summary: Arm the "bind guest account" intent
 *     description: Sets a short-lived `pending_bind` cookie so the upcoming
 *       NextAuth OAuth callback can reject sign-in attempts for Google accounts
 *       that already exist in the user table (only new accounts are allowed to
 *       be bound, and they receive the guest's synced data).
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Bind intent armed
 */

export async function POST() {
    const res = NextResponse.json({
        data: { armed: true },
        message: "Bind intent armed",
        success: true,
    });
    res.cookies.set(BIND_COOKIE, "1", {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: BIND_COOKIE_MAX_AGE,
    });
    return res;
}