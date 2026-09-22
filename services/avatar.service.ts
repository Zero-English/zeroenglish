import { toFile } from "@imagekit/nodejs";
import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import imagekit from "@/utils/imagekit";

export const AVATAR_UPLOAD_FOLDER = "/zeroenglish/profile_pictures";

export const ALLOWED_AVATAR_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const EXT_BY_MIME: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

// ImageKit folder paths must not start with a leading slash.
const avatarUploadFolder = AVATAR_UPLOAD_FOLDER.replace(/^\/+/, "");

const isImageKitUrl = (url: string | null | undefined): url is string =>
    !!url && url.includes("ik.imagekit.io/");

const toApiProfile = (u: {
    id: number;
    name: string | null;
    user_name: string;
    email: string;
    image: string | null;
    institutionName: string | null;
    bio: string | null;
    class: string | null;
    gender: string | null;
    socialLinks: string[];
}) => ({
    id: u.id,
    name: u.name,
    user_name: u.user_name,
    email: u.email,
    image: u.image,
    institutionName: u.institutionName,
    bio: u.bio,
    class: u.class,
    gender: u.gender,
    socialLinks: u.socialLinks,
});

export type UpdateAvatarInput = {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
    size: number;
};

export const updateUserAvatar = async (userId: number, input: UpdateAvatarInput) => {
    try {
        const lowerFileName = input.fileName.trim().toLowerCase();
        const extAllowed =
            lowerFileName.endsWith(".jpg") ||
            lowerFileName.endsWith(".jpeg") ||
            lowerFileName.endsWith(".png") ||
            lowerFileName.endsWith(".webp");

        if (!ALLOWED_AVATAR_MIME_TYPES.has(input.mimeType) && !extAllowed) {
            return {
                data: null,
                message: "Only JPG, PNG or WebP images are allowed",
                success: false,
            };
        }

        if (input.size <= 0) {
            return {
                data: null,
                message: "The uploaded file is empty",
                success: false,
            };
        }

        if (input.size > MAX_AVATAR_FILE_SIZE) {
            return {
                data: null,
                message: "Profile picture is too large (max 5MB)",
                success: false,
            };
        }

        const existing = await prisma.user.findUnique({
            where: { id: userId },
            select: { image: true },
        });
        if (!existing) {
            return {
                data: null,
                message: "User not found",
                success: false,
            };
        }

        // Deterministic per-user filename so a re-upload (same format) overwrites
        // the previous file instead of accumulating orphaned images.
        const extension =
            EXT_BY_MIME[input.mimeType] ??
            (lowerFileName.endsWith(".jpeg") ? ".jpg" : ".jpg");
        const uploadName = `profile-user-${userId}${extension}`;

        const upload = await imagekit.files.upload({
            file: await toFile(input.fileBuffer, uploadName),
            fileName: uploadName,
            folder: avatarUploadFolder,
            useUniqueFileName: false,
            overwriteFile: true,
        });

        const url = upload.url ?? "";
        if (!url) {
            return {
                data: null,
                message: "Failed to upload profile picture",
                success: false,
            };
        }

        // Purge the CDN cache of the previous ImageKit-hosted picture so the
        // overwritten file is served immediately (best effort, non-blocking).
        if (isImageKitUrl(existing.image)) {
            await imagekit.cache.invalidation
                .create({ url: existing.image })
                .catch((error) =>
                    logger.warn(`Failed to purge cache of previous avatar for user ${userId}: ${error}`),
                );
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { image: url },
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
            data: toApiProfile(updated),
            message: "Profile picture updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update avatar for user ${userId}: ${error}`);
        return {
            data: null,
            message: "Failed to update profile picture",
            success: false,
        };
    }
};