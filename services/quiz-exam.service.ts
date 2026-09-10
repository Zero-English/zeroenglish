import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Prisma } from "@/generated/prisma/client";
import type { Levels, QuizMode } from "@/generated/prisma/enums";

const quizExamListInclude = {
    _count: { select: { quizQuestions: true, results: true } },
} as const;

const quizExamDetailInclude = {
    quizQuestions: {
        orderBy: { questionId: "asc" },
        include: {
            quizQuestion: {
                include: { quizType: { select: { id: true, name: true } } },
            },
        },
    },
    results: {
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { id: true, name: true, user_name: true, email: true, image: true },
            },
            quizType: { select: { id: true, name: true } },
        },
    },
} as const;

type QuizExamListPayload = Prisma.QuizExamGetPayload<{
    include: typeof quizExamListInclude;
}>;

type QuizExamDetailPayload = Prisma.QuizExamGetPayload<{
    include: typeof quizExamDetailInclude;
}>;

export type QuizExamListWhere = {
    mode?: QuizMode;
    level?: Levels;
    search?: string;
};

export type QuizExamCreateInput = {
    title: string;
    mode: QuizMode;
    levels: Levels[];
    questionIds: number[];
    timePerQuestion: number;
    scheduleEnabled: boolean;
    scheduledOpeningTime?: string | Date | null;
    scheduledClosingTime?: string | Date | null;
    resultsPublished?: boolean;
};

export type QuizExamUpdateInput = Partial<QuizExamCreateInput>;

const toSummaryApi = (exam: QuizExamListPayload) => ({
    id: exam.id,
    title: exam.title,
    mode: exam.mode,
    questionCount: exam.questionCount,
    levels: exam.levels,
    timePerQuestion: exam.timePerQuestion,
    scheduleEnabled: exam.scheduleEnabled,
    scheduledOpeningTime: exam.scheduledOpeningTime,
    scheduledClosingTime: exam.scheduledClosingTime,
    resultsPublished: exam.resultsPublished,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    resultCount: exam._count.results,
    linkedQuestionCount: exam._count.quizQuestions,
});

const toDetailApi = (exam: QuizExamDetailPayload) => ({
    id: exam.id,
    title: exam.title,
    mode: exam.mode,
    questionCount: exam.questionCount,
    levels: exam.levels,
    timePerQuestion: exam.timePerQuestion,
    scheduleEnabled: exam.scheduleEnabled,
    scheduledOpeningTime: exam.scheduledOpeningTime,
    scheduledClosingTime: exam.scheduledClosingTime,
    resultsPublished: exam.resultsPublished,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    resultCount: exam.results.length,
    linkedQuestionCount: exam.quizQuestions.length,
    questions: exam.quizQuestions.map((q) => ({
        id: q.questionId,
        questionText: q.quizQuestion.questionText,
        options: q.quizQuestion.options,
        difficultyLevel: q.quizQuestion.difficultyLevel,
        answer: q.quizQuestion.answer,
        quizType: q.quizQuestion.quizType.name,
    })),
    results: exam.results.map((r) => ({
        id: r.id,
        userId: r.userId,
        clientId: r.clientId,
        user: r.user,
        quizType: r.quizType.name,
        mode: r.mode,
        correctAnswers: r.correctAnswers,
        scoreInPercent: r.scoreInPercent,
        totalScore: r.totalScore,
        questionCount: r.questionCount,
        levels: r.levels,
        timePerQuestion: r.timePerQuestion,
        timeTotalQuiz: r.timeTotalQuiz,
        scheduleEnabled: r.scheduleEnabled,
        scheduledOpeningTime: r.scheduledOpeningTime,
        scheduledClosingTime: r.scheduledClosingTime,
        createdAt: r.createdAt,
    })),
});

const notFound = () => ({
    data: null,
    message: "Quiz exam not found",
    success: false,
});

const validateSchedule = (data: {
    scheduleEnabled?: boolean;
    scheduledOpeningTime?: string | Date | null;
    scheduledClosingTime?: string | Date | null;
}) => {
    if (
        data.scheduleEnabled &&
        data.scheduledOpeningTime &&
        data.scheduledClosingTime &&
        new Date(data.scheduledOpeningTime) >= new Date(data.scheduledClosingTime)
    ) {
        return "Opening time must be before closing time";
    }
    return null;
};

export const getQuizExamsByPage = async (
    page: number = 1,
    limit: number = 10,
    filters: QuizExamListWhere = {},
) => {
    try {
        const where: Prisma.QuizExamWhereInput = {};
        if (filters.mode) where.mode = filters.mode;
        if (filters.level) where.levels = { has: filters.level };
        if (filters.search) where.title = { contains: filters.search, mode: "insensitive" };

        const skip = (page - 1) * limit;

        const [exams, total] = await Promise.all([
            prisma.quizExam.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: quizExamListInclude,
            }),
            prisma.quizExam.count({ where }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: exams.map(toSummaryApi),
            pagination: { total, page, limit, totalPages },
            message: "Quiz exams fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz exams: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz exams",
            success: false,
        };
    }
};

export const getQuizExamById = async (id: number) => {
    try {
        const exam = await prisma.quizExam.findUnique({
            where: { id },
            include: quizExamDetailInclude,
        });

        if (!exam) return notFound();

        return {
            data: toDetailApi(exam),
            message: "Quiz exam fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz exam: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz exam",
            success: false,
        };
    }
};

