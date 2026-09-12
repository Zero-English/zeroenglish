import { NextResponse } from "next/server";
import { getActivePopups } from "@/services/popup.service";

/**
 * @openapi
 * /api/v1/popup/active:
 *   get:
 *     summary: Get active popups
 *     description: Returns currently active popup banners within their schedule window. Audience and page-rule filtering happen client-side.
 *     tags:
 *       - Popup
 *     responses:
 *       200:
 *         description: Active popups fetched successfully
 */
export async function GET() {
    const result = await getActivePopups();
    return NextResponse.json(result);
}