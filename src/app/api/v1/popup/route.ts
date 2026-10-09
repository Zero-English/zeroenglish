import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { createPopup, getPopupsByPage } from "@/services/popup.service";
import { popupSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/popup:
 *   get:
 *     summary: List popups
 *     description: Paginated list of popup banners for the admin panel.
 *     tags:
 *       - Popup
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
 *           maximum: 100
 *         description: Items per page (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by popup name
 *     responses:
 *       200:
 *         description: Popups fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a popup
 *     description: Creates a new popup banner with images, link, schedule and targeting.
 *     tags:
 *       - Popup
 *     responses:
 *       201:
 *         description: Popup created successfully
 *       400:
 *         description: Validation failed
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
        100,
        Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10),
    );
    const search = searchParams.get("search")?.trim() || undefined;

    const result = await getPopupsByPage(page, limit, search);
    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    let body: unknown;
    try {
        body = await request.json();
    } catch (error) {
        logger.warn(`Popup create rejected: invalid request body`, {
            detail: String(error),
        });
        return NextResponse.json(
            { data: null, message: "Invalid request body", success: false },
            { status: 400 },
        );
    }

    const parsed = popupSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Popup create rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 },
        );
    }

    const result = await createPopup(parsed.data);

    if (!result.success) {
        const status = result.message.includes("Opening time") ||
            result.message.includes("image") ? 400 : 500;
        logger.error(`Popup create failed`, { message: result.message });
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
}