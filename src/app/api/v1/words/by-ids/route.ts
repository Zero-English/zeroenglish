import { NextRequest, NextResponse } from "next/server";
import { getWordsByIds } from "@/services/word.service";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/words/by-ids:
 *   get:
 *     summary: Fetch public words by a comma-separated list of IDs
 *     description: Returns word details for the requested IDs in the public frontend shape.
 *     tags:
 *       - Words
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const rawIds = searchParams.get("ids") || "";
    const ids = rawIds
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0);

    const result = await getWordsByIds(ids);
    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as { ids?: number[] };
        const ids = Array.isArray(body.ids)
            ? body.ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)
            : [];
        const result = await getWordsByIds(ids);
        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { data: null, message: "Invalid JSON body", success: false },
            { status: 400 }
        );
    }
}
