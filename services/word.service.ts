import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Word } from "@/lib/data";

export type WordLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const WORD_LEVELS: readonly WordLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const isWordLevel = (value: string): value is WordLevel =>
    (WORD_LEVELS as readonly string[]).includes(value);

interface DbWordRecord {
    id: number;
    word: string;
    meaningBn: string[];
    synonyms: string[];
    antonyms: string[];
    definitionEn: string;
    definitionBn: string;
    examplesEn: string[];
    examplesBn: string[];
    level: string;
    category: string;
    wordType: string[];
}

const toPublicWord = (w: DbWordRecord): Word => ({
    id: w.id,
    word: w.word,
    meaning_bn: w.meaningBn.join("; "),
    definition_en: w.definitionEn,
    definition_bn: w.definitionBn,
    examples_en: w.examplesEn,
    examples_bn: w.examplesBn,
    synonyms: w.synonyms,
    antonyms: w.antonyms,
    level: w.level as Word["level"],
    category: w.category,
    parts_of_speech: w.wordType.join(", "),
});

interface BrowseWordsParams {
    page?: number;
    limit?: number;
    level?: string;
    search?: string;
}

export const browseWords = async ({
    page = 1,
    limit = 10,
    level,
    search,
}: BrowseWordsParams = {}) => {
    try {
        const skip = (page - 1) * limit;
        const where: { level?: WordLevel } = {};
        if (level && isWordLevel(level)) where.level = level;

        const q = search?.trim();

        if (q) {
            const query = q.toLowerCase();
            const rows = await prisma.word.findMany({
                where,
                orderBy: { id: "asc" },
            });

            const scored = rows
                .map((row) => {
                    let score = 0;
                    const word = row.word.toLowerCase();
                    const meaning = row.meaningBn.join(" ").toLowerCase();
                    const definitionEn = row.definitionEn.toLowerCase();
                    const definitionBn = row.definitionBn.toLowerCase();

                    if (word === query) score += 100;
                    else if (word.startsWith(query)) score += 50;
                    else if (word.includes(query)) score += 20;

                    if (meaning === query) score += 80;
                    else if (meaning.startsWith(query)) score += 40;
                    else if (meaning.includes(query)) score += 15;

                    if (definitionEn.includes(query)) score += 5;
                    if (definitionBn.includes(query)) score += 5;

                    return { row, score };
                })
                .filter(({ score }) => score > 0)
                .sort((a, b) => b.score - a.score);

            const total = scored.length;
            const totalPages = Math.max(1, Math.ceil(total / limit));

            return {
                data: scored
                    .slice(skip, skip + limit)
                    .map(({ row }) => toPublicWord(row)),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
                message: "Words fetched successfully",
                success: true,
            };
        }

        const [words, total] = await Promise.all([
            prisma.word.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: "asc" },
            }),
            prisma.word.count({ where }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: words.map(toPublicWord),
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Words fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to browse words: ${error}`);
        return {
            data: null,
            message: "Failed to fetch words",
            success: false,
        };
    }
};

export const getWordStats = async () => {
    try {
        const [grouped, wordRefs] = await Promise.all([
            prisma.word.groupBy({
                by: ["level"],
                _count: { _all: true },
            }),
            prisma.word.findMany({
                select: { id: true, word: true, level: true },
                orderBy: { id: "asc" },
            }),
        ]);

        const levelMap = new Map(grouped.map((g) => [g.level, g._count._all]));
        const levels = WORD_LEVELS.map((level) => ({
            level,
            count: levelMap.get(level) ?? 0,
        }));

        return {
            data: { levels, wordRefs },
            message: "Word stats fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch word stats: ${error}`);
        return {
            data: null,
            message: "Failed to fetch word stats",
            success: false,
        };
    }
};

