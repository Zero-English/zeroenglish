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
                select: { id: true, word: true, level: true, category: true },
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
            category: w.category ?? "Oxford5000",
            wordType: w.wordType ?? [],
        }));

        logger.info(`Creating ${data.length} words in bulk`);

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
        return prisma.userWord.upsert({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
            create: {
                userId,
                wordId,
                learningStatus: "LEARNED",
            },
            update: {
                learningStatus: "LEARNED",
            },
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
        const existing = await prisma.userWord.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        if (!existing) {
            return null;
        }

        await prisma.userWord.delete({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        return existing;
    } catch (error) {
        logger.error(`Failed to mark word as unlearned: ${error}`);
        return {
            data: null,
            message: "Failed to mark word as unlearned",
            success: false,
        };
    }
};

export const markWordsAsLearned = async (
    userId: number,
    wordIds: number[],
) => {
    try {
        const uniqueIds = Array.from(
            new Set(wordIds.filter((id) => Number.isInteger(id))),
        ).slice(0, 500);

        if (uniqueIds.length === 0) {
            return {
                data: { count: 0 },
                message: "No words to mark as learned",
                success: true,
            };
        }

        const now = new Date();

        await prisma.$transaction([
            prisma.userWord.updateMany({
                where: {
                    userId,
                    wordId: { in: uniqueIds },
                },
                data: { learningStatus: "LEARNED", updatedAt: now },
            }),
            prisma.userWord.createMany({
                data: uniqueIds.map((wordId) => ({
                    userId,
                    wordId,
                    learningStatus: "LEARNED",
                    createdAt: now,
                    updatedAt: now,
                })),
                skipDuplicates: true,
            }),
        ]);

        return {
            data: { count: uniqueIds.length },
            message: "Words marked as learned successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to mark words as learned: ${error}`);
        return {
            data: null,
            message: "Failed to mark words as learned",
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

export const markWordsAsBookmarked = async (
    userId: number,
    wordIds: number[],
) => {
    try {
        const uniqueIds = Array.from(
            new Set(wordIds.filter((id) => Number.isInteger(id))),
        ).slice(0, 500);

        if (uniqueIds.length === 0) {
            return {
                data: { count: 0, created: 0, updated: 0 },
                message: "No words to bookmark",
                success: true,
            };
        }

        const now = new Date();

        const [updated, created] = await prisma.$transaction([
            prisma.userBookmark.updateMany({
                where: {
                    userId,
                    wordId: { in: uniqueIds },
                },
                data: { bookmarkedAt: now },
            }),
            prisma.userBookmark.createMany({
                data: uniqueIds.map((wordId) => ({
                    userId,
                    wordId,
                })),
                skipDuplicates: true,
            }),
        ]);

        return {
            data: {
                count: uniqueIds.length,
                created: created.count,
                updated: updated.count,
            },
            message: "Words bookmarked successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to bookmark words: ${error}`);
        return {
            data: null,
            message: "Failed to bookmark words",
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

export const getLearnedWordIds = async (userId: number) => {
    try {
        const learned = await prisma.userWord.findMany({
            where: { userId, learningStatus: "LEARNED" },
            select: { wordId: true },
            orderBy: { updatedAt: "desc" },
        });

        return {
            data: learned.map((w) => w.wordId),
            message: "Learned words fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch learned words: ${error}`);
        return {
            data: null,
            message: "Failed to fetch learned words",
            success: false,
        };
    }
};

export const markWordsAsStillLearning = async (
    userId: number,
    wordIds: number[],
) => {
    try {
        const uniqueIds = Array.from(
            new Set(wordIds.filter((id) => Number.isInteger(id))),
        ).slice(0, 500);

        if (uniqueIds.length === 0) {
            return {
                data: { count: 0 },
                message: "No words to mark as still learning",
                success: true,
            };
        }

        const now = new Date();

        await prisma.$transaction([
            prisma.userWord.updateMany({
                where: {
                    userId,
                    wordId: { in: uniqueIds },
                },
                data: { learningStatus: "STILL_LEARNING", updatedAt: now },
            }),
            prisma.userWord.createMany({
                data: uniqueIds.map((wordId) => ({
                    userId,
                    wordId,
                    learningStatus: "STILL_LEARNING",
                    createdAt: now,
                    updatedAt: now,
                })),
                skipDuplicates: true,
            }),
        ]);

        return {
            data: { count: uniqueIds.length },
            message: "Words marked as still learning successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to mark words as still learning: ${error}`);
        return {
            data: null,
            message: "Failed to mark words as still learning",
            success: false,
        };
    }
};

export const getStillLearningWordIds = async (userId: number) => {
    try {
        const stillLearning = await prisma.userWord.findMany({
            where: { userId, learningStatus: "STILL_LEARNING" },
            select: { wordId: true },
            orderBy: { updatedAt: "desc" },
        });

        return {
            data: stillLearning.map((w) => w.wordId),
            message: "Still learning words fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch still learning words: ${error}`);
        return {
            data: null,
            message: "Failed to fetch still learning words",
            success: false,
        };
    }
};

export const removeStillLearning = async (userId: number, wordId: number) => {
    try {
        const existing = await prisma.userWord.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        if (!existing || existing.learningStatus !== "STILL_LEARNING") {
            return {
                data: null,
                message: "Word not found in still learning",
                success: false,
            };
        }

        await prisma.userWord.delete({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        return {
            data: { wordId },
            message: "Word removed from still learning successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to remove word from still learning: ${error}`);
        return {
            data: null,
            message: "Failed to remove word from still learning",
            success: false,
        };
    }
};

const LEARNED_ACTIVITY_RANGES = [
    "today",
    "yesterday",
    "7d",
    "14d",
    "30d",
    "90d",
    "1y",
] as const;

function hourLabel(h: number): string {
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr} ${ampm}`;
}

function dateKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function hourlyLearnedActivity(
    timestamps: Date[],
    dayOffset: number,
): { label: string; learned: number }[] {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - dayOffset);
    const dayKey = dateKey(day);

    const buckets: { label: string; learned: number }[] = [];
    for (let h = 0; h < 24; h++) {
        buckets.push({ label: hourLabel(h), learned: 0 });
    }

    for (const t of timestamps) {
        if (dateKey(t) !== dayKey) continue;
        const h = t.getHours();
        if (h >= 0 && h < 24) buckets[h].learned += 1;
    }

    return buckets;
}

function dailyLearnedActivity(
    timestamps: Date[],
    days: number,
    endOffset: number,
): { label: string; learned: number }[] {
    const buckets: { label: string; learned: number }[] = [];
    const index = new Map<string, { label: string; learned: number }>();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i + endOffset));
        const bucket = {
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            learned: 0,
        };
        buckets.push(bucket);
        index.set(dateKey(d), bucket);
    }

    for (const t of timestamps) {
        const bucket = index.get(dateKey(t));
        if (bucket) bucket.learned += 1;
    }

    return buckets;
}

export const getLearnedWordActivity = async (userId: number, range: string) => {
    try {
        const valid = LEARNED_ACTIVITY_RANGES.includes(
            range as (typeof LEARNED_ACTIVITY_RANGES)[number],
        );
        if (!valid) {
            return {
                data: null,
                message: "Invalid range",
                success: false,
            };
        }

        const isHourly = range === "today" || range === "yesterday";
        const dayCount =
            range === "7d"
                ? 7
                : range === "14d"
                  ? 14
                  : range === "30d"
                    ? 30
                    : range === "90d"
                      ? 90
                      : range === "1y"
                        ? 365
                        : 2;

        const since = new Date();
        since.setHours(0, 0, 0, 0);
        since.setDate(since.getDate() - dayCount * 2);

        const rows = await prisma.userWord.findMany({
            where: {
                userId,
                learningStatus: "LEARNED",
                updatedAt: { gte: since },
            },
            select: { updatedAt: true },
        });

        const timestamps = rows.map((r) => r.updatedAt);

        const current = isHourly
            ? hourlyLearnedActivity(timestamps, range === "today" ? 0 : 1)
            : dailyLearnedActivity(timestamps, dayCount, 0);
        const previous = isHourly
            ? hourlyLearnedActivity(timestamps, range === "today" ? 1 : 2)
            : dailyLearnedActivity(timestamps, dayCount, dayCount);

        return {
            data: {
                current,
                previous,
            },
            message: "Learned word activity fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch learned word activity: ${error}`);
        return {
            data: null,
            message: "Failed to fetch learned word activity",
            success: false,
        };
    }
};
