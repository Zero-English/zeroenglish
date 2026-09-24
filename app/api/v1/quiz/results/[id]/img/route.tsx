import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import { getCombinedExamResultById } from "@/services/quiz-result.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

const WIDTH = 1200;
const HEIGHT = 630;

const QUIZ_TYPE_LABELS: Record<string, string> = {
    ENGLISH_TO_BANGLA: "English to Bangla",
    BANGLA_TO_ENGLISH: "Bangla to English",
    SYNONYMS: "Synonyms",
    ANTONYMS: "Antonyms",
    MIXED: "Mixed",
    IDIOMS_AND_PHRASES: "Idioms & Phrases",
    PREPOSITIONS: "Prepositions",
    TRUE_FALSE: "True / False",
};

function humanizeQuizType(name: string): string {
    return name
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

// ASCII-only fallback to prevent render breaks on unsupported dynamic fonts
function safeText(value: unknown, fallback = ""): string {
    const raw =
        typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
    const text = raw.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 90) || fallback;
}

type ScoreTone = {
    color: string;
    label: string;
    labelColor: string;
};

function scoreTone(percent: number): ScoreTone {
    if (percent >= 90) {
        return { color: "#00A887", label: "Outstanding!", labelColor: "#00C4EE" };
    }
    if (percent >= 70) {
        return { color: "#1E88E5", label: "Great job!", labelColor: "#00C4EE" };
    }
    if (percent >= 50) {
        return { color: "#FFA000", label: "Keep going!", labelColor: "#FFB703" };
    }
    return { color: "#EE5219", label: "Keep practicing", labelColor: "#F25C05" };
}

