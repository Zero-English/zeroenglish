import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import { QuizMode, QuizResultStatus } from "@/generated/prisma/enums";
import { Class as ClassEnum, Gender as GenderEnum } from "@/generated/prisma/enums";

export const getLeaderboard = async () => {
    try {
        const examWhere = {
            mode: { in: [QuizMode.WEEKLY, QuizMode.BIWEEKLY] },
            status: { in: [QuizResultStatus.SUBMITTED, QuizResultStatus.LATE_SUBMITTED] },
        };

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [allTimeAvgs, lastWeekAvgs] = await Promise.all([
            prisma.combinedExamResult.groupBy({
                by: ["userId"],
                where: examWhere,
                _avg: { scoreInPercent: true },
                _count: { _all: true },
            }),
            prisma.combinedExamResult.groupBy({
                by: ["userId"],
                where: { ...examWhere, createdAt: { gte: sevenDaysAgo } },
                _avg: { scoreInPercent: true },
                _count: { _all: true },
            }),
        ]);

        const userIds = Array.from(
            new Set([
                ...allTimeAvgs.map((r) => r.userId),
                ...lastWeekAvgs.map((r) => r.userId),
            ])
        );

        const users = userIds.length > 0
            ? await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, user_name: true, image: true },
            })
            : [];

        const allTimeMap = new Map(
            allTimeAvgs.map((r) => [
                r.userId,
                {
                    avg: Math.round(r._avg?.scoreInPercent ?? 0),
                    count: r._count?._all ?? 0,
                },
            ])
        );
        const lastWeekMap = new Map(
            lastWeekAvgs.map((r) => [
                r.userId,
                {
                    avg: Math.round(r._avg?.scoreInPercent ?? 0),
                    count: r._count?._all ?? 0,
                },
            ])
        );

        const data = users.map((u) => {
            const all = allTimeMap.get(u.id);
            const last = lastWeekMap.get(u.id);
            return {
                ...u,
                allTimeAvg: all?.avg ?? 0,
                allTimeCount: all?.count ?? 0,
                lastWeekAvg: last?.avg ?? 0,
                lastWeekCount: last?.count ?? 0,
            };
        });

        return { data, success: true };
    } catch (error) {
        logger.error(`Failed to fetch leaderboard: ${error}`);
        return {
            data: null,
            message: "Failed to fetch leaderboard",
            success: false,
        };
    }
};

export const getUsersByPage = async (page: number = 1, limit: number = 10) => {
    try {
        const skip = (page - 1) * limit;

        const [rawUsers, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                select: {
                    id: true,
                    name: true,
                    user_name: true,
                    email: true,
                    image: true,
                    role: true,
                    created_at: true,
                    updated_at: true,
                    lastActivityAt: true,
                    institutionName: true,
                    bio: true,
                    class: true,
                    gender: true,
                    socialLinks: true,
                    _count: {
                        select: {
                            userBookmarks: true,
                        },
                    },
                },
            }),
            prisma.user.count(),
        ]);

        const userWordCounts = await prisma.userWord.groupBy({
            by: ["userId", "learningStatus"],
            where: { userId: { in: rawUsers.map((u) => u.id) } },
            _count: { _all: true },
        });

        const quizAvgs = await prisma.combinedExamResult.groupBy({
            by: ["userId"],
            where: { userId: { in: rawUsers.map((u) => u.id) } },
            _avg: { scoreInPercent: true },
        });

        const userWordCountMap = new Map(
            userWordCounts.map((row) => [
                `${row.userId}:${row.learningStatus}`,
                row._count._all,
            ])
        );

        const quizAvgMap = new Map(
            quizAvgs.map((row) => [
                row.userId,
                Math.round(row._avg.scoreInPercent ?? 0),
            ])
        );

        const totalPages = Math.ceil(total / limit);

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const users = rawUsers.map(({ _count, ...user }) => ({
            ...user,
            userStatus: user.lastActivityAt && new Date(user.lastActivityAt) > sevenDaysAgo ? "Active" : "Inactive",
            bookmarkedCount: _count.userBookmarks,
            learnedWordCount: userWordCountMap.get(`${user.id}:LEARNED`) ?? 0,
            stillLearningCount: userWordCountMap.get(`${user.id}:STILL_LEARNING`) ?? 0,
            avgQuizScore: quizAvgMap.get(user.id) ?? null,
        }));

        return {
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Users fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch users: ${error}`);
        return {
            data: null,
            message: "Failed to fetch users",
            success: false,
        };
    }
};

export const getUserById = async (id: number) => {
    try {
        const [raw, learnedCount, stillLearningCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    user_name: true,
                    email: true,
                    emailVerified: true,
                    image: true,
                    role: true,
                    created_at: true,
                    updated_at: true,
                    institutionName: true,
                    bio: true,
                    class: true,
                    gender: true,
                    socialLinks: true,
                    _count: {
                        select: {
                            userBookmarks: true,
                        },
                    },
                },
            }),
            prisma.userWord.count({
                where: { userId: id, learningStatus: "LEARNED" },
            }),
            prisma.userWord.count({
                where: { userId: id, learningStatus: "STILL_LEARNING" },
            }),
        ]);

        if (!raw) {
            return {
                data: null,
                message: "User not found",
                success: false,
            };
        }

        const { _count, ...user } = raw;

        return {
            data: {
                ...user,
                bookmarkedCount: _count.userBookmarks,
                learnedWordCount: learnedCount,
                stillLearningCount,
            },
            message: "User fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch user by id: ${error}`);
        return {
            data: null,
            message: "Failed to fetch user",
            success: false,
        };
    }
};

