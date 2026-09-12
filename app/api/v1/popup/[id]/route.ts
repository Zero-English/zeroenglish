import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import {
    deletePopupById,
    getPopupById,
    updatePopupById,
} from "@/services/popup.service";
import { popupUpdateSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/popup/{id}:
 *   get:
 *     summary: Get a popup
 *     description: Returns a single popup banner with its linked images.
 *     tags:
 *       - Popup
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       400:
 *         description: Invalid popup id
 *       404:
 *         description: Popup not found
 *       200:
 *         description: Popup details
 *   put:
 *     summary: Update a popup
 *     description: Updates a popup banner's configuration and linked images.
 *     tags:
 *       - Popup
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Popup not found
 *       200:
 *         description: Popup updated
 *   delete:
 *     summary: Delete a popup
 *     description: Deletes a popup banner. Linked images are not deleted.
 *     tags:
 *       - Popup
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Popup not found
 *       200:
 *         description: Popup deleted
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const popupId = parseInt(id, 10);

    if (Number.isNaN(popupId)) {
        return NextResponse.json(
            { data: null, message: "Invalid popup id", success: false },
            { status: 400 }
        );
    }

    const result = await getPopupById(popupId);

    if (!result.success) {
        const status = result.message === "Popup not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const popupId = parseInt(id, 10);

    if (Number.isNaN(popupId)) {
        return NextResponse.json(
            { data: null, message: "Invalid popup id", success: false },
            { status: 400 }
        );
    }

    const body = await request.json();

    const parsed = popupUpdateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Popup update rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await updatePopupById(popupId, parsed.data);

    if (!result.success) {
        const clientErrors = new Set([
            "Popup not found",
            "Opening time must be before closing time",
            "One or more selected images do not exist",
        ]);
        const status = clientErrors.has(result.message)
            ? result.message === "Popup not found"
                ? 404
                : 400
            : 500;
        logger.error(`Popup update failed`, { message: result.message });
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const popupId = parseInt(id, 10);

    if (Number.isNaN(popupId)) {
        return NextResponse.json(
            { data: null, message: "Invalid popup id", success: false },
            { status: 400 }
        );
    }

    const result = await deletePopupById(popupId);

    if (!result.success) {
        const status = result.message === "Popup not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}