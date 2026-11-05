export type RoutineActivityKey =
  | "words"
  | "quizQuestions"
  | "grammarRules"
  | "dailyPractice";

export interface RoutineItemTarget {
  enabled: boolean;
  target: number;
}

export type RoutineTargets = Record<RoutineActivityKey, RoutineItemTarget>;

export interface DailyRoutineItem {
  key: RoutineActivityKey;
  labelEn: string;
  labelBn: string;
  unitEn: string;
  unitBn: string;
  href: string;
  enabled: boolean;
  target: number;
  progress: number;
  completed: boolean;
}

export interface DailyRoutineHistoryEntry {
  date: string;
  count: number;
}

export interface DailyRoutineSummary {
  completedItems: number;
  totalItems: number;
  percent: number;
  allCompleted: boolean;
}

export interface DailyRoutinePayload {
  date: string;
  timezone: string;
  targets: RoutineTargets;
  items: DailyRoutineItem[];
  summary: DailyRoutineSummary;
  streak: number;
  history: DailyRoutineHistoryEntry[];
  isDefault: boolean;
}

export interface DailyRoutineResult {
  data: DailyRoutinePayload | null;
  message: string;
  success: boolean;
}

export interface RoutineActivityMeta {
  key: RoutineActivityKey;
  labelEn: string;
  labelBn: string;
  unitEn: string;
  unitBn: string;
  href: string;
}

export const ROUTINE_ACTIVITY_KEYS: RoutineActivityKey[] = [
  "words",
  "quizQuestions",
  "grammarRules",
  "dailyPractice",
];

export const DEFAULT_ROUTINE_TARGETS: RoutineTargets = {
  words: { enabled: true, target: 10 },
  quizQuestions: { enabled: true, target: 20 },
  grammarRules: { enabled: true, target: 1 },
  dailyPractice: { enabled: true, target: 1 },
};

export const ROUTINE_TARGET_LIMITS: Record<
  RoutineActivityKey,
  { min: number; max: number }
> = {
  words: { min: 1, max: 500 },
  quizQuestions: { min: 1, max: 500 },
  grammarRules: { min: 1, max: 50 },
  dailyPractice: { min: 1, max: 1 },
};

export const ROUTINE_ACTIVITY_META: Record<
  RoutineActivityKey,
  RoutineActivityMeta
> = {
  words: {
    key: "words",
    labelEn: "Words learned",
    labelBn: "শব্দ শেখা",
    unitEn: "words",
    unitBn: "শব্দ",
    href: "/vocabulary",
  },
  quizQuestions: {
    key: "quizQuestions",
    labelEn: "Quiz questions",
    labelBn: "কুইজ প্রশ্ন",
    unitEn: "questions",
    unitBn: "প্রশ্ন",
    href: "/quiz",
  },
  grammarRules: {
    key: "grammarRules",
    labelEn: "Grammar rules",
    labelBn: "ব্যাকরণ নিয়ম",
    unitEn: "rules",
    unitBn: "নিয়ম",
    href: "/grammar",
  },
  dailyPractice: {
    key: "dailyPractice",
    labelEn: "Daily practice",
    labelBn: "দৈনিক অনুশীলন",
    unitEn: "session",
    unitBn: "সেশন",
    href: "/quiz/daily",
  },
};

function clampTarget(key: RoutineActivityKey, value: unknown): number {
  const limits = ROUTINE_TARGET_LIMITS[key];
  const fallback = DEFAULT_ROUTINE_TARGETS[key].target;
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(limits.max, Math.max(limits.min, Math.round(parsed)));
}

/**
 * Normalizes whatever is stored in the JSON column into a complete, safe
 * target configuration. Missing or malformed keys fall back to defaults.
 */
export function normalizeRoutineTargets(raw: unknown): RoutineTargets {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const result = {} as RoutineTargets;
  for (const key of ROUTINE_ACTIVITY_KEYS) {
    const item = source[key];
    const itemRecord =
      item && typeof item === "object" && !Array.isArray(item)
        ? (item as Record<string, unknown>)
        : {};
    const fallback = DEFAULT_ROUTINE_TARGETS[key];
    result[key] = {
      enabled:
        typeof itemRecord.enabled === "boolean"
          ? itemRecord.enabled
          : fallback.enabled,
      target: clampTarget(key, itemRecord.target),
    };
  }
  return result;
}

/** Human-readable unit label, e.g. "12 / 20 questions". */
export function routineUnitLabel(
  key: RoutineActivityKey,
  count: number,
  lang: "en" | "bn"
): string {
  const meta = ROUTINE_ACTIVITY_META[key];
  if (key === "dailyPractice") {
    return lang === "bn" ? "সেশন" : count === 1 ? "session" : "sessions";
  }
  return lang === "bn" ? meta.unitBn : meta.unitEn;
}