export const updateUserById = async (
    id: number,
    data: {
        name?: string | null;
        user_name?: string;
        email?: string;
        role?: "user" | "admin" | "contributor";
        image?: string | null;
        institutionName?: string | null;
        bio?: string | null;
        class?: ClassEnum | null;
        gender?: GenderEnum | null;
        socialLinks?: string[];
    }
) => {
    try {
        if (data.email) {
            const existing = await prisma.user.findFirst({
                where: { email: data.email.toLowerCase().trim(), id: { not: id } },
                select: { id: true },
            });
            if (existing) {
                return {
                    data: null,
                    message: "Email is already in use by another user",
                    success: false,
                    status: 409,
                };
            }
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                name: data.name !== undefined ? data.name : undefined,
                user_name: data.user_name,
                email: data.email ? data.email.toLowerCase().trim() : undefined,
                role: data.role,
                image: data.image !== undefined ? data.image : undefined,
                institutionName: data.institutionName !== undefined ? data.institutionName : undefined,
                bio: data.bio !== undefined ? data.bio : undefined,
                class: data.class !== undefined ? data.class : undefined,
                gender:
                    data.gender === null
                        ? "NOT_SET"
                        : data.gender !== undefined
                          ? data.gender
                          : undefined,
                socialLinks: data.socialLinks !== undefined ? data.socialLinks : undefined,
            },
            select: {
                id: true,
                name: true,
                user_name: true,
                email: true,
                emailVerified: true,
                image: true,
                role: true,
                created_at: true,
                updated_at: true,
                institutionName: true,
                bio: true,
                class: true,
                gender: true,
                socialLinks: true,
            },
        });

        return {
            data: updated,
            message: "User updated successfully",
            success: true,
        };
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
            return {
                data: null,
                message: "Email is already in use by another user",
                success: false,
                status: 409,
            };
        }
        logger.error(`Failed to update user ${id}: ${error}`);
        return {
            data: null,
            message: "Failed to update user",
            success: false,
        };
    }
};

export const getUserProfile = async (id: number) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                user_name: true,
                email: true,
                image: true,
                institutionName: true,
                bio: true,
                class: true,
                gender: true,
                socialLinks: true,
            },
        });

        if (!user) {
            return {
                data: null,
                message: "User not found",
                success: false,
            };
        }

        return {
            data: user,
            message: "Profile fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch profile for user ${id}: ${error}`);
        return {
            data: null,
            message: "Failed to fetch profile",
            success: false,
        };
    }
};