export const createQuizExam = async (data: QuizExamCreateInput) => {
    try {
        const scheduleError = validateSchedule(data);
        if (scheduleError) {
            return { data: null, message: scheduleError, success: false };
        }

        const questionIds = [...new Set(data.questionIds)];
        if (questionIds.length === 0) {
            return {
                data: null,
                message: "At least one question is required",
                success: false,
            };
        }

        const validQuestions = await prisma.quizQuestion.findMany({
            where: { id: { in: questionIds } },
            select: { id: true },
        });

        if (validQuestions.length !== questionIds.length) {
            return {
                data: null,
                message: "One or more selected questions do not exist",
                success: false,
            };
        }

        const exam = await prisma.quizExam.create({
            data: {
                title: data.title,
                mode: data.mode,
                questionCount: validQuestions.length,
                levels: data.levels,
                timePerQuestion: data.timePerQuestion,
                scheduleEnabled: data.scheduleEnabled,
                scheduledOpeningTime: data.scheduledOpeningTime
                    ? new Date(data.scheduledOpeningTime)
                    : null,
                scheduledClosingTime: data.scheduledClosingTime
                    ? new Date(data.scheduledClosingTime)
                    : null,
                resultsPublished: data.resultsPublished ?? false,
                quizQuestions: {
                    create: validQuestions.map((q) => ({ questionId: q.id })),
                },
            },
            include: quizExamDetailInclude,
        });

        return {
            data: toDetailApi(exam),
            message: "Quiz exam created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create quiz exam: ${error}`);
        return {
            data: null,
            message: "Failed to create quiz exam",
            success: false,
        };
    }
};

export const updateQuizExamById = async (
    id: number,
    data: QuizExamUpdateInput,
) => {
    try {
        const existing = await prisma.quizExam.findUnique({ where: { id } });
        if (!existing) return notFound();

        const scheduleError = validateSchedule(data);
        if (scheduleError) {
            return { data: null, message: scheduleError, success: false };
        }

        const { questionIds, scheduledOpeningTime, scheduledClosingTime, ...rest } = data;

        let rebuildLinks = false;
        let validQuestions: { id: number }[] = [];

        if (questionIds !== undefined) {
            const unique = [...new Set(questionIds)];
            if (unique.length === 0) {
                return {
                    data: null,
                    message: "At least one question is required",
                    success: false,
                };
            }

            validQuestions = await prisma.quizQuestion.findMany({
                where: { id: { in: unique } },
                select: { id: true },
            });

            if (validQuestions.length !== unique.length) {
                return {
                    data: null,
                    message: "One or more selected questions do not exist",
                    success: false,
                };
            }

            rebuildLinks = true;
        }

        const updateData: Prisma.QuizExamUpdateInput = {
            ...(rest.title !== undefined ? { title: rest.title } : {}),
            ...(rest.mode !== undefined ? { mode: rest.mode } : {}),
            ...(rest.levels !== undefined ? { levels: rest.levels } : {}),
            ...(rest.timePerQuestion !== undefined
                ? { timePerQuestion: rest.timePerQuestion }
                : {}),
            ...(rest.scheduleEnabled !== undefined
                ? { scheduleEnabled: rest.scheduleEnabled }
                : {}),
            ...(rest.resultsPublished !== undefined
                ? { resultsPublished: rest.resultsPublished }
                : {}),
            ...(scheduledOpeningTime !== undefined
                ? {
                      scheduledOpeningTime: scheduledOpeningTime
                          ? new Date(scheduledOpeningTime)
                          : null,
                  }
                : {}),
            ...(scheduledClosingTime !== undefined
                ? {
                      scheduledClosingTime: scheduledClosingTime
                          ? new Date(scheduledClosingTime)
                          : null,
                  }
                : {}),
        };

        if (rebuildLinks) {
            updateData.questionCount = validQuestions.length;
            updateData.quizQuestions = {
                deleteMany: {},
                create: validQuestions.map((q) => ({ questionId: q.id })),
            };
        }

        const exam = await prisma.quizExam.update({
            where: { id },
            data: updateData,
            include: quizExamDetailInclude,
        });

        return {
            data: toDetailApi(exam),
            message: "Quiz exam updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update quiz exam: ${error}`);
        return {
            data: null,
            message: "Failed to update quiz exam",
            success: false,
        };
    }
};

export const deleteQuizExamById = async (id: number) => {
    try {
        const existing = await prisma.quizExam.findUnique({ where: { id } });
        if (!existing) return notFound();

        await prisma.quizExam.delete({ where: { id } });

        return {
            data: null,
            message: "Quiz exam deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete quiz exam: ${error}`);
        return {
            data: null,
            message: "Failed to delete quiz exam",
            success: false,
        };
    }
};

export const setQuizExamResultsPublished = async (id: number, published: boolean) => {
    try {
        const existing = await prisma.quizExam.findUnique({ where: { id } });
        if (!existing) return notFound();

        const updated = await prisma.quizExam.update({
            where: { id },
            data: { resultsPublished: published },
            select: { id: true, resultsPublished: true },
        });

        return {
            data: updated,
            message: published ? "Results published successfully" : "Results unpublished",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update quiz exam publish state: ${error}`);
        return {
            data: null,
            message: "Failed to update quiz exam publish state",
            success: false,
        };
    }
};