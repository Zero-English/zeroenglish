import { NextResponse } from "next/server";
import { logoutUser, AUTH_COOKIE_NAMES } from "@/services/auth.service";

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     description: Clears the NextAuth session cookie and logs the user out. Returns a success response. Safe to call even when not authenticated.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     loggedOut:
 *                       type: boolean
 *                       example: true
 */

export async function POST() {
    const result = logoutUser();

    const response = NextResponse.json(result, { status: 200 });

    AUTH_COOKIE_NAMES.forEach((name) => {
        response.cookies.set(name, "", {
            path: "/",
            maxAge: 0,
            httpOnly: true,
            sameSite: "lax",
        });
    });

    return response;
}