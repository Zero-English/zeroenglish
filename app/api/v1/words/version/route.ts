import { NextResponse } from "next/server";
import { getVocabVersion } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/version:
 *   get:
 *     summary: Get current vocabulary dataset version
 *     description: Returns the version number of the vocabulary dataset. The client compares this against its locally cached version to decide whether to re-fetch.
 *     tags:
 *       - Words
 *     responses:
 *       200:
 *         description: Vocabulary version
 */
export async function GET() {
    return NextResponse.json(await getVocabVersion());
}