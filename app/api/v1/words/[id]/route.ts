import { NextResponse, NextRequest } from "next/server";
import { updateWordById, deleteWordById } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/{id}:
 *   put:
 *     summary: Update a word by id
 *     description: Updates an existing word entry.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Word id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Word updated successfully
 *       400:
 *         description: Invalid word id
 *       404:
 *         description: Word not found
 *       409:
 *         description: Word already exists
 *   delete:
 *     summary: Delete a word by id
 *     description: Deletes a word entry.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Word id
 *     responses:
 *       200:
 *         description: Word deleted successfully
 *       400:
 *         description: Invalid word id
 *       404:
 *         description: Word not found
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const wordId = parseInt(id, 10);

    if (Number.isNaN(wordId)) {
        return NextResponse.json(
            { data: null, message: "Invalid word id", success: false },
            { status: 400 }
        );
    }

    const body = await request.json();
    const result = await updateWordById(wordId, body);

    if (!result.success) {
        const status =
            result.message === "Word not found"
                ? 404
                : result.message === "Word already exists"
                ? 409
                : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const wordId = parseInt(id, 10);

    if (Number.isNaN(wordId)) {
        return NextResponse.json(
            { data: null, message: "Invalid word id", success: false },
            { status: 400 }
        );
    }

    const result = await deleteWordById(wordId);

    if (!result.success) {
        const status = result.message === "Word not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}
