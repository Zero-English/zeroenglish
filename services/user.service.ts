import prisma from "@/utils/prisma";
import logger from "@/utils/logger";

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

        const userWordCountMap = new Map(
            userWordCounts.map((row) => [
                `${row.userId}:${row.learningStatus}`,
                row._count._all,
            ])
        );

        const totalPages = Math.ceil(total / limit);

        const users = rawUsers.map(({ _count, ...user }) => ({
            ...user,
            bookmarkedCount: _count.userBookmarks,
            learnedWordCount: userWordCountMap.get(`${user.id}:LEARNED`) ?? 0,
            stillLearningCount: userWordCountMap.get(`${user.id}:STILL_LEARNING`) ?? 0,
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
        const rows = await prisma.userWord.findMany({
            where: { userId: id, learningStatus: "LEARNED" },
            select: { updatedAt: true },
        });

        const counts: Record<string, number> = {};
        for (const r of rows) {
            const key = fmtDate(new Date(r.updatedAt));
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
        const todayLearned = counts[todayKey] ?? 0;

        let streak = 0;
        for (let i = 0; ; i++) {
            const day = new Date(now);
            day.setDate(day.getDate() - i);
            if ((counts[fmtDate(day)] ?? 0) > 0) streak += 1;
            else break;
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
