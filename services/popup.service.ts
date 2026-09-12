import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Prisma } from "@/generated/prisma/client";

const popupMediaSelect = {
    select: {
        id: true,
        url: true,
        name: true,
        mimeType: true,
        width: true,
        height: true,
    },
} as const;

const popupAdminInclude = {
    landscapeMedia: popupMediaSelect,
    portraitMedia: popupMediaSelect,
} as const;

type PopupPayload = Prisma.PopupGetPayload<{
    include: typeof popupAdminInclude;
}>;

export type PopupCreateInput = {
    name: string;
    active?: boolean;
    link?: string;
    landscapeMediaId?: number | null;
    portraitMediaId?: number | null;
    scheduleEnabled?: boolean;
    scheduledOpeningTime?: string | Date | null;
    scheduledClosingTime?: string | Date | null;
    audience?: string;
    pageRule?: string;
    includePaths?: string[];
    animation?: string;
};

export type PopupUpdateInput = Partial<PopupCreateInput>;

const toApiPopup = (popup: PopupPayload) => ({
    id: popup.id,
    name: popup.name,
    active: popup.active,
    link: popup.link,
    landscapeMediaId: popup.landscapeMediaId,
    portraitMediaId: popup.portraitMediaId,
    landscapeMedia: popup.landscapeMedia,
    portraitMedia: popup.portraitMedia,
    scheduleEnabled: popup.scheduleEnabled,
    scheduledOpeningTime: popup.scheduledOpeningTime,
    scheduledClosingTime: popup.scheduledClosingTime,
    audience: popup.audience,
    pageRule: popup.pageRule,
    includePaths: popup.includePaths,
    animation: popup.animation,
    createdAt: popup.createdAt,
    updatedAt: popup.updatedAt,
});

