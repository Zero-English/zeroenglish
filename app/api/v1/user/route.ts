import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { getUsersByPage, deleteUsersByIds } from "@/services/user.service";
import logger from "@/utils/logger";

/**
 * @openapi
 * /api/v1/user:
 *   get:
 *     summary: Get users by page
 *     description: Returns a paginated list of users.
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of users
 *   delete:
 *     summary: Delete multiple users
 *     description: Deletes multiple users by their ids. Admin only. Cannot delete your own account.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Users deleted
 *       400:
 *         description: Invalid ids
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export async function GET(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getUsersByPage(page, limit);
    return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }
    if (session.user.role !== "admin") {
        return NextResponse.json(
            { data: null, message: "Forbidden", success: false },
            { status: 403 }
        );
    }

    let body: { ids?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { data: null, message: "Invalid JSON body", success: false },
            { status: 400 }
        );
    }

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
        return NextResponse.json(
            { data: null, message: "ids must be a non-empty array", success: false },
            { status: 400 }
        );
    }

    const ids = body.ids
        .map((v) => Number(v))
        .filter((v) => Number.isSafeInteger(v) && v > 0);

    if (ids.length === 0) {
        return NextResponse.json(
            { data: null, message: "ids must contain valid user ids", success: false },
            { status: 400 }
        );
    }

    if (ids.includes(session.user.id)) {
        return NextResponse.json(
            { data: null, message: "You cannot delete your own account", success: false },
            { status: 400 }
        );
    }

    const result = await deleteUsersByIds(ids);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`Users deleted (bulk)`, { count: ids.length });
    return NextResponse.json(result);
}
