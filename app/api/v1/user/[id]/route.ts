import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUserById, deleteUserById } from "@/services/user.service";
import { updateUserSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

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
 *   put:
 *     summary: Update a user
 *     description: Updates the editable fields (name, username, email, role, image) of a user. Admin only.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               user_name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by id. Admin only. Cannot delete your own account.
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
 *         description: User deleted
 *       400:
 *         description: Cannot delete your own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
function parseId(id: string): number | null {
    const parsed = parseInt(id, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

async function requireAdmin(): Promise<boolean> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return false;
    return session.user.role === "admin";
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = parseId(id);

    if (userId === null) {
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await requireAdmin())) {
        return NextResponse.json(
            { data: null, message: "Forbidden", success: false },
            { status: 403 }
        );
    }

    const { id } = await params;
    const userId = parseId(id);

    if (userId === null) {
        return NextResponse.json(
            { data: null, message: "Invalid user id", success: false },
            { status: 400 }
        );
    }

    const body = await request.json();

    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`User update rejected: validation failed`, { location, detail });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await updateUserById(userId, parsed.data);

    if (!result.success) {
        const status = (result as { status?: number }).status ?? 500;
        return NextResponse.json(result, { status });
    }

    logger.info(`User updated`, { id: userId });
    return NextResponse.json(result);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = parseId(id);

    if (userId === null) {
        return NextResponse.json(
            { data: null, message: "Invalid user id", success: false },
            { status: 400 }
        );
    }

    if (userId === session.user.id) {
        return NextResponse.json(
            { data: null, message: "You cannot delete your own account", success: false },
            { status: 400 }
        );
    }

    const result = await deleteUserById(userId);

    if (!result.success) {
        return NextResponse.json(result, { status: result.message === "User not found" ? 404 : 500 });
    }

    logger.info(`User deleted`, { id: userId });
    return NextResponse.json(result);
}