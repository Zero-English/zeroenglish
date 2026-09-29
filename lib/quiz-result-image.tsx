import type { ReactElement } from "react";

export const QUIZ_RESULT_IMAGE_WIDTH = 1200;
export const QUIZ_RESULT_IMAGE_HEIGHT = 630;

const AVATAR_SIZE = 250;

export type QuizResultImageData = {
    id: number;
    title: string;
    questionCount: number;
    correctAnswers: number;
    scoreInPercent: number;
    timePerQuestion: number;
    createdAt: Date;
    levels: string[];
    quizType?: { name: string } | null;
};

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
export function safeText(value: unknown, fallback = ""): string {
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

/**
 * Builds the 1200x630 quiz result card markup consumed by `next/og`.
 * Shared by the session-protected `/api/v1/quiz/results/{id}/img` route and
 * the public `/profile/quiz-results/{id}/image` route used for social sharing.
 */
export function buildQuizResultImage({
    data,
    backgroundImageUrl,
    avatarUrl,
    avatarInitial,
}: {
    data: QuizResultImageData;
    backgroundImageUrl: string;
    avatarUrl: string | null;
    avatarInitial: string;
}): ReactElement {
    const percent = Math.max(0, Math.min(100, data.scoreInPercent));
    const tone = scoreTone(percent);

    const quizTypeName = safeText(data.quizType?.name);
    const quizTypeLabel =
        QUIZ_TYPE_LABELS[quizTypeName] ?? humanizeQuizType(quizTypeName);
    const title = safeText(data.title, "Quiz Result");
    const date = formatResultDate(data.createdAt);

    const questionCount = data.questionCount;
    const correctCount = Math.max(0, data.correctAnswers);
    const accuracy =
        questionCount > 0
            ? Math.round((correctCount / questionCount) * 100)
            : percent;
    const accuracyPercent = Math.max(0, Math.min(100, accuracy));

    const levels = Array.isArray(data.levels) ? data.levels : [];
    const timePerQuestion = data.timePerQuestion ?? 0;

    const statCards = [
        { key: "questions", value: `${questionCount}`, valueColor: "#000000" },
        { key: "correct", value: `${correctCount}`, valueColor: "#00A887" },
        { key: "incorrect", value: `${Math.max(0, questionCount - correctCount)}`, valueColor: "#F25C05" },
        { key: "time", value: `${timePerQuestion}s`, valueColor: "#00C4EE" },
    ] as const;

    return (
        <div
            style={{
                width: QUIZ_RESULT_IMAGE_WIDTH,
                height: QUIZ_RESULT_IMAGE_HEIGHT,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                padding: "40px 64px",
                color: "#000000",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 100,
                    right: 64,
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: AVATAR_SIZE,
                    overflow: "hidden",
                    border: "3px solid rgba(248, 250, 249, 0.35)",
                    backgroundColor: "rgba(0, 196, 238, 0.25)",
                }}
            >
                {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={avatarUrl}
                        alt=""
                        width={AVATAR_SIZE}
                        height={AVATAR_SIZE}
                        style={{
                            width: AVATAR_SIZE,
                            height: AVATAR_SIZE,
                            borderRadius: AVATAR_SIZE,
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#000000" }}>
                        {avatarInitial}
                    </div>
                )}
            </div>

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
                    <div style={{ fontSize: 18, color: "#000000", fontWeight: 500 }}>
                        {title}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#000000" }}>
                        {quizTypeLabel}
                    </div>
                </div>

                <div style={{ fontSize: 110, lineHeight: 1, fontWeight: 900, color: tone.color }}>
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
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: stat.valueColor,
                                    paddingTop: 10,
                                }}
                            >
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

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
                            width: "100%",
                            height: 10,
                            display: "flex",
                            borderRadius: 999,
                            backgroundColor: "rgba(248, 250, 249, 0.3)",
                        }}
                    >
                        <div
                            style={{
                                width: `${accuracyPercent}%`,
                                height: "100%",
                                borderRadius: 999,
                                backgroundColor: tone.color,
                                marginTop: 75,
                            }}
                        />
                    </div>
                </div>

                {levels.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 10,
                            marginTop: 4,
                        }}
                    >
                        {levels.map((level) => (
                            <div
                                key={level}
                                style={{ fontSize: 13, fontWeight: 700, color: "#00C4EE" }}
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
                    justifyContent: "flex-end",
                    width: "100%",
                    position: "relative",
                }}
            >
                <div style={{ fontSize: 14, color: "#000000", fontWeight: 500 }}>{date}</div>
            </div>
        </div>
    );
}
