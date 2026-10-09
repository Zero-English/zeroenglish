import { NextResponse, NextRequest } from "next/server";
import { requireAuth, getApiSessionUser } from "@/lib/api-auth";
import {
    updateUserAvatar,
    MAX_AVATAR_FILE_SIZE,
} from "@/services/avatar.service";
import logger from "@/utils/logger";

/**
 * @openapi
 * /api/v1/profile/avatar:
 *   post:
 *     summary: Upload your profile picture
 *     description: Uploads the authenticated user's profile picture to ImageKit and updates their image URL.
 *     tags:
 *       - Profile
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
 *                 description: The image file (JPEG, PNG, WEBP; max 5MB)
 *     responses:
 *       200:
 *         description: Profile picture updated
 *       400:
 *         description: Invalid file or file type
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
    const error = await requireAuth();
    if (error) return error;

    const user = await getApiSessionUser();
    if (!user) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch (error) {
        logger.warn(`Avatar upload rejected: invalid request body`, { detail: String(error) });
        return NextResponse.json(
            { data: null, message: "Invalid upload request", success: false },
            { status: 400 },
        );
    }

    const file = formData.get("file");

    if (!file || typeof file === "string") {
        logger.warn(`Avatar upload rejected: no file uploaded`);
        return NextResponse.json(
            { data: null, message: "An image file must be selected", success: false },
            { status: 400 },
        );
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
        logger.warn(`Avatar upload rejected: file too large`, {
            fileName: file.name,
            size: file.size,
        });
        return NextResponse.json(
            { data: null, message: "Profile picture is too large (max 5MB)", success: false },
            { status: 400 },
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await updateUserAvatar(user.id, {
        fileBuffer: buffer,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
    });

    if (!result.success) {
        const status = result.message.toLowerCase().includes("jpeg")
            || result.message.toLowerCase().includes("empty")
            ? 400
            : 500;
        return NextResponse.json(result, { status });
    }

    logger.info(`Profile picture updated`, { id: user.id });
    return NextResponse.json(result);
}