function formatResultDate(createdAt: unknown): string {
    const date =
        createdAt instanceof Date ? createdAt : new Date(String(createdAt));
    if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
    return safeText(createdAt, "");
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const resultId = parseInt(id, 10);

    if (Number.isNaN(resultId) || resultId < 1) {
        return Response.json(
            { data: null, message: "Invalid result id", success: false },
            { status: 400 }
        );
    }

    const result = await getCombinedExamResultById(
        resultId,
        user.role === "admin" ? undefined : user.id
    );

    if (!result.success) {
        const status = result.message === "Combined exam result not found" ? 404 : 500;
        if (status === 500) {
            logger.error(`Quiz result image render failed: fetch by id error`, {
                resultId,
                message: result.message,
            });
        }
        return Response.json(result, { status });
    }

    const data = result.data;
    if (!data) {
        return Response.json(
            { data: null, message: "Combined exam result not found", success: false },
            { status: 404 }
        );
    }

    const percent = Math.max(0, Math.min(100, data.scoreInPercent));
    const tone = scoreTone(percent);

    const quizTypeName = safeText(data.quizType?.name);
    const quizTypeLabel =
        QUIZ_TYPE_LABELS[quizTypeName] ?? humanizeQuizType(quizTypeName);
    const title = safeText(data.title, "Quiz Result");
    const date = formatResultDate(data.createdAt);

    const questionCount = data.questionCount;
    const correctCount = Math.max(0, data.correctAnswers);
    const incorrectCount = Math.max(0, questionCount - correctCount);
    const accuracy =
        questionCount > 0
            ? Math.round((correctCount / questionCount) * 100)
            : percent;

    const levels = Array.isArray(data.levels) ? data.levels : [];
    const timePerQuestion = data.timePerQuestion ?? 0;

    const statCards = [
        {
            key: "questions",
            value: `${questionCount}`,
            label: "Questions",
            valueColor: "#F8FAF9",
        },
        {
            key: "correct",
            value: `${correctCount}`,
            label: "Correct",
            valueColor: "#00A887",
        },
        {
            key: "incorrect",
            value: `${incorrectCount}`,
            label: "Incorrect",
            valueColor: "#F25C05",
        },
        {
            key: "time",
            value: `${timePerQuestion}s`,
            label: "Sec / Question",
            valueColor: "#00C4EE",
        },
    ] as const;

    try {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: WIDTH,
                        height: HEIGHT,
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "hidden",
                        backgroundColor: "#041A21",
                        padding: "40px 64px",
                        color: "#F8FAF9",
                    }}
                >
                    {/* Background Branding Elements */}
                    <div
                        style={{
                            position: "absolute",
                            top: -100,
                            right: -100,
                            width: 450,
                            height: 450,
                            borderRadius: 999,
                            backgroundColor: "rgba(242, 92, 5, 0.12)",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: -120,
                            left: -100,
                            width: 400,
                            height: 400,
                            borderRadius: 999,
                            backgroundColor: "rgba(0, 168, 135, 0.15)",
                        }}
                    />

                    {/* Top Header Row */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "relative",
                        }}
                    >
                        {/* Zero English Brand Logo Unit */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    fontSize: 32,
                                    fontWeight: 900,
                                    letterSpacing: -0.5,
                                }}
                            >
                                <span style={{ color: "#00A887" }}>Z</span>
                                <span style={{ color: "#00A887", position: "relative" }}>
                                    E
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "45%",
                                            left: 2,
                                            width: 12,
                                            height: 4,
                                            backgroundColor: "#FFB703",
                                        }}
                                    />
                                </span>
                                <span style={{ color: "#00A887" }}>R</span>
                                <span style={{ color: "#00A887", position: "relative" }}>
                                    O
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "45%",
                                            left: "20%",
                                            width: 14,
                                            height: 4,
                                            backgroundColor: "#F25C05",
                                        }}
                                    />
                                </span>
                                <span style={{ color: "#00A887", marginLeft: 8 }}>E</span>
                                <span style={{ color: "#00A887" }}>N</span>
                                <span style={{ color: "#00A887" }}>G</span>
                                <span style={{ color: "#00A887" }}>L</span>
                                <span style={{ color: "#00A887" }}>I</span>
                                <span style={{ color: "#00A887" }}>S</span>
                                <span style={{ color: "#F25C05" }}>H</span>
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    letterSpacing: 4,
                                    color: "#E3F2FD",
                                    marginTop: -2,
                                }}
                            >
                                LEARN WITHOUT LIMITS
                            </div>
                        </div>

                        {/* Pill Badge */}
                        <div
                            style={{
                                padding: "8px 20px",
                                borderRadius: 999,
                                border: "1px solid rgba(242, 92, 5, 0.4)",
                                backgroundColor: "rgba(242, 92, 5, 0.1)",
                                fontSize: 15,
                                fontWeight: 700,
                                letterSpacing: 2,
                                color: "#F25C05",
                            }}
                        >
                            QUIZ RESULT
                        </div>
                    </div>

                    {/* Main Content Body */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <div style={{ fontSize: 18, color: "#E3F2FD", fontWeight: 500 }}>
                                {title}
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: "#F8FAF9" }}>
                                {quizTypeLabel}
                            </div>
                        </div>

                        {/* Big Score Display */}
                        <div
                            style={{
                                fontSize: 110,
                                lineHeight: 1,
                                fontWeight: 900,
                                color: tone.color,
                            }}
                        >
                            {`${percent}%`}
                        </div>
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: tone.labelColor,
                                marginTop: -8,
                            }}
                        >
                            {tone.label}
                        </div>

                        {/* Stat Cards */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 16,
                                marginTop: 12,
                            }}
                        >
                            {statCards.map((stat) => (
                                <div
                                    key={stat.key}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 2,
                                        minWidth: 145,
                                        padding: "12px 20px",
                                        borderRadius: 14,
                                        backgroundColor: "rgba(248, 250, 249, 0.04)",
                                        border: "1px solid rgba(248, 250, 249, 0.08)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            color: stat.valueColor,
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#E3F2FD", fontWeight: 600 }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Accuracy Progress Bar */}
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                marginTop: 8,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        letterSpacing: 1,
                                        color: "#00A887",
                                    }}
                                >
                                    ACCURACY
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#F8FAF9" }}>
                                    {`${accuracy}%`}
                                </span>
                            </div>
                            <div
                                style={{
                                    width: "100%",
                                    height: 10,
                                    display: "flex",
                                    borderRadius: 999,
                                    backgroundColor: "rgba(248, 250, 249, 0.1)",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${accuracy}%`,
                                        height: "100%",
                                        borderRadius: 999,
                                        backgroundColor: tone.color,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Level Badges */}
                        {levels.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "row", gap: 10, marginTop: 4 }}>
                                {levels.map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                            padding: "4px 14px",
                                            borderRadius: 999,
                                            backgroundColor: "rgba(0, 168, 135, 0.15)",
                                            border: "1px solid rgba(0, 168, 135, 0.4)",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "#00C4EE",
                                        }}
                                    >
                                        {level}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Row */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "relative",
                            borderTop: "1px solid rgba(248, 250, 249, 0.08)",
                            paddingTop: 16,
                        }}
                    >
                        <div style={{ fontSize: 14, color: "#0F9D78", fontWeight: 500 }}>
                            Learn English vocabulary in Bangla
                        </div>
                        <div style={{ fontSize: 14, color: "#0F9D78", fontWeight: 500 }}>{date}</div>
                    </div>
                </div>
            ),
            {
                width: WIDTH,
                height: HEIGHT,
                headers: {
                    "Cache-Control": "private, no-store",
                },
            }
        );
    } catch (error) {
        logger.error(`Quiz result image render failed`, {
            resultId,
            message: error instanceof Error ? error.message : String(error),
        });
        return new Response("Failed to generate the image", { status: 500 });
    }
}