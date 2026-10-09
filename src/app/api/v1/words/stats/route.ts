import { NextResponse } from "next/server";
import { getWordStats } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/stats:
 *   get:
 *     summary: Get public word statistics
 *     description: Returns per-level word counts and lightweight word references (id, word, level) used for progress tracking.
 *     tags:
 *       - Words
 *     responses:
 *       200:
 *         description: Word stats
 */
export async function GET() {
    return NextResponse.json(await getWordStats());
}