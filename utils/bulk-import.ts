import { NextRequest, NextResponse } from "next/server";
import logger from "@/utils/logger";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 10_000;

export type BulkJsonParseResult =
    | { ok: true; rows: unknown[] }
    | { ok: false; response: NextResponse };

const fileError = (message: string, status = 400) =>
    ({ ok: false as const, response: NextResponse.json({ data: null, message, success: false }, { status }) });

/**
 * Parses a `.json` file uploaded to a `?bulk=true` endpoint. Validates the
 * request shape, file type/size and JSON structure, returning the parsed root
 * array on success or a ready-to-send error response otherwise.
 */
export async function parseBulkJsonFile(request: NextRequest): Promise<BulkJsonParseResult> {
    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        logger.warn("Bulk import failed: could not read form data");
        return fileError("Could not read the uploaded form data", 400);
    }

    const file = formData.get("file");

    if (!file || typeof file === "string") {
        logger.warn("Bulk import failed: no file uploaded");
        return fileError("A .json file must be uploaded", 400);
    }

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        logger.warn("Bulk import rejected: not a .json file", {
            fileName: file.name,
            mimeType: file.type,
        });
        return fileError("Only .json files are allowed", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
        logger.warn("Bulk import rejected: file too large", {
            fileName: file.name,
            size: file.size,
        });
        return fileError("File is too large (max 5MB)", 400);
    }

    const text = await file.text();

    let body: unknown;
    try {
        body = JSON.parse(text);
    } catch (error) {
        logger.error("Bulk import failed: invalid JSON", {
            fileName: file.name,
            detail: String(error),
        });
        return fileError("Invalid JSON. Please check the file syntax.", 400);
    }

    if (!Array.isArray(body)) {
        logger.warn("Bulk import rejected: root is not an array", { fileName: file.name });
        return fileError("JSON must be an array of objects", 400);
    }

    if (body.length === 0) {
        logger.warn("Bulk import rejected: empty array", { fileName: file.name });
        return fileError("The JSON file does not contain any items", 400);
    }

    if (body.length > MAX_ROWS) {
        logger.warn("Bulk import rejected: too many rows", {
            fileName: file.name,
            rowCount: body.length,
        });
        return fileError(`Too many items in one file (max ${MAX_ROWS})`, 400);
    }

    return { ok: true, rows: body };
}