import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import { Class as ClassEnum } from "@/generated/prisma/enums";
import type { DifficultyLevels, Class, Prisma } from "@/generated/prisma/client";

const quizTypeInclude = {
    quizType: {
        select: { id: true, name: true },
    },
} as const;

type QuizQuestionWithType = Prisma.QuizQuestionGetPayload<{
    include: typeof quizTypeInclude;
}>;

const toApiQuestion = (q: QuizQuestionWithType) => ({
    id: q.id,
    quizType: q.quizType.name,
    questionText: q.questionText,
    options: q.options,
    difficultyLevel: q.difficultyLevel,
    answer: q.answer,
    explanation: q.explanation,
});

const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const getAllQuizQuestions = async () => {
    try {
        const questions = await prisma.quizQuestion.findMany({
            orderBy: { id: "desc" },
            include: quizTypeInclude,
        });

        return {
            data: questions.map((q) => toApiQuestion(q)),
            message: "Quiz questions fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz questions: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz questions",
            success: false,
        };
    }
};

export const getQuizQuestionsByPage = async (page: number = 1, limit: number = 10) => {
    try {
        const skip = (page - 1) * limit;

        const [questions, total] = await Promise.all([
            prisma.quizQuestion.findMany({
                skip,
                take: limit,
                orderBy: { id: "desc" },
                include: quizTypeInclude,
            }),
            prisma.quizQuestion.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: questions.map((q) => toApiQuestion(q)),
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Quiz questions fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz questions: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz questions",
            success: false,
        };
    }
};

export const getQuizQuestionsByType = async (
    quizType: string,
    limit: number = 50
) => {
    try {
        const type = await prisma.quizType.findUnique({
            where: { name: quizType },
            select: { id: true },
        });

        if (!type) {
            return {
                data: null,
                message: `Quiz type "${quizType}" not found`,
                success: false,
            };
        }

        const questions = await prisma.quizQuestion.findMany({
            where: { quizTypeId: type.id },
            orderBy: { id: "asc" },
            include: quizTypeInclude,
        });

        // Return questions in random order so every session feels fresh,
        // capped at the requested limit. Options are shuffled on the server
        // too, so the correct answer doesn't always land on the same letter.
        const shuffled = questions
            .map((q) => ({
                ...toApiQuestion(q),
                options: shuffleArray(q.options),
            }))
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        return {
            data: shuffled,
            message: "Quiz questions fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz questions by type: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz questions by type",
            success: false,
        };
    }
};

export const getQuickQuizQuestions = async (limit: number = 20) => {
    try {
        const questions = await prisma.quizQuestion.findMany({
            orderBy: { id: "asc" },
            include: quizTypeInclude,
        });

        // Return a random set of questions drawn from every quiz type and
        // class, capped at the requested limit. Options are shuffled on the
        // server too, so the correct answer doesn't always land on the same
        // letter.
        const shuffled = questions
            .map((q) => ({
                ...toApiQuestion(q),
                options: shuffleArray(q.options),
            }))
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        return {
            data: shuffled,
            message: "Quick quiz questions fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quick quiz questions: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quick quiz questions",
            success: false,
        };
    }
};

export const getQuizQuestionsByClass = async (
    className: string,
    limit: number = 50
) => {
    try {
        const valid = Object.values(ClassEnum).includes(className as Class);
        if (!valid) {
            return {
                data: null,
                message: `Class "${className}" not found`,
                success: false,
            };
        }

        const questions = await prisma.quizQuestion.findMany({
            where: { class: { hasSome: [className as Class] } },
            orderBy: { id: "asc" },
            include: quizTypeInclude,
        });

        // Return questions in random order so every session feels fresh,
        // capped at the requested limit. Options are shuffled on the server
        // too, so the correct answer doesn't always land on the same letter.
        const shuffled = questions
            .map((q) => ({
                ...toApiQuestion(q),
                options: shuffleArray(q.options),
            }))
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        return {
            data: shuffled,
            message: "Quiz questions fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz questions by class: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz questions by class",
            success: false,
        };
    }
};

export const getQuizQuestionCountsByClass = async () => {
    try {
        const rows = await prisma.quizQuestion.findMany({
            select: { class: true },
        });

        const counts: Record<string, number> = {};
        for (const row of rows) {
            for (const cls of row.class) {
                counts[cls] = (counts[cls] ?? 0) + 1;
            }
        }

        return {
            data: counts,
            message: "Quiz class counts fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz class counts: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz class counts",
            success: false,
        };
    }
};

export const getQuizQuestionById = async (id: number) => {
    try {
        const question = await prisma.quizQuestion.findUnique({
            where: { id },
            include: quizTypeInclude,
        });

        if (!question) {
            return {
                data: null,
                message: "Quiz question not found",
                success: false,
            };
        }

        return {
            data: toApiQuestion(question),
            message: "Quiz question fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz question",
            success: false,
        };
    }
};

export const createQuizQuestion = async (
    data: {
        quizType: string;
        questionText: string;
        options: string[];
        difficultyLevel: DifficultyLevels;
        answer: string;
        explanation?: string;
    },
    addedByUserId: number,
) => {
    try {
        const quizType = await prisma.quizType.findUnique({
            where: { name: data.quizType },
        });

        if (!quizType) {
            return {
                data: null,
                message: `Quiz type "${data.quizType}" not found`,
                success: false,
            };
        }

        const question = await prisma.quizQuestion.create({
            data: {
                quizTypeId: quizType.id,
                questionText: data.questionText,
                options: data.options,
                difficultyLevel: data.difficultyLevel,
                answer: data.answer,
                explanation: data.explanation ?? "",
                addedByUserId,
            },
            include: quizTypeInclude,
        });

        return {
            data: toApiQuestion(question),
            message: "Quiz question created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to create quiz question",
            success: false,
        };
    }
};

export const createQuizQuestionsBulk = async (
    data: {
        quizType: string;
        questionText: string;
        options: string[];
        difficultyLevel: DifficultyLevels;
        answer: string;
        class?: Class[] | null;
        explanation?: string;
    }[],
    addedByUserId: number,
) => {
    try {
        const names = [...new Set(data.map((q) => q.quizType))];

        const quizTypes = await prisma.quizType.findMany({
            where: { name: { in: names } },
            select: { id: true, name: true },
        });

        const nameToId = new Map(quizTypes.map((t) => [t.name, t.id]));
        const missingTypes = names.filter((n) => !nameToId.has(n));

        if (missingTypes.length > 0) {
            return {
                data: null,
                message: `Quiz type(s) not found: ${missingTypes.join(", ")}`,
                success: false,
            };
        }

        await prisma.$transaction(
            data.map((q) =>
                prisma.quizQuestion.create({
                    data: {
                        quizTypeId: nameToId.get(q.quizType)!,
                        questionText: q.questionText,
                        options: q.options,
                        difficultyLevel: q.difficultyLevel,
                        answer: q.answer,
                        class: q.class ?? [],
                        explanation: q.explanation ?? "",
                        addedByUserId,
                    },
                })
            )
        );

        return {
            data: { count: data.length },
            message: `${data.length} question(s) created successfully`,
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to bulk create quiz questions: ${error}`);
        return {
            data: null,
            message: "Failed to bulk create quiz questions",
            success: false,
        };
    }
};

export const updateQuizQuestionById = async (
    id: number,
    data: Partial<{
        quizType: string;
        questionText: string;
        options: string[];
        difficultyLevel: DifficultyLevels;
        answer: string;
        explanation?: string;
    }>,
) => {
    try {
        const existing = await prisma.quizQuestion.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                data: null,
                message: "Quiz question not found",
                success: false,
            };
        }

        const { quizType, ...rest } = data;
        const updateData: Prisma.QuizQuestionUpdateInput = { ...rest };

        if (quizType) {
            const quizTypeRow = await prisma.quizType.findUnique({
                where: { name: quizType },
            });
            if (!quizTypeRow) {
                return {
                    data: null,
                    message: `Quiz type "${quizType}" not found`,
                    success: false,
                };
            }
            updateData.quizType = { connect: { id: quizTypeRow.id } };
        }

        const question = await prisma.quizQuestion.update({
            where: { id },
            data: updateData,
            include: quizTypeInclude,
        });

        return {
            data: toApiQuestion(question),
            message: "Quiz question updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to update quiz question",
            success: false,
        };
    }
};

export const deleteQuizQuestionById = async (id: number) => {
    try {
        const existing = await prisma.quizQuestion.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                data: null,
                message: "Quiz question not found",
                success: false,
            };
        }

        await prisma.quizQuestion.delete({
            where: { id },
        });

        return {
            data: null,
            message: "Quiz question deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to delete quiz question",
            success: false,
        };
    }
};
