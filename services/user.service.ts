import prisma from "@/utils/prisma";
import logger from "@/utils/logger";

export const getUsersByPage = async (page: number = 1, limit: number = 10) => {
    try {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
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
                },
            }),
            prisma.user.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

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
        const user = await prisma.user.findUnique({
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
