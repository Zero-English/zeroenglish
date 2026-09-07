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
