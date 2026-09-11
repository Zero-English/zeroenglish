import { NextResponse } from "next/server";
import { getAllPublicWords } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/all:
 *   get:
 *     summary: Get all words in the public shape
 *     description: Returns the complete vocabulary dataset (no pagination) in the public frontend shape. Used to populate the client-side IndexedDB cache.
 *     tags:
 *       - Words
 *     responses:
 *       200:
 *         description: Full word list
 */
export async function GET() {
    return NextResponse.json(await getAllPublicWords());
}