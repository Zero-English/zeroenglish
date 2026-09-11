import logger from "@/utils/logger";
import imagekit from "@/utils/imagekit";
import { IMAGEKIT_UPLOAD_FOLDER } from "@/services/media.service";
import { FOLDER_NAME_REGEX } from "@/utils/validation/zod";

const IMAGEKIT_API_BASE = "https://api.imagekit.io/v1";

type ImageKitFolder = {
    type: string;
    name: string;
    folderId: string;
    folderPath?: string;
    createdAt?: string;
};

const imagekitGet = async (endpoint: string, params: Record<string, string>) => {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");
    }
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${IMAGEKIT_API_BASE}${endpoint}?${query}`, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
        },
    });
    if (!res.ok) {
        throw new Error(`ImageKit API error ${res.status}`);
    }
    const json = (await res.json()) as unknown;
    if (Array.isArray(json)) return json;
    if (json && typeof json === "object") {
        const record = json as Record<string, unknown>;
        if (Array.isArray(record.data)) return record.data;
    }
    return [];
};

export const toApiFolder = (f: { name: string; folderPath?: string; mediaCount?: number }) => ({
    name: f.name,
    path: f.folderPath ?? null,
    mediaCount: f.mediaCount ?? null,
});

const countFilesInFolder = async (folderPath: string): Promise<number> => {
    try {
        const files = (await imagekitGet("/files", {
            type: "file",
            path: folderPath,
            limit: "1000",
        })) as unknown[];
        return files.length;
    } catch (error) {
        logger.warn(`Failed to count files in folder ${folderPath}: ${error}`);
        return 0;
    }
};

export const getFolders = async () => {
    try {
        const items = (await imagekitGet("/files", {
            type: "folder",
            path: IMAGEKIT_UPLOAD_FOLDER,
            limit: "1000",
        })) as ImageKitFolder[];

        const folders = items
            .filter(
                (item) =>
                    item.type === "folder" &&
                    item.folderPath &&
                    item.folderPath.startsWith(`${IMAGEKIT_UPLOAD_FOLDER}/`),
            )
            .map((item) => ({
                name: item.name,
                folderPath: item.folderPath as string,
            }));

        const withCounts = await Promise.all(
            folders.map(async (folder) => ({
                ...folder,
                mediaCount: await countFilesInFolder(folder.folderPath),
            })),
        );

        withCounts.sort((a, b) => a.name.localeCompare(b.name));

        return {
            data: withCounts.map(toApiFolder),
            message: "Folders fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch media folders: ${error}`);
        return { data: null, message: "Failed to fetch media folders", success: false };
    }
};

export const createFolder = async (name: string) => {
    try {
        await imagekit.folders.create({
            folderName: name,
            parentFolderPath: IMAGEKIT_UPLOAD_FOLDER,
        });

        return { data: toApiFolder({ name }), message: "Folder created successfully", success: true };
    } catch (error) {
        logger.error(`Failed to create media folder "${name}": ${error}`);
        const detail = String(error);
        if (detail.includes("already") || detail.includes("exist")) {
            return { data: null, message: "A folder with this name already exists", success: false };
        }
        return { data: null, message: "Failed to create folder on the media library", success: false };
    }
};

export const removeFolder = async (name: string) => {
    try {
        const folderPath = `${IMAGEKIT_UPLOAD_FOLDER}/${name}`;

        const count = await countFilesInFolder(folderPath);
        if (count > 0) {
            return {
                data: null,
                message: `Folder "${name}" is not empty (${count} image${count === 1 ? "" : "s"}). Move or delete them first.`,
                success: false,
            };
        }

        await imagekit.folders.delete({ folderPath });

        return { data: { name }, message: "Folder deleted successfully", success: true };
    } catch (error) {
        logger.error(`Failed to delete media folder "${name}": ${error}`);
        return { data: null, message: "Failed to delete folder from the media library", success: false };
    }
};

export const isFolderNameValid = (value: string) =>
    value.trim().length > 0 && value.trim().length <= 40 && FOLDER_NAME_REGEX.test(value.trim());