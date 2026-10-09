import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { createFolder, getFolders, removeFolder } from "@/services/media-folder.service";
import { folderCreateSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/media/folders:
 *   get:
 *     summary: List media folders
 *     description: Lists the ImageKit folders of the media library with image counts.
 *     tags:
 *       - Media
 *     responses:
 *       200:
 *         description: Folders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a media folder
 *     description: Creates a new ImageKit folder to organize images in the media library.
 *     tags:
 *       - Media
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Folder name (letters, numbers, spaces, hyphens, underscores; max 40)
 *     responses:
 *       201:
 *         description: Folder created successfully
 *       400:
 *         description: Validation failed or folder name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Delete an empty media folder
 *     description: Deletes an ImageKit folder only when it contains no images.
 *     tags:
 *       - Media
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Folder name
 *     responses:
 *       200:
 *         description: Folder deleted successfully
 *       400:
 *         description: Folder is not empty or invalid name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

export async function GET() {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const result = await getFolders();
    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const body = await request.json();
    const parsed = folderCreateSchema.safeParse(body);
    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location ? `Validation failed at "${location}": ${detail}` : `Validation failed: ${detail}`;
        logger.warn(`Folder create rejected: validation failed`, { location, detail });
        return NextResponse.json({ data: null, message, success: false }, { status: 400 });
    }

    const result = await createFolder(parsed.data.name);
    if (!result.success) {
        const status = result.message === "A folder with this name already exists" ? 400 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const name = request.nextUrl.searchParams.get("name")?.trim();
    if (!name) {
        return NextResponse.json(
            { data: null, message: "A folder name is required", success: false },
            { status: 400 },
        );
    }

    const result = await removeFolder(name);
    if (!result.success) {
        const status = result.message.includes("not empty") || result.message.includes("required") ? 400 : 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
}