export const getAllWords = async () => {
    try {
        const words = await prisma.word.findMany({
            orderBy: { createdAt: "desc" },
        });

        return {
            data: words,
            message: "Words fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch words: ${error}`);
        return {
            data: null,
            message: "Failed to fetch words",
            success: false,
        };
    }
};

export const getWordsByPage = async (page: number = 1, limit: number = 10) => {
    try {
        const skip = (page - 1) * limit;

        const [words, total] = await Promise.all([
            prisma.word.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.word.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: words,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Words fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch words: ${error}`);
        return {
            data: null,
            message: "Failed to fetch words",
            success: false,
        };
    }
};

export const createWord = async (wordData: {
    word: string;
    meaningBn: string[];
    synonyms?: string[];
    antonyms?: string[];
    definitionEn: string;
    definitionBn: string;
    examplesEn?: string[];
    examplesBn?: string[];
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    category: string;
    wordType: string[];
}) => {
    try {
        const existingWord = await prisma.word.findUnique({
            where: { word: wordData.word },
        });

        if (existingWord) {
            return {
                data: null,
                message: "Word already exists",
                success: false,
            };
        }

        const word = await prisma.word.create({
            data: {
                word: wordData.word,
                meaningBn: wordData.meaningBn,
                synonyms: wordData.synonyms ?? [],
                antonyms: wordData.antonyms ?? [],
                definitionEn: wordData.definitionEn,
                definitionBn: wordData.definitionBn,
                examplesEn: wordData.examplesEn ?? [],
                examplesBn: wordData.examplesBn ?? [],
                level: wordData.level,
                category: wordData.category,
                wordType: wordData.wordType,
            },
        });

        return {
            data: word,
            message: "Word created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create word: ${error}`);
        return {
            data: null,
            message: "Failed to create word",
            success: false,
        };
    }
};

export const createWordsBulk = async (
    wordDataArray: {
        word: string;
        meaningBn?: string[];
        synonyms?: string[];
        antonyms?: string[];
        antonoyms?: string[];
        definitionEn?: string;
        definitionBn?: string;
        examplesEn?: string[];
        examplesBn?: string[];
        level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
        category?: string;
        wordType?: string[];
    }[],
) => {
    try {
        logger.info("Raw data: " + JSON.stringify(wordDataArray[0]));
        logger.info("Hitted createWordsBulk function");
        logger.info(
            `Bulk word import started with ${wordDataArray.length} words`,
        );
        logger.info(`Received ${wordDataArray.length} words for bulk creation`);
        const data = wordDataArray.map((w) => ({
            word: w.word,
            meaningBn: w.meaningBn ?? [],
            synonyms: w.synonyms ?? [],
            antonyms: w.antonyms ?? w.antonoyms ?? [],
            definitionEn: w.definitionEn ?? "",
            definitionBn: w.definitionBn ?? "",
            examplesEn: w.examplesEn ?? [],
            examplesBn: w.examplesBn ?? [],
            level: w.level ?? "A1",
            category: w.category ?? "Oxford3000",
            wordType: w.wordType ?? [],
        }));

        logger.info(`Creating ${data.length} words in bulk`);
        logger.info(`Word data: ${JSON.stringify(data[0])}`);

        const result = await prisma.word.createMany({
            data,
            skipDuplicates: true,
        });

        logger.info(`Bulk create result: ${JSON.stringify(result)}`);

        return {
            data: { count: result.count },
            message: `${result.count} word(s) created successfully`,
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to bulk create words: ${error}`);
        return {
            data: null,
            message: "Failed to bulk create words",
            success: false,
        };
    }
};

export const updateWordById = async (
    id: number,
    wordData: Partial<{
        word: string;
        meaningBn: string[];
        synonyms: string[];
        antonyms: string[];
        definitionEn: string;
        definitionBn: string;
        examplesEn: string[];
        examplesBn: string[];
        level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
        category: string;
        wordType: string[];
    }>,
) => {
    try {
        const existingWord = await prisma.word.findUnique({
            where: { id },
        });

        if (!existingWord) {
            return {
                data: null,
                message: "Word not found",
                success: false,
            };
        }

        if (wordData.word && wordData.word !== existingWord.word) {
            const duplicateWord = await prisma.word.findUnique({
                where: { word: wordData.word },
            });

            if (duplicateWord) {
                return {
                    data: null,
                    message: "Word already exists",
                    success: false,
                };
            }
        }

        const word = await prisma.word.update({
            where: { id },
            data: wordData,
        });

        return {
            data: word,
            message: "Word updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update word: ${error}`);
        return {
            data: null,
            message: "Failed to update word",
            success: false,
        };
    }
};

export const deleteWordById = async (id: number) => {
    try {
        const existingWord = await prisma.word.findUnique({
            where: { id },
        });

        if (!existingWord) {
            return {
                data: null,
                message: "Word not found",
                success: false,
            };
        }

        await prisma.word.delete({
            where: { id },
        });

        return {
            data: null,
            message: "Word deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete word: ${error}`);
        return {
            data: null,
            message: "Failed to delete word",
            success: false,
        };
    }
};

export const markWordAsLearned = async (userId: number, wordId: number) => {
    try {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.userWord.findUnique({
                where: {
                    userId_wordId: {
                        userId,
                        wordId,
                    },
                },
            });

            // Already learned → don't create another learning event
            if (existing?.isLearned === "LEARNED") {
                return existing;
            }

            // Update current state
            const userWord = await tx.userWord.upsert({
                where: {
                    userId_wordId: {
                        userId,
                        wordId,
                    },
                },
                create: {
                    userId,
                    wordId,
                    isLearned: "LEARNED",
                },
                update: {
                    isLearned: "LEARNED",
                },
            });

            // Record learning activity
            await tx.wordLearningEvent.create({
                data: {
                    userId,
                    wordId,
                },
            });

            return userWord;
        });
    } catch (error) {
        logger.error(`Failed to mark word as learned: ${error}`);
        return {
            data: null,
            message: "Failed to mark word as learned",
            success: false,
        };
    }
};

export const markWordAsUnLearned = async (userId: number, wordId: number) => {
    try {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.userWord.findUnique({
                where: {
                    userId_wordId: {
                        userId,
                        wordId,
                    },
                },
            });

            // Already unlearned → don't create another unlearning event
            if (existing?.isLearned === "UNLEARNED") {
                return existing;
            }

            // Update current state
            const userWord = await tx.userWord.upsert({
                where: {
                    userId_wordId: {
                        userId,
                        wordId,
                    },
                },
                create: {
                    userId,
                    wordId,
                    isLearned: "UNLEARNED",
                },
                update: {
                    isLearned: "UNLEARNED",
                },
            });

            // Record learning activity
            await tx.wordLearningEvent.create({
                data: {
                    userId,
                    wordId,
                },
            });

            return userWord;
        });
    } catch (error) {
        logger.error(`Failed to mark word as unlearned: ${error}`);
        return {
            data: null,
            message: "Failed to mark word as unlearned",
            success: false,
        };
    }
};

