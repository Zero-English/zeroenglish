import { NextResponse, NextRequest } from "next/server";
import { getAllWords, getWordsByPage, createWord, createWordsBulk } from "@/services/word.service";
import { wordsArraySchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

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
 *     description: Creates a new word entry. Use ?bulk=true to bulk-import words from a JSON file.
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
    const isBulk = request.nextUrl.searchParams.get("bulk") === "true";

    if (isBulk) {
        return handleBulkCreate(request);
    }

    return handleSingleCreate(request);
}

async function handleBulkCreate(request: NextRequest) {
    const startTime = Date.now();

    logger.info(`Bulk word import started`);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
        logger.warn(`Bulk word import failed: no file uploaded`);
        return NextResponse.json(
            { data: null, message: "A .json file must be uploaded", success: false },
            { status: 400 }
        );
    }

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        logger.warn(`Bulk word import rejected: not a .json file`, {
            fileName: file.name,
            mimeType: file.type,
        });
        return NextResponse.json(
            { data: null, message: "Only .json files are allowed", success: false },
            { status: 400 }
        );
    }

    const text = await file.text();

    let body: unknown;
    try {
        body = JSON.parse(text);
    } catch (error) {
        logger.error(`Bulk word import failed: invalid JSON`, {
            fileName: file.name,
            detail: String(error),
        });
        return NextResponse.json(
            { data: null, message: "Invalid JSON. Please check the file syntax.", success: false },
            { status: 400 }
        );
    }

    if (!Array.isArray(body)) {
        logger.warn(`Bulk word import rejected: root is not an array`, { fileName: file.name });
        return NextResponse.json(
            { data: null, message: "JSON must be an array of word objects", success: false },
            { status: 400 }
        );
    }

    if (body.length === 0) {
        logger.warn(`Bulk word import rejected: empty array`, { fileName: file.name });
        return NextResponse.json(
            { data: null, message: "The JSON file does not contain any words", success: false },
            { status: 400 }
        );
    }

    const parsed = wordsArraySchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Bulk word import rejected: validation failed`, {
            fileName: file.name,
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    logger.info(`Bulk word import validation passed`, {
        fileName: file.name,
        rowCount: parsed.data.length,
    });

    const result = await createWordsBulk(parsed.data);

    if (!result.success) {
        logger.error(`Bulk word import failed during database write`, {
            fileName: file.name,
            rowCount: parsed.data.length,
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`Bulk word import completed`, {
        fileName: file.name,
        createdCount: result.data?.count,
        durationMs: Date.now() - startTime,
    });

    return NextResponse.json(result, { status: 201 });
}

async function handleSingleCreate(request: NextRequest) {
    logger.info(`Single word create started`);

    const body = await request.json();

    const requiredFields = ["word", "meaningBn", "definitionEn", "definitionBn", "level", "category", "wordType"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
        logger.warn(`Single word create rejected: missing required fields`, {
            missingFields,
            word: body?.word,
        });
        return NextResponse.json(
            { data: null, message: `Missing required fields: ${missingFields.join(", ")}`, success: false },
            { status: 400 }
        );
    }

    const result = await createWord(body);

    if (!result.success) {
        const status = result.message === "Word already exists" ? 409 : 500;
        logger.error(`Single word create failed`, {
            word: body?.word,
            status,
            message: result.message,
        });
        return NextResponse.json(result, { status });
    }

    logger.info(`Single word create succeeded`, {
        word: result.data?.word,
        id: result.data?.id,
    });

    return NextResponse.json(result, { status: 201 });
}
