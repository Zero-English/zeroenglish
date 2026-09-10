import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import { QuizMode, QuizResultStatus } from "@/generated/prisma/enums";

export const getLeaderboard = async () => {
    try {
        const examWhere = {
            mode: { in: [QuizMode.WEEKLY, QuizMode.BIWEEKLY] },
            status: { in: [QuizResultStatus.SUBMITTED, QuizResultStatus.LATE_SUBMITTED] },
        };

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [allTimeAvgs, lastWeekAvgs, users] = await Promise.all([
            prisma.quizResults.groupBy({
                by: ["userId"],
                where: examWhere,
                _avg: { scoreInPercent: true },
                _count: { _all: true },
            }),
            prisma.quizResults.groupBy({
                by: ["userId"],
                where: { ...examWhere, createdAt: { gte: sevenDaysAgo } },
                _avg: { scoreInPercent: true },
                _count: { _all: true },
            }),
            prisma.user.findMany({
                select: { id: true, name: true, user_name: true, image: true },
                orderBy: { created_at: "asc" },
            }),
        ]);

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

        const quizAvgs = await prisma.quizResults.groupBy({
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
        role?: "user" | "admin";
        image?: string | null;
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

