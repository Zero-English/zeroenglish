import { NextResponse, NextRequest } from "next/server";
import { getUserById } from "@/services/user.service";

/**
 * @openapi
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get a user by id
 *     description: Returns a single user by their id.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User id
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (Number.isNaN(userId)) {
        return NextResponse.json(
            { data: null, message: "Invalid user id", success: false },
            { status: 400 }
        );
    }

    const result = await getUserById(userId);

    if (!result.success) {
        return NextResponse.json(result, { status: result.message === "User not found" ? 404 : 500 });
    }

    return NextResponse.json(result);
}
