import { toFile } from "@imagekit/nodejs";
import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import imagekit from "@/utils/imagekit";
import type { Media as MediaRecord, Prisma } from "@/generated/prisma/client";
import { FOLDER_NAME_REGEX, type MediaUpdateInput } from "@/utils/validation/zod";

export const ALLOWED_MEDIA_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/svg+xml",
]);

export const ALLOWED_MEDIA_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
    ".svg",
]);

export const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024;

export const IMAGEKIT_UPLOAD_FOLDER = "/zeroenglish";

export const folderOf = (filePath: string): string | null => {
    const dirname = filePath.includes("/") ? filePath.split("/").slice(0, -1).join("/") : "";
    if (!dirname || dirname === IMAGEKIT_UPLOAD_FOLDER) return null;
    if (!dirname.startsWith(`${IMAGEKIT_UPLOAD_FOLDER}/`)) return null;
    return dirname.slice(IMAGEKIT_UPLOAD_FOLDER.length + 1);
};

export const toApiMedia = (m: MediaRecord) => ({
    id: m.id,
    fileId: m.fileId,
    url: m.url,
    name: m.name,
    filePath: m.filePath,
    mimeType: m.mimeType,
    size: m.size,
    width: m.width,
    height: m.height,
    altText: m.altText,
    caption: m.caption,
    tags: m.tags,
    folder: folderOf(m.filePath),
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
});

export const getMediaByPage = async (
    page: number = 1,
    limit: number = 12,
    search?: string,
    folder?: string,
) => {
    try {
        const skip = (page - 1) * limit;

        const where: Prisma.MediaWhereInput = search
            ? {
                  OR: [
                      { name: { contains: search, mode: "insensitive" } },
                      { altText: { contains: search, mode: "insensitive" } },
                      { caption: { contains: search, mode: "insensitive" } },
                  ],
              }
            : {};

        const all = await prisma.media.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fileId: true,
                url: true,
                name: true,
                filePath: true,
                mimeType: true,
                size: true,
                width: true,
                height: true,
                altText: true,
                caption: true,
                tags: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        let items = all;
        if (folder && folder !== "all") {
            items = all.filter((m) => (folder === "root" ? folderOf(m.filePath) === null : folderOf(m.filePath) === folder));
        }

        const total = items.length;
        const totalPages = Math.ceil(total / limit);
        const data = items.slice(skip, skip + limit).map(toApiMedia);

        return {
            data,
            pagination: { total, page, limit, totalPages },
            message: "Media fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch media: ${error}`);
        return { data: null, message: "Failed to fetch media", success: false };
    }
};

export type CreateMediaInput = {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
    size: number;
    altText?: string;
    caption?: string;
    tags?: string[];
    folder?: string;
};

export const createMedia = async (input: CreateMediaInput) => {
    try {
        const fileName = input.fileName.trim();
        const lowerFileName = fileName.toLowerCase();

        const mimeAllowed = ALLOWED_MEDIA_MIME_TYPES.has(input.mimeType);
        const extAllowed = ALLOWED_MEDIA_EXTENSIONS.has(
            lowerFileName.slice(lowerFileName.lastIndexOf(".")),
        );

        if (!mimeAllowed && !extAllowed) {
            return {
                data: null,
                message: "Only image files (JPEG, PNG, WEBP, GIF, AVIF, SVG) are allowed",
                success: false,
            };
        }

        const targetFolder = input.folder?.trim();
        if (targetFolder && !(targetFolder.length <= 40 && FOLDER_NAME_REGEX.test(targetFolder))) {
            return { data: null, message: "Invalid folder name", success: false };
        }

        const uploadFolder = targetFolder ? `${IMAGEKIT_UPLOAD_FOLDER}/${targetFolder}` : IMAGEKIT_UPLOAD_FOLDER;

        const upload = await imagekit.files.upload({
            file: await toFile(input.fileBuffer, fileName),
            fileName,
            folder: uploadFolder.replace(/^\/+/, ""),
            useUniqueFileName: true,
            tags: input.tags ?? [],
        });

        const record = await prisma.media.create({
            data: {
                fileId: upload.fileId ?? "",
                url: upload.url ?? "",
                name: upload.name ?? fileName,
                filePath: upload.filePath ?? "",
                mimeType: input.mimeType,
                size: upload.size ?? input.size,
                width: upload.width ?? null,
                height: upload.height ?? null,
                altText: input.altText ?? "",
                caption: input.caption ?? "",
                tags: input.tags ?? [],
            },
        });

        return {
            data: toApiMedia(record),
            message: "Media uploaded successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to upload media: ${error}`);
        return { data: null, message: "Failed to upload media to the media library", success: false };
    }
};

export const updateMediaById = async (id: number, data: MediaUpdateInput) => {
    try {
        const existing = await prisma.media.findUnique({ where: { id } });
        if (!existing) {
            return { data: null, message: "Media not found", success: false };
        }

        const updateData: Prisma.MediaUpdateInput = {};
        if (data.altText !== undefined) updateData.altText = data.altText;
        if (data.caption !== undefined) updateData.caption = data.caption;
        if (data.tags !== undefined) updateData.tags = data.tags;

        if (Object.keys(updateData).length === 0) {
            return { data: null, message: "No fields to update", success: false };
        }

        const record = await prisma.media.update({ where: { id }, data: updateData });

        if (data.tags !== undefined) {
            imagekit.files
                .update(existing.fileId, { tags: data.tags })
                .catch((error) =>
                    logger.warn(`Failed to sync media tags to ImageKit for id ${id}: ${error}`),
                );
        }

        return {
            data: toApiMedia(record),
            message: "Media updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update media ${id}: ${error}`);
        return { data: null, message: "Failed to update media", success: false };
    }
};

export const moveMediaById = async (id: number, targetFolder: string | null) => {
    try {
        const existing = await prisma.media.findUnique({ where: { id } });
        if (!existing) {
            return { data: null, message: "Media not found", success: false };
        }
        if (folderOf(existing.filePath) === targetFolder) {
            return {
                data: toApiMedia(existing),
                message: "Media updated successfully",
                success: true,
            };
        }

        const folderName = targetFolder?.trim() ?? null;
        if (folderName && !(folderName.length <= 40 && FOLDER_NAME_REGEX.test(folderName))) {
            return { data: null, message: "Invalid folder name", success: false };
        }

        const destinationFolder = folderName ? `${IMAGEKIT_UPLOAD_FOLDER}/${folderName}` : IMAGEKIT_UPLOAD_FOLDER;

        await imagekit.files.move({
            sourceFilePath: existing.filePath,
            destinationPath: `${destinationFolder}/`,
        });

        const baseName = existing.filePath.split("/").pop() ?? "";
        const newFilePath = `${destinationFolder}/${baseName}`;
        const newUrl = existing.url.replace(existing.filePath, newFilePath);

        const record = await prisma.media.update({
            where: { id },
            data: { filePath: newFilePath, url: newUrl },
        });

        return {
            data: toApiMedia(record),
            message: "Media moved successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to move media ${id}: ${error}`);
        return { data: null, message: "Failed to move the image in the media library", success: false };
    }
};

export const deleteMediaById = async (id: number) => {
    try {
        const existing = await prisma.media.findUnique({ where: { id } });
        if (!existing) {
            return { data: null, message: "Media not found", success: false };
        }

        await imagekit.files.delete(existing.fileId);
        await prisma.media.delete({ where: { id } });

        return { data: { id }, message: "Media deleted successfully", success: true };
    } catch (error) {
        logger.error(`Failed to delete media ${id}: ${error}`);
        return { data: null, message: "Failed to delete media", success: false };
    }
};