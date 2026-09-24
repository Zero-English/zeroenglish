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

// The default ImageResponse font only ships Latin glyphs, so any dynamic value
// that reaches the canvas is reduced to printable ASCII to keep the render
// from failing on unsupported characters (e.g. Bangla).
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
        return { color: "#34d399", label: "Outstanding!", labelColor: "#6ee7b7" };
    }
    if (percent >= 70) {
        return { color: "#38bdf8", label: "Great job!", labelColor: "#7dd3fc" };
    }
    if (percent >= 50) {
        return { color: "#fbbf24", label: "Keep going!", labelColor: "#fcd34d" };
    }
    return { color: "#fb7185", label: "Keep practicing", labelColor: "#fda4af" };
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

/**
 * @openapi
 * /api/v1/quiz/results/{id}/img:
 *   get:
 *     summary: Generate a shareable quiz result image
 *     description: >
 *       Generates a PNG image summarising the current authenticated user's quiz
 *       result (score, correct/incorrect counts and accuracy). Admins may render
 *       any result.
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz result id
 *     responses:
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid result id
 *       404:
 *         description: Quiz result not found
 *       500:
 *         description: Failed to render result image
 *       200:
 *         description: Quiz result image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 */
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
            valueColor: "#f8fafc",
        },
        {
            key: "correct",
            value: `${correctCount}`,
            label: "Correct",
            valueColor: "#34d399",
        },
        {
            key: "incorrect",
            value: `${incorrectCount}`,
            label: "Incorrect",
            valueColor: "#fb7185",
        },
        {
            key: "time",
            value: `${timePerQuestion}s`,
            label: "Sec / Question",
            valueColor: "#f8fafc",
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
                        backgroundColor: "#0b1220",
                        padding: "40px 64px",
                        color: "#f8fafc",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: -120,
                            right: -90,
                            width: 380,
                            height: 380,
                            borderRadius: 999,
                            backgroundColor: "rgba(139, 92, 246, 0.2)",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: -120,
                            left: -90,
                            width: 340,
                            height: 340,
                            borderRadius: 999,
                            backgroundColor: "rgba(14, 165, 233, 0.16)",
                        }}
                    />

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 14,
                                    backgroundColor: "#8b5cf6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 26,
                                    fontWeight: 700,
                                    color: "#ffffff",
                                }}
                            >
                                Z
                            </div>
                            <div style={{ fontSize: 26, fontWeight: 700 }}>
                                Zero English
                            </div>
                        </div>
                        <div
                            style={{
                                padding: "8px 18px",
                                borderRadius: 999,
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                fontSize: 16,
                                fontWeight: 600,
                                letterSpacing: 2,
                                color: "#cbd5e1",
                            }}
                        >
                            QUIZ RESULT
                        </div>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 16,
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <div style={{ fontSize: 20, color: "#94a3b8" }}>{title}</div>
                            <div style={{ fontSize: 32, color: "#f8fafc" }}>{quizTypeLabel}</div>
                        </div>

                        <div
                            style={{
                                fontSize: 120,
                                lineHeight: 1,
                                fontWeight: 700,
                                color: tone.color,
                            }}
                        >
                            {`${percent}%`}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 600, color: tone.labelColor }}>
                            {tone.label}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 18,
                                marginTop: 8,
                            }}
                        >
                            {statCards.map((stat) => (
                                <div
                                    key={stat.key}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 4,
                                        minWidth: 150,
                                        padding: "14px 22px",
                                        borderRadius: 16,
                                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                                        border: "1px solid rgba(255, 255, 255, 0.08)",
                                    }}
                                >
                                    <div style={{ fontSize: 30, fontWeight: 700, color: stat.valueColor }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: 14, color: "#94a3b8" }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
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
                                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1, color: "#94a3b8" }}>
                                    ACCURACY
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                                    {`${accuracy}%`}
                                </span>
                            </div>
                            <div
                                style={{
                                    width: "100%",
                                    height: 12,
                                    display: "flex",
                                    borderRadius: 999,
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
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

                        {levels.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                                {levels.map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                            padding: "6px 16px",
                                            borderRadius: 999,
                                            backgroundColor: "rgba(139, 92, 246, 0.2)",
                                            border: "1px solid rgba(167, 139, 250, 0.35)",
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "#ddd6fe",
                                        }}
                                    >
                                        {level}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "relative",
                        }}
                    >
                        <div style={{ fontSize: 15, color: "#64748b" }}>
                            Learn English vocabulary in Bangla
                        </div>
                        <div style={{ fontSize: 15, color: "#64748b" }}>{date}</div>
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