import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { QuizMode, Levels, QuizResultStatus } from "@/generated/prisma/enums";

export type QuizResultStatusValue = Extract<
  QuizResultStatus,
  "SUBMITTED" | "LATE_SUBMITTED" | "ABANDONED" | "REATTEMPTED"
>;

export const createQuizResult = async (data: {
    userId: number;
    clientId?: string | null;
    examId?: number | null;
    title?: string | null;
    mode: QuizMode;
    quizType: string;
    questionCount: number;
    levels: Levels[];
    timePerQuestion: number;
    timeTotalQuiz: number;
    scheduleEnabled: boolean;
    scheduledOpeningTime?: string | null;
    scheduledClosingTime?: string | null;
    correctAnswers: number;
    scoreInPercent: number;
    totalScore: number;
    status?: string | null;
    correctQuestionIds?: number[];
    incorrectQuestionIds?: number[];
}) => {
    try {
        if (data.clientId) {
            const existing = await prisma.quizResults.findFirst({
                where: { clientId: data.clientId },
            });
            if (existing) {
                return {
                    data: existing,
                    message: "Quiz result already recorded (idempotent)",
                    success: true,
                };
            }
        }

        const now = new Date();
        const scheduledOpeningTime = data.scheduledOpeningTime
            ? new Date(data.scheduledOpeningTime)
            : null;
        const scheduledClosingTime = data.scheduledClosingTime
            ? new Date(data.scheduledClosingTime)
            : null;

        const quizType = await prisma.quizType.findUnique({
            where: { name: data.quizType },
        });

        if (!quizType) {
            logger.warn(`Quiz result create rejected: unknown quizType "${data.quizType}"`);
            return {
                data: null,
                message: `Unknown quizType "${data.quizType}"`,
                success: false,
            };
        }

        const baseData = {
            userId: data.userId,
            clientId: data.clientId ?? null,
            examId: data.examId ?? null,
            title: data.title ?? "Practice Quiz",
            mode: data.mode,
            quizTypeId: quizType.id,
            questionCount: data.questionCount,
            levels: data.levels,
            timePerQuestion: data.timePerQuestion,
            timeTotalQuiz: data.timeTotalQuiz,
            scheduleEnabled: data.scheduleEnabled,
            scheduledOpeningTime,
            scheduledClosingTime,
            correctAnswers: data.correctAnswers,
            scoreInPercent: data.scoreInPercent,
            totalScore: data.totalScore,
        };

        const result = await prisma.$transaction(async (tx) => {
            // Only keep question ids that actually exist; stale or forged ids are
            // silently dropped so they can never fail the transaction.
            const [correctQuestions, incorrectQuestions] = await Promise.all([
                tx.quizQuestion.findMany({
                    where: { id: { in: [...new Set(data.correctQuestionIds ?? [])] } },
                    select: { id: true },
                }),
                tx.quizQuestion.findMany({
                    where: { id: { in: [...new Set(data.incorrectQuestionIds ?? [])] } },
                    select: { id: true },
                }),
            ]);
            const correctConnect = correctQuestions.map((q) => ({ id: q.id }));
            const incorrectConnect = incorrectQuestions.map((q) => ({ id: q.id }));

            if (data.examId != null) {
                // Serialize writes per exam so two concurrent submissions can't both be
                // recorded as the official first attempt.
                await tx.$executeRaw`SELECT "id" FROM "QuizExam" WHERE "id" = ${data.examId} FOR UPDATE`;

                // A previously completed attempt that was flagged as the official first
                // attempt (isFirstAttempt = true) marks any later attempt as REATTEMPTED.
                // Abandoned attempts never carry isFirstAttempt = true.
                const priorFirst = await tx.quizResults.count({
                    where: {
                        userId: data.userId,
                        examId: data.examId,
                        isFirstAttempt: true,
                        status: { in: ["SUBMITTED", "LATE_SUBMITTED"] },
                    },
                });

                const isFirstAttempt =
                    data.status !== "ABANDONED" && priorFirst === 0;
                let status: QuizResultStatus;
                if (data.status === "ABANDONED") {
                    status = "ABANDONED";
                } else if (priorFirst > 0) {
                    status = "REATTEMPTED";
                } else if (scheduledClosingTime && now > scheduledClosingTime) {
                    status = "LATE_SUBMITTED";
                } else {
                    status = "SUBMITTED";
                }

                return tx.quizResults.create({
                    data: {
                        ...baseData,
                        status,
                        isFirstAttempt,
                        correctQuestions: { connect: correctConnect },
                        incorrectQuestions: { connect: incorrectConnect },
                    },
                });
            }

            return tx.quizResults.create({
                data: {
                    ...baseData,
                    status: "SUBMITTED",
                    isFirstAttempt: true,
                    correctQuestions: { connect: correctConnect },
                    incorrectQuestions: { connect: incorrectConnect },
                },
            });
        });

        return {
            data: result,
            message: "Quiz result recorded successfully",
            success: true,
        };
    } catch (error) {
        if (data.clientId && typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
            const existing = await prisma.quizResults.findFirst({
                where: { clientId: data.clientId },
            });
            if (existing) {
                return {
                    data: existing,
                    message: "Quiz result already recorded (idempotent)",
                    success: true,
                };
            }
        }
        logger.error(`Failed to create quiz result: ${error}`);
        return {
            data: null,
            message: "Failed to create quiz result",
            success: false,
        };
    }
};

const quizQuestionDetailSelect = {
    id: true,
    questionText: true,
    options: true,
    answer: true,
    difficultyLevel: true,
    class: true,
} as const;

export const getQuizResultsByUser = async (userId: number) => {
    try {
        const results = await prisma.quizResults.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                exam: true,
                quizType: true,
                correctQuestions: { select: quizQuestionDetailSelect },
                incorrectQuestions: { select: quizQuestionDetailSelect },
            },
        });

        return {
            data: results,
            message: "Quiz results fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz results: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz results",
            success: false,
        };
    }
};

export const getQuizResultById = async (
    resultId: number,
    userId?: number
) => {
    try {
        const result = await prisma.quizResults.findFirst({
            where: { id: resultId, ...(userId != null ? { userId } : {}) },
            include: {
                exam: true,
                quizType: true,
                correctQuestions: { select: quizQuestionDetailSelect },
                incorrectQuestions: { select: quizQuestionDetailSelect },
            },
        });

        if (!result) {
            return {
                data: null,
                message: "Quiz result not found",
                success: false,
            };
        }

        return {
            data: result,
            message: "Quiz result fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz result by id: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz result",
            success: false,
        };
    }
};
