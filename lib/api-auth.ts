import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const unauthorizedResponse = () =>
    NextResponse.json(
        { data: null, message: "Unauthorized", success: false },
        { status: 401 }
    );

export const forbiddenResponse = () =>
    NextResponse.json(
        { data: null, message: "Forbidden", success: false },
        { status: 403 }
    );

export type ApiSessionUser = {
    id: number;
    role: string;
};

export async function getApiSessionUser(): Promise<ApiSessionUser | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    const id =
        typeof session.user.id === "number" ? session.user.id : Number(session.user.id);
    return { id, role: session.user.role ?? "user" };
}

/**
 * Guard for handlers that require any authenticated user. Returns an error
 * response when unauthenticated, otherwise null so the handler can continue.
 */
export async function requireAuth(): Promise<NextResponse | null> {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();
    return null;
}

/**
 * Guard for handlers that require an admin. Returns an error response when
 * unauthenticated (401) or non-admin (403), otherwise null so the handler can
 * continue.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "admin") return forbiddenResponse();
    return null;
}