const notFound = () => ({
    data: null,
    message: "Popup not found",
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

const validateMedia = async (
    landscapeMediaId?: number | null,
    portraitMediaId?: number | null,
): Promise<string | null> => {
    const ids = [
        ...new Set(
            [landscapeMediaId, portraitMediaId].filter(
                (id): id is number => id != null && id > 0,
            ),
        ),
    ];
    if (ids.length === 0) return null;

    const found = await prisma.media.findMany({
        where: { id: { in: ids } },
        select: { id: true },
    });

    if (found.length !== ids.length) {
        return "One or more selected images do not exist";
    }
    return null;
};

export const getPopupsByPage = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    try {
        const where: Prisma.PopupWhereInput = search
            ? { name: { contains: search, mode: "insensitive" } }
            : {};

        const skip = (page - 1) * limit;

        const [popups, total] = await Promise.all([
            prisma.popup.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: popupAdminInclude,
            }),
            prisma.popup.count({ where }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: popups.map(toApiPopup),
            pagination: { total, page, limit, totalPages },
            message: "Popups fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch popups: ${error}`);
        return {
            data: null,
            message: "Failed to fetch popups",
            success: false,
        };
    }
};

export const getPopupById = async (id: number) => {
    try {
        const popup = await prisma.popup.findUnique({
            where: { id },
            include: popupAdminInclude,
        });

        if (!popup) return notFound();

        return {
            data: toApiPopup(popup),
            message: "Popup fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch popup: ${error}`);
        return {
            data: null,
            message: "Failed to fetch popup",
            success: false,
        };
    }
};

export const createPopup = async (data: PopupCreateInput) => {
    try {
        const scheduleError = validateSchedule(data);
        if (scheduleError) {
            return { data: null, message: scheduleError, success: false };
        }

        const mediaError = await validateMedia(
            data.landscapeMediaId,
            data.portraitMediaId,
        );
        if (mediaError) {
            return { data: null, message: mediaError, success: false };
        }

        const popup = await prisma.popup.create({
            data: {
                name: data.name,
                active: data.active ?? true,
                link: data.link ?? "",
                landscapeMediaId: data.landscapeMediaId ?? null,
                portraitMediaId: data.portraitMediaId ?? null,
                scheduleEnabled: data.scheduleEnabled ?? false,
                scheduledOpeningTime: data.scheduledOpeningTime
                    ? new Date(data.scheduledOpeningTime)
                    : null,
                scheduledClosingTime: data.scheduledClosingTime
                    ? new Date(data.scheduledClosingTime)
                    : null,
                audience: data.audience ?? "ALL",
                pageRule: data.pageRule ?? "ALL",
                includePaths: data.includePaths ?? [],
                animation: data.animation ?? "FADE",
            },
            include: popupAdminInclude,
        });

        return {
            data: toApiPopup(popup),
            message: "Popup created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create popup: ${error}`);
        return {
            data: null,
            message: "Failed to create popup",
            success: false,
        };
    }
};

export const updatePopupById = async (id: number, data: PopupUpdateInput) => {
    try {
        const existing = await prisma.popup.findUnique({ where: { id } });
        if (!existing) return notFound();

        const scheduleError = validateSchedule(data);
        if (scheduleError) {
            return { data: null, message: scheduleError, success: false };
        }

        const mediaError = await validateMedia(
            data.landscapeMediaId,
            data.portraitMediaId,
        );
        if (mediaError) {
            return { data: null, message: mediaError, success: false };
        }

        const updateData: Prisma.PopupUpdateInput = {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.active !== undefined ? { active: data.active } : {}),
            ...(data.link !== undefined ? { link: data.link } : {}),
            ...(data.landscapeMediaId !== undefined
                ? { landscapeMediaId: data.landscapeMediaId ?? null }
                : {}),
            ...(data.portraitMediaId !== undefined
                ? { portraitMediaId: data.portraitMediaId ?? null }
                : {}),
            ...(data.scheduleEnabled !== undefined
                ? { scheduleEnabled: data.scheduleEnabled }
                : {}),
            ...(data.scheduledOpeningTime !== undefined
                ? {
                      scheduledOpeningTime: data.scheduledOpeningTime
                          ? new Date(data.scheduledOpeningTime)
                          : null,
                  }
                : {}),
            ...(data.scheduledClosingTime !== undefined
                ? {
                      scheduledClosingTime: data.scheduledClosingTime
                          ? new Date(data.scheduledClosingTime)
                          : null,
                  }
                : {}),
            ...(data.audience !== undefined ? { audience: data.audience } : {}),
            ...(data.pageRule !== undefined ? { pageRule: data.pageRule } : {}),
            ...(data.includePaths !== undefined
                ? { includePaths: data.includePaths }
                : {}),
            ...(data.animation !== undefined ? { animation: data.animation } : {}),
        };

        const popup = await prisma.popup.update({
            where: { id },
            data: updateData,
            include: popupAdminInclude,
        });

        return {
            data: toApiPopup(popup),
            message: "Popup updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update popup: ${error}`);
        return {
            data: null,
            message: "Failed to update popup",
            success: false,
        };
    }
};

export const deletePopupById = async (id: number) => {
    try {
        const existing = await prisma.popup.findUnique({ where: { id } });
        if (!existing) return notFound();

        await prisma.popup.delete({ where: { id } });

        return {
            data: null,
            message: "Popup deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete popup: ${error}`);
        return {
            data: null,
            message: "Failed to delete popup",
            success: false,
        };
    }
};

export const getActivePopups = async () => {
    try {
        const now = new Date();

        const popups = await prisma.popup.findMany({
            where: {
                active: true,
                OR: [
                    { landscapeMediaId: { not: null } },
                    { portraitMediaId: { not: null } },
                ],
                AND: [
                    {
                        OR: [
                            { scheduleEnabled: false },
                            {
                                scheduleEnabled: true,
                                scheduledOpeningTime: { lte: now },
                                scheduledClosingTime: { gte: now },
                            },
                        ],
                    },
                ],
            },
            orderBy: { createdAt: "desc" },
            include: popupAdminInclude,
        });

        return {
            data: popups.map(toApiPopup),
            message: "Active popups fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch active popups: ${error}`);
        return {
            data: null,
            message: "Failed to fetch active popups",
            success: false,
        };
    }
};