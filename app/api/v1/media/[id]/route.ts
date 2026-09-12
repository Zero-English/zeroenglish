import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { deleteMediaById, moveMediaById, updateMediaById } from "@/services/media.service";
import { mediaUpdateSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/media/{id}:
 *   patch:
 *     summary: Update media metadata
 *     description: Updates the alt text, caption or tags of a media entry.
 *     tags:
 *       - Media
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Media id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               altText:
 *                 type: string
 *               caption:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               folder:
 *                 type: string
 *                 nullable: true
 *                 description: Move the image to this folder name (null moves it to the root)
 *     responses:
 *       200:
 *         description: Media updated successfully
 *       400:
 *         description: Validation failed or invalid media id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Media not found
 *   delete:
 *     summary: Delete media
 *     description: Permanently deletes the image from ImageKit and the media library.
 *     tags:
 *       - Media
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Media id
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *       400:
 *         description: Invalid media id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Media not found
 */

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (Number.isNaN(mediaId)) {
        return NextResponse.json({ data: null, message: "Invalid media id", success: false }, { status: 400 });
    }

    const body = await request.json();
    const parsed = mediaUpdateSchema.safeParse(body);
    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location ? `Validation failed at "${location}": ${detail}` : `Validation failed: ${detail}`;
        logger.warn(`Media update rejected: validation failed`, { mediaId, location, detail });
        return NextResponse.json({ data: null, message, success: false }, { status: 400 });
    }

    const result = await applyUpdate(mediaId, parsed.data);
    if (!result.success) {
        let status = result.message === "Media not found" ? 404 : 400;
        if (result.message.includes("Failed to")) status = 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
}

type MediaPatch = {
    altText?: string;
    caption?: string;
    tags?: string[];
    folder?: string | null;
};

async function applyUpdate(mediaId: number, data: MediaPatch) {
    let movedValue: Awaited<ReturnType<typeof moveMediaById>> | null = null;
    if (data.folder !== undefined) {
        movedValue = await moveMediaById(mediaId, data.folder);
        if (!movedValue.success) return movedValue;
    }

    const hasMeta = data.altText !== undefined || data.caption !== undefined || data.tags !== undefined;
    if (hasMeta) {
        const updated = await updateMediaById(mediaId, {
            altText: data.altText,
            caption: data.caption,
            tags: data.tags,
        });
        if (!updated.success) return updated;
        return updated;
    }

    if (!movedValue) {
        return { data: null, message: "No fields to update", success: false };
    }
    return movedValue;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (Number.isNaN(mediaId)) {
        return NextResponse.json({ data: null, message: "Invalid media id", success: false }, { status: 400 });
    }

    const result = await deleteMediaById(mediaId);
    if (!result.success) {
        const status = result.message === "Media not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
}