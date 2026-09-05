import type { Word } from "@/lib/data";

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BrowseWordsResponse {
    success: boolean;
    data: Word[] | null;
    pagination?: PaginationInfo;
    message?: string;
}

export interface WordRef {
    id: number;
    word: string;
    level: string;
}

export interface WordStatsData {
    levels: { level: string; count: number }[];
    wordRefs: WordRef[];
}

export interface WordStatsResponse {
    success: boolean;
    data: WordStatsData | null;
    message?: string;
}