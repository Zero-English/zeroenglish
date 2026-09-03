import { NextResponse, NextRequest } from "next/server";
import { getAllWords, getWordsByPage, createWord } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words:
 *   get:
 *     summary: Get all words
 *     description: Returns all words or paginated words based on query parameters.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of words
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get("page");

    if (pageParam) {
        const page = parseInt(pageParam, 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const result = await getWordsByPage(page, limit);
        return NextResponse.json(result);
    }

    const result = await getAllWords();
    return NextResponse.json(result);
}

/**
 * @openapi
 * /api/v1/words:
 *   post:
 *     summary: Create a word
 *     description: Creates a new word entry.
 *     tags:
 *       - Words
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *               - meaningBn
 *               - definitionEn
 *               - definitionBn
 *               - level
 *               - category
 *               - wordType
 *             properties:
 *               word:
 *                 type: string
 *               meaningBn:
 *                 type: array
 *                 items:
 *                   type: string
 *               synonyms:
 *                 type: array
 *                 items:
 *                   type: string
 *               antonyms:
 *                 type: array
 *                 items:
 *                   type: string
 *               definitionEn:
 *                 type: string
 *               definitionBn:
 *                 type: string
 *               examplesEn:
 *                 type: array
 *                 items:
 *                   type: string
 *               examplesBn:
 *                 type: array
 *                 items:
 *                   type: string
 *               level:
 *                 type: string
 *                 enum: [A1, A2, B1, B2, C1, C2]
 *               category:
 *                 type: string
 *               wordType:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Word created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Word already exists
 */
export async function POST(request: NextRequest) {
    const body = await request.json();

    const requiredFields = ["word", "meaningBn", "definitionEn", "definitionBn", "level", "category", "wordType"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
        return NextResponse.json(
            { data: null, message: `Missing required fields: ${missingFields.join(", ")}`, success: false },
            { status: 400 }
        );
    }

    const result = await createWord(body);

    if (!result.success) {
        const status = result.message === "Word already exists" ? 409 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
}