export const markBookmark = async (userId: number, wordId: number) => {
    try {
        const existing = await prisma.userBookmark.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        if (existing) {
            return {
                data: existing,
                message: "Word already bookmarked",
                success: false,
            };
        }

        const bookmark = await prisma.userBookmark.create({
            data: {
                userId,
                wordId,
            },
        });

        return {
            data: bookmark,
            message: "Word bookmarked successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to mark word as bookmarked: ${error}`);
        return {
            data: null,
            message: "Failed to mark word as bookmarked",
            success: false,
        };
    }
};

export const removeBookmark = async (userId: number, wordId: number) => {
    try {
        const existing = await prisma.userBookmark.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        if (!existing) {
            return {
                data: null,
                message: "Bookmark not found",
                success: false,
            };
        }

        await prisma.userBookmark.delete({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        return {
            data: null,
            message: "Bookmark removed successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to remove bookmark: ${error}`);
        return {
            data: null,
            message: "Failed to remove bookmark",
            success: false,
        };
    }
};

export const getUserBookmarkIds = async (userId: number) => {
    try {
        const bookmarks = await prisma.userBookmark.findMany({
            where: { userId },
            select: { wordId: true },
            orderBy: { bookmarkedAt: "desc" },
        });

        return {
            data: bookmarks.map((b) => b.wordId),
            message: "Bookmarks fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch bookmarks: ${error}`);
        return {
            data: null,
            message: "Failed to fetch bookmarks",
            success: false,
        };
    }
};

export const getWordLearningEvents = async (
    page: number = 1,
    limit: number = 10,
) => {
    try {
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            prisma.wordLearningEvent.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            user_name: true,
                            email: true,
                            image: true,
                        },
                    },
                    word: {
                        select: {
                            id: true,
                            word: true,
                            meaningBn: true,
                            level: true,
                        },
                    },
                },
            }),
            prisma.wordLearningEvent.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: events,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Learning events fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch learning events: ${error}`);
        return {
            data: null,
            message: "Failed to fetch learning events",
            success: false,
        };
    }
};
