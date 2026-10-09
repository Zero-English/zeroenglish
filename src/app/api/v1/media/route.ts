import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import {
    createMedia,
    getMediaByPage,
    MAX_MEDIA_FILE_SIZE,
} from "@/services/media.service";

/**
 * @openapi
 * /api/v1/media:
 *   get:
 *     summary: List media
 *     description: Paginated list of uploaded media library entries.
 *     tags:
 *       - Media
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 12, max 60)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by file name, alt text or caption
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Filter by folder name ("root" for unfiled images, or "all")
 *     responses:
 *       200:
 *         description: Media fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Upload an image
 *     description: Uploads an image to ImageKit and stores its metadata.
 *     tags:
 *       - Media
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file (JPEG, PNG, WEBP, GIF, AVIF, SVG; max 10MB)
 *               altText:
 *                 type: string
 *                 description: Accessible description of the image
 *               caption:
 *                 type: string
 *                 description: Optional caption
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               folder:
 *                 type: string
 *                 description: Folder name to upload into (defaults to the root folder)
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *       400:
 *         description: Invalid file or file type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

export async function GET(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
        60,
        Math.max(1, parseInt(searchParams.get("limit") || "12", 10) || 12),
    );
    const search = searchParams.get("search")?.trim() || undefined;
    const folder = searchParams.get("folder")?.trim() || "all";

    const result = await getMediaByPage(page, limit, search, folder);
    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch (error) {
        logger.warn(`Media upload rejected: invalid request body`, { detail: String(error) });
        return NextResponse.json(
            { data: null, message: "Invalid upload request", success: false },
            { status: 400 },
        );
    }

    const file = formData.get("file");

    if (!file || typeof file === "string") {
        logger.warn(`Media upload rejected: no file uploaded`);
        return NextResponse.json(
            { data: null, message: "An image file must be selected", success: false },
            { status: 400 },
        );
    }

    if (file.size > MAX_MEDIA_FILE_SIZE) {
        logger.warn(`Media upload rejected: file too large`, {
            fileName: file.name,
            size: file.size,
        });
        return NextResponse.json(
            { data: null, message: "Image is too large (max 10MB)", success: false },
            { status: 400 },
        );
    }

    const readText = (key: string) => {
        const value = formData.get(key);
        return value && typeof value === "string" && value.trim().length > 0
            ? value.trim()
            : undefined;
    };

    const tagsValue = readText("tags");
    const tags = tagsValue
        ? tagsValue
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
        : undefined;

    const folder = readText("folder");

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await createMedia({
        fileBuffer: buffer,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        altText: readText("altText"),
        caption: readText("caption"),
        tags,
        folder,
    });

    if (!result.success) {
        const status = result.message.includes("allowed") ? 400 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
}