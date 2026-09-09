import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { QuizMode, Levels } from "@/generated/prisma/enums";

export const createQuizResult = async (data: {
    userId: number;
    clientId?: string | null;
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

        const result = await prisma.quizResults.create({
            data: {
                userId: data.userId,
                clientId: data.clientId ?? null,
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
            },
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

export const getQuizResultsByUser = async (userId: number) => {
    try {
        const results = await prisma.quizResults.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { quizType: true },
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