export const updateUserProfile = async (
    id: number,
    data: {
        name?: string | null;
        user_name?: string;
        institutionName?: string | null;
        bio?: string | null;
        class?: ClassEnum | null;
        gender?: GenderEnum | null;
        socialLinks?: string[];
    }
) => {
    try {
        const updated = await prisma.user.update({
            where: { id },
            data: {
                name: data.name !== undefined ? data.name : undefined,
                user_name: data.user_name,
                institutionName: data.institutionName !== undefined ? data.institutionName : undefined,
                bio: data.bio !== undefined ? data.bio : undefined,
                class: data.class !== undefined ? data.class : undefined,
                gender:
                    data.gender === null
                        ? "NOT_SET"
                        : data.gender !== undefined
                          ? data.gender
                          : undefined,
                socialLinks: data.socialLinks !== undefined ? data.socialLinks : undefined,
            },
            select: {
                id: true,
                name: true,
                user_name: true,
                email: true,
                image: true,
                institutionName: true,
                bio: true,
                class: true,
                gender: true,
                socialLinks: true,
            },
        });

        return {
            data: updated,
            message: "Profile updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update profile for user ${id}: ${error}`);
        return {
            data: null,
            message: "Failed to update profile",
            success: false,
        };
    }
};

export const deleteUserById = async (id: number) => {
    try {
        const existing = await prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return { data: null, message: "User not found", success: false };
        }

        await prisma.user.delete({ where: { id } });

        return { data: { id }, message: "User deleted successfully", success: true };
    } catch (error) {
        logger.error(`Failed to delete user ${id}: ${error}`);
        return {
            data: null,
            message: "Failed to delete user",
            success: false,
        };
    }
};

export const deleteUsersByIds = async (ids: number[]) => {
    try {
        const result = await prisma.user.deleteMany({
            where: { id: { in: ids } },
        });

        return {
            data: { deletedCount: result.count },
            message: `Deleted ${result.count} user(s) successfully`,
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete users ${ids.join(",")}: ${error}`);
        return {
            data: null,
            message: "Failed to delete users",
            success: false,
        };
    }
};

const fmtDate = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const getUserLearningProgress = async (id: number) => {
    try {
        const userWords = await prisma.userWord.findMany({
            where: { userId: id, learningStatus: "LEARNED" },
            select: {
                updatedAt: true,
                word: { select: { level: true } },
            },
        });

        const dailyCounts: Record<string, number> = {};
        const levelCounts: Record<string, number> = {};
        for (const r of userWords) {
            const key = fmtDate(new Date(r.updatedAt));
            dailyCounts[key] = (dailyCounts[key] ?? 0) + 1;
            levelCounts[r.word.level] = (levelCounts[r.word.level] ?? 0) + 1;
        }

        const daily: { date: string; count: number }[] = [];
        const now = new Date();
        for (let i = 364; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(day.getDate() - i);
            const key = fmtDate(day);
            daily.push({ date: key, count: dailyCounts[key] ?? 0 });
        }

        return {
            data: {
                daily,
                levelCounts: levelCounts as Record<string, number>,
            },
            message: "Learning progress fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch learning progress for user ${id}: ${error}`);
        return {
            data: null,
            message: "Failed to fetch learning progress",
            success: false,
        };
    }
};

