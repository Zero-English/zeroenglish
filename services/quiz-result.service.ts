import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { QuizMode, QuizType, Levels } from "@/generated/prisma/enums";

export const createQuizResult = async (data: {
    userId: number;
    title?: string | null;
    mode: QuizMode;
    quizType: QuizType;
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
        const result = await prisma.quizResults.create({
            data: {
                userId: data.userId,
                title: data.title ?? null,
                mode: data.mode,
                quizType: data.quizType,
                questionCount: data.questionCount,
                levels: data.levels,
                timePerQuestion: data.timePerQuestion,
                timeTotalQuiz: data.timeTotalQuiz,
                scheduleEnabled: data.scheduleEnabled,
                scheduledOpeningTime: data.scheduledOpeningTime
                    ? new Date(data.scheduledOpeningTime)
                    : null,
                scheduledClosingTime: data.scheduledClosingTime
                    ? new Date(data.scheduledClosingTime)
                    : null,
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
