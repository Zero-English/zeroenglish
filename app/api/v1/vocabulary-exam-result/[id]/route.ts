import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import { getVocabularyExamResultById } from "@/services/vocabulary-exam-result.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/vocabulary-exam-result/{id}:
 *   get:
 *     summary: Get a vocabulary quiz exam result
 *     description: >
 *       Returns a single vocabulary quiz exam result belonging to the current
 *       authenticated user, including the words answered correctly and
 *       incorrectly. Admins may fetch any result.
 *     tags:
 *       - Vocabulary Exam Result
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary exam result id
 *     responses:
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid result id
 *       404:
 *         description: Vocabulary exam result not found
 *       500:
 *         description: Failed to fetch vocabulary exam result
 *       200:
 *         description: Vocabulary exam result
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const resultId = parseInt(id, 10);

    if (Number.isNaN(resultId) || resultId < 1) {
        return NextResponse.json(
            { data: null, message: "Invalid result id", success: false },
            { status: 400 }
        );
    }

    const result = await getVocabularyExamResultById(
        resultId,
        user.role === "admin" ? undefined : user.id
    );

    if (!result.success) {
        const status = result.message === "Vocabulary exam result not found" ? 404 : 500;
        if (status === 500) {
            logger.error(`Vocabulary exam result fetch by id failed`, {
                resultId,
                message: result.message,
            });
        }
        return NextResponse.json(result, { status });
    }

    logger.info(`Vocabulary exam result fetch by id succeeded`, { resultId });

    return NextResponse.json(result);
}