export const getUserDailyActivity = async (id: number) => {
    try {
        const [rows, dailyPractices] = await Promise.all([
            prisma.userWord.findMany({
                where: { userId: id, learningStatus: "LEARNED" },
                select: { updatedAt: true },
            }),
            prisma.combinedExamResult.findMany({
                where: {
                    userId: id,
                    title: "Personalized Daily Practice",
                    status: { in: ["SUBMITTED", "LATE_SUBMITTED"] },
                },
                select: { createdAt: true },
            }),
        ]);

        const counts: Record<string, number> = {};
        for (const r of rows) {
            const key = fmtDate(new Date(r.updatedAt));
            counts[key] = (counts[key] ?? 0) + 1;
        }

        const practiceDates = new Set<string>();
        for (const p of dailyPractices) {
            const key = fmtDate(new Date(p.createdAt));
            practiceDates.add(key);
            // Count daily practice as an activity entry on the heatmap
            counts[key] = (counts[key] ?? 0) + 1;
        }

        const daily: { date: string; count: number }[] = [];
        const now = new Date();
        for (let i = 364; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(day.getDate() - i);
            const key = fmtDate(day);
            daily.push({ date: key, count: counts[key] ?? 0 });
        }

        const todayKey = fmtDate(now);
        const todayLearned = rows.filter((r) => fmtDate(new Date(r.updatedAt)) === todayKey).length;

        // Daily Practice driven streak calculation
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = fmtDate(yesterday);

        let streak = 0;
        if (practiceDates.has(todayKey)) {
            for (let i = 0; ; i++) {
                const day = new Date(now);
                day.setDate(day.getDate() - i);
                if (practiceDates.has(fmtDate(day))) streak += 1;
                else break;
            }
        } else if (practiceDates.has(yesterdayKey)) {
            for (let i = 1; ; i++) {
                const day = new Date(now);
                day.setDate(day.getDate() - i);
                if (practiceDates.has(fmtDate(day))) streak += 1;
                else break;
            }
        } else if (practiceDates.size === 0) {
            // Legacy fallback if user has no daily practice attempts yet
            for (let i = 0; ; i++) {
                const day = new Date(now);
                day.setDate(day.getDate() - i);
                if ((counts[fmtDate(day)] ?? 0) > 0) streak += 1;
                else break;
            }
        }

        return {
            data: {
                daily,
                todayLearned,
                streak,
            },
            message: "Daily activity fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch daily activity for user ${id}: ${error}`);
        return {
            data: null,
            message: "Failed to fetch daily activity",
            success: false,
        };
    }
};

export interface SkillProfileItem {
    id: string;
    name: string;
    nameBn: string;
    percentage: number;
    visualBar: string;
    correctCount: number;
    totalCount: number;
    unit: "words" | "questions";
    status: "active" | "untested";
    icon: string;
    color: string;
    practiceUrl: string;
}

export interface UserSkillsProfile {
    overallScore: number;
    levelTitle: string;
    levelTitleBn: string;
    skills: SkillProfileItem[];
    totalQuestionsAttempted: number;
    totalWordsMastered: number;
}

export function generateBlockBar(percentage: number, totalBlocks: number = 10): string {
    const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
    const filledBlocks = Math.round((clamped / 100) * totalBlocks);
    const emptyBlocks = Math.max(0, totalBlocks - filledBlocks);
    return "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
}

function normalizeSkillCategory(name?: string | null): string {
    if (!name) return "other";
    const upper = name.toUpperCase().replace(/\s+/g, "_");
    if (upper.includes("PREPOSITION")) return "prepositions";
    if (upper.includes("ARTICLE")) return "articles";
    if (upper.includes("IDIOM")) return "idioms";
    if (upper.includes("TENSE")) return "tenses";
    if (upper.includes("PARTS_OF_SPEECH") || upper.includes("PART_OF_SPEECH")) return "parts_of_speech";
    if (upper.includes("VOICE") || upper.includes("NARRATION")) return "voice_narration";
    if (
        upper.includes("GRAMMAR") ||
        upper.includes("VERB") ||
        upper.includes("TRANSFORMATION") ||
        upper.includes("SENTENCE") ||
        upper.includes("PUNCTUATION") ||
        upper.includes("SINGULAR")
    ) {
        return "grammar";
    }
    if (
        upper.includes("ENGLISH_TO_BANGLA") ||
        upper.includes("BANGLA_TO_ENGLISH") ||
        upper.includes("SYNONYM") ||
        upper.includes("ANTONYM")
    ) {
        return "vocabulary_quiz";
    }
    return "other";
}

export const getUserSkillsProfile = async (id: number): Promise<{
    data: UserSkillsProfile | null;
    message: string;
    success: boolean;
}> => {
    try {
        const [learnedCount, stillLearningCount, examResults] = await Promise.all([
            prisma.userWord.count({
                where: { userId: id, learningStatus: "LEARNED" },
            }),
            prisma.userWord.count({
                where: { userId: id, learningStatus: "STILL_LEARNING" },
            }),
            prisma.combinedExamResult.findMany({
                where: {
                    userId: id,
                    status: { in: [QuizResultStatus.SUBMITTED, QuizResultStatus.LATE_SUBMITTED] },
                },
                select: {
                    id: true,
                    mode: true,
                    questionCount: true,
                    correctAnswers: true,
                    quizType: {
                        select: { id: true, name: true },
                    },
                    correctQuestions: {
                        select: {
                            id: true,
                            quizType: { select: { id: true, name: true } },
                        },
                    },
                    incorrectQuestions: {
                        select: {
                            id: true,
                            quizType: { select: { id: true, name: true } },
                        },
                    },
                },
            }),
        ]);

        const quizBuckets: Record<string, { correct: number; total: number }> = {
            grammar: { correct: 0, total: 0 },
            prepositions: { correct: 0, total: 0 },
            articles: { correct: 0, total: 0 },
            idioms: { correct: 0, total: 0 },
            tenses: { correct: 0, total: 0 },
            parts_of_speech: { correct: 0, total: 0 },
            voice_narration: { correct: 0, total: 0 },
        };

        for (const r of examResults) {
            const hasDetailedQuestions =
                r.correctQuestions.length > 0 || r.incorrectQuestions.length > 0;

            if (hasDetailedQuestions) {
                for (const q of r.correctQuestions) {
                    const cat = normalizeSkillCategory(q.quizType?.name);
                    if (quizBuckets[cat]) {
                        quizBuckets[cat].correct++;
                        quizBuckets[cat].total++;
                    }
                    if (cat !== "grammar" && cat !== "vocabulary_quiz" && cat !== "other") {
                        quizBuckets.grammar.correct++;
                        quizBuckets.grammar.total++;
                    }
                }
                for (const q of r.incorrectQuestions) {
                    const cat = normalizeSkillCategory(q.quizType?.name);
                    if (quizBuckets[cat]) {
                        quizBuckets[cat].total++;
                    }
                    if (cat !== "grammar" && cat !== "vocabulary_quiz" && cat !== "other") {
                        quizBuckets.grammar.total++;
                    }
                }
            } else {
                const examCat = normalizeSkillCategory(r.quizType?.name);
                if (examCat !== "other" && examCat !== "vocabulary_quiz") {
                    if (quizBuckets[examCat]) {
                        quizBuckets[examCat].correct += r.correctAnswers;
                        quizBuckets[examCat].total += r.questionCount;
                    }
                    if (examCat !== "grammar") {
                        quizBuckets.grammar.correct += r.correctAnswers;
                        quizBuckets.grammar.total += r.questionCount;
                    }
                } else if (
                    r.mode === QuizMode.PRACTICE &&
                    r.quizType?.name &&
                    !r.quizType.name.includes("BANGLA") &&
                    !r.quizType.name.includes("SYNONYM") &&
                    !r.quizType.name.includes("ANTONYM") &&
                    !r.quizType.name.includes("MIXED")
                ) {
                    quizBuckets.grammar.correct += r.correctAnswers;
                    quizBuckets.grammar.total += r.questionCount;
                }
            }
        }

        // Vocabulary percentage: based on learned words as requested
        const totalTrackedWords = learnedCount + stillLearningCount;
        let vocabPercentage = 0;
        let vocabTargetCount = totalTrackedWords;
        if (totalTrackedWords > 0) {
            vocabPercentage = Math.round((learnedCount / totalTrackedWords) * 100);
        } else if (learnedCount > 0) {
            vocabTargetCount = Math.max(learnedCount, 500);
            vocabPercentage = Math.min(100, Math.round((learnedCount / vocabTargetCount) * 100));
        }

        const buildSkill = (
            id: string,
            name: string,
            nameBn: string,
            correct: number,
            total: number,
            unit: "words" | "questions",
            icon: string,
            color: string,
            practiceUrl: string
        ): SkillProfileItem => {
            const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
            return {
                id,
                name,
                nameBn,
                percentage,
                visualBar: generateBlockBar(percentage),
                correctCount: correct,
                totalCount: total,
                unit,
                status: total > 0 ? "active" : "untested",
                icon,
                color,
                practiceUrl,
            };
        };

        const skills: SkillProfileItem[] = [
            {
                id: "vocabulary",
                name: "Vocabulary",
                nameBn: "শব্দভাণ্ডার",
                percentage: vocabPercentage,
                visualBar: generateBlockBar(vocabPercentage),
                correctCount: learnedCount,
                totalCount: vocabTargetCount,
                unit: "words",
                status: (learnedCount > 0 || totalTrackedWords > 0) ? "active" : "untested",
                icon: "BookOpen",
                color: "emerald",
                practiceUrl: "/dictionary",
            },
            buildSkill("grammar", "Grammar", "ব্যাকরণ", quizBuckets.grammar.correct, quizBuckets.grammar.total, "questions", "GraduationCap", "violet", "/quiz"),
            buildSkill("prepositions", "Prepositions", "প্রেপজিশন", quizBuckets.prepositions.correct, quizBuckets.prepositions.total, "questions", "Compass", "amber", "/quiz"),
            buildSkill("articles", "Articles", "আর্টিকেল", quizBuckets.articles.correct, quizBuckets.articles.total, "questions", "FileText", "sky", "/quiz"),
            buildSkill("idioms", "Idioms & Phrases", "বাগধারা ও ইডিয়ম", quizBuckets.idioms.correct, quizBuckets.idioms.total, "questions", "Sparkles", "rose", "/quiz"),
            buildSkill("tenses", "Tenses", "টেন্স / কাল", quizBuckets.tenses.correct, quizBuckets.tenses.total, "questions", "Clock", "indigo", "/quiz"),
            buildSkill("parts_of_speech", "Parts of Speech", "পদ প্রকরণ", quizBuckets.parts_of_speech.correct, quizBuckets.parts_of_speech.total, "questions", "Layers", "cyan", "/quiz"),
            buildSkill("voice_narration", "Voice & Narration", "ভয়েস ও ন্যারেশন", quizBuckets.voice_narration.correct, quizBuckets.voice_narration.total, "questions", "Mic", "fuchsia", "/quiz"),
        ];

        const activeSkills = skills.filter((s) => s.status === "active");
        const overallScore = activeSkills.length > 0
            ? Math.round(activeSkills.reduce((sum, s) => sum + s.percentage, 0) / activeSkills.length)
            : 0;

        let levelTitle = "Beginner (A1)";
        let levelTitleBn = "শিক্ষানবিস স্তর (A1)";
        if (overallScore >= 85) {
            levelTitle = "Advanced (C1-C2)";
            levelTitleBn = "উচ্চতর স্তর (C1-C2)";
        } else if (overallScore >= 70) {
            levelTitle = "Upper Intermediate (B2)";
            levelTitleBn = "উচ্চ-মধ্যম স্তর (B2)";
        } else if (overallScore >= 50) {
            levelTitle = "Intermediate (B1)";
            levelTitleBn = "মধ্যম স্তর (B1)";
        } else if (overallScore >= 30) {
            levelTitle = "Elementary (A2)";
            levelTitleBn = "প্রাথমিক স্তর (A2)";
        }

        const totalQuestionsAttempted = Object.values(quizBuckets).reduce((sum, b) => sum + b.total, 0);

        return {
            data: {
                overallScore,
                levelTitle,
                levelTitleBn,
                skills,
                totalQuestionsAttempted,
                totalWordsMastered: learnedCount,
            },
            message: "User skills profile fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch skills profile for user ${id}: ${error}`);
        return {
            data: null,
            message: "Failed to fetch skills profile",
            success: false,
        };
    }
};

