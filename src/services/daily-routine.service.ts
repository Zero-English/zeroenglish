import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import { Prisma } from "@/generated/prisma/client";
import { DAILY_PRACTICE_TITLE } from "@/services/daily-practice.service";
import {
  normalizeRoutineTargets,
  ROUTINE_ACTIVITY_KEYS,
  ROUTINE_ACTIVITY_META,
  type DailyRoutineHistoryEntry,
  type DailyRoutineItem,
  type DailyRoutineResult,
  type DailyRoutineSummary,
  type RoutineActivityKey,
  type RoutineTargets,
} from "@/lib/daily-routine";

const HISTORY_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TIMEZONE = "Asia/Dhaka";

const dateKeyFormatters = new Map<string, Intl.DateTimeFormat>();

function getDateKeyFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = dateKeyFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dateKeyFormatters.set(timeZone, formatter);
  }
  return formatter;
}

export function resolveRoutineTimeZone(timeZone?: string | null): string {
  if (timeZone) {
    try {
      getDateKeyFormatter(timeZone);
      return timeZone;
    } catch {
      // Invalid IANA timezone: fall through to the default.
    }
  }
  return DEFAULT_TIMEZONE;
}

function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = getDateKeyFormatter(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function isValidDateKey(value?: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function historyKeysEndingAt(anchorKey: string, days: number): string[] {
  const [year, month, day] = anchorKey.split("-").map(Number);
  const anchorUtc = Date.UTC(year, month - 1, day);
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    keys.push(new Date(anchorUtc - i * DAY_MS).toISOString().slice(0, 10));
  }
  return keys;
}

type DayCounts = Record<RoutineActivityKey, number>;

function emptyDayCounts(): DayCounts {
  return { words: 0, quizQuestions: 0, grammarRules: 0, dailyPractice: 0 };
}

function buildItems(
  targets: RoutineTargets,
  todayCounts: DayCounts
): DailyRoutineItem[] {
  return ROUTINE_ACTIVITY_KEYS.map((key) => {
    const meta = ROUTINE_ACTIVITY_META[key];
    const config = targets[key];
    const progress = todayCounts[key] ?? 0;
    return {
      key,
      labelEn: meta.labelEn,
      labelBn: meta.labelBn,
      unitEn: meta.unitEn,
      unitBn: meta.unitBn,
      href: meta.href,
      enabled: config.enabled,
      target: config.target,
      progress,
      completed: config.enabled && progress >= config.target,
    };
  });
}

function buildSummary(items: DailyRoutineItem[]): DailyRoutineSummary {
  const enabledItems = items.filter((item) => item.enabled);
  const completedItems = enabledItems.filter((item) => item.completed).length;
  const totalItems = enabledItems.length;
  return {
    completedItems,
    totalItems,
    percent:
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    allCompleted: totalItems > 0 && completedItems === totalItems,
  };
}

function isDayComplete(
  counts: DayCounts | undefined,
  targets: RoutineTargets
): boolean {
  if (!counts) return false;
  return ROUTINE_ACTIVITY_KEYS.some(
    (key) => targets[key].enabled && (counts[key] ?? 0) >= targets[key].target
  );
}

function calculateRoutineStreak(
  historyKeys: string[],
  dayMap: Map<string, DayCounts>,
  targets: RoutineTargets
): number {
  const hasEnabledItems = ROUTINE_ACTIVITY_KEYS.some(
    (key) => targets[key].enabled
  );
  if (!hasEnabledItems || historyKeys.length === 0) return 0;

  const todayKey = historyKeys[historyKeys.length - 1];
  const yesterdayKey = historyKeys[historyKeys.length - 2];
  const todayComplete = isDayComplete(dayMap.get(todayKey), targets);

  let startIndex = -1;
  if (todayComplete) startIndex = historyKeys.length - 1;
  else if (
    yesterdayKey &&
    isDayComplete(dayMap.get(yesterdayKey), targets)
  ) {
    startIndex = historyKeys.length - 2;
  }
  if (startIndex < 0) return 0;

  let streak = 0;
  for (let i = startIndex; i >= 0; i--) {
    if (!isDayComplete(dayMap.get(historyKeys[i]), targets)) break;
    streak += 1;
  }
  return streak;
}

/**
 * Returns the user's stored routine configuration together with today's
 * progress, a 365-day history and the current streak. Progress is always
 * derived from the existing activity tables, never duplicated.
 */
export async function getUserDailyRoutine(
  userId: number,
  options: { timezone?: string | null; date?: string | null } = {}
): Promise<DailyRoutineResult> {
  try {
    const routine = await prisma.userDailyRoutine.findUnique({
      where: { userId },
    });

    const timezone = resolveRoutineTimeZone(
      options.timezone ?? routine?.timezone
    );
    const targets = normalizeRoutineTargets(routine?.targets);
    const serverTodayKey = dateKeyInTimeZone(new Date(), timezone);
    const anchorKey = isValidDateKey(options.date)
      ? options.date
      : serverTodayKey;

    const historyKeys = historyKeysEndingAt(anchorKey, HISTORY_DAYS);
    const [year, month, day] = historyKeys[0].split("-").map(Number);
    // One extra day of slack so local-day bucketing cannot miss a row.
    const cutoff = new Date(Date.UTC(year, month - 1, day) - DAY_MS);

    const [wordRows, examRows, grammarRows] = await Promise.all([
      prisma.userWord.findMany({
        where: {
          userId,
          learningStatus: "LEARNED",
          updatedAt: { gte: cutoff },
        },
        select: { updatedAt: true },
      }),
      prisma.combinedExamResult.findMany({
        where: {
          userId,
          createdAt: { gte: cutoff },
          status: { in: ["SUBMITTED", "LATE_SUBMITTED"] },
        },
        select: { createdAt: true, questionCount: true, title: true },
      }),
      prisma.userGrammarProgress.findMany({
        where: {
          userId,
          isCompleted: true,
          completedAt: { gte: cutoff },
        },
        select: { completedAt: true },
      }),
    ]);

    const dayMap = new Map<string, DayCounts>();
    const countsFor = (dateKey: string): DayCounts => {
      let counts = dayMap.get(dateKey);
      if (!counts) {
        counts = emptyDayCounts();
        dayMap.set(dateKey, counts);
      }
      return counts;
    };

    for (const row of wordRows) {
      countsFor(dateKeyInTimeZone(row.updatedAt, timezone)).words += 1;
    }

    for (const row of examRows) {
      const counts = countsFor(dateKeyInTimeZone(row.createdAt, timezone));
      if (row.title === DAILY_PRACTICE_TITLE) {
        counts.dailyPractice += 1;
      } else {
        counts.quizQuestions += row.questionCount;
      }
    }

    for (const row of grammarRows) {
      if (!row.completedAt) continue;
      countsFor(dateKeyInTimeZone(row.completedAt, timezone)).grammarRules += 1;
    }

    const todayCounts = dayMap.get(anchorKey) ?? emptyDayCounts();
    const items = buildItems(targets, todayCounts);
    const summary = buildSummary(items);

    const history: DailyRoutineHistoryEntry[] = historyKeys.map((date) => {
      const counts = dayMap.get(date);
      if (!counts) return { date, count: 0 };
      const count = ROUTINE_ACTIVITY_KEYS.reduce((total, key) => {
        const config = targets[key];
        if (!config.enabled) return total;
        return total + ((counts[key] ?? 0) >= config.target ? 1 : 0);
      }, 0);
      return { date, count };
    });

    const streak = calculateRoutineStreak(historyKeys, dayMap, targets);

    return {
      data: {
        date: anchorKey,
        timezone,
        targets,
        items,
        summary,
        streak,
        history,
        isDefault: !routine,
      },
      message: "Daily routine fetched successfully",
      success: true,
    };
  } catch (error) {
    logger.error(`Failed to fetch daily routine for user ${userId}: ${error}`);
    return {
      data: null,
      message: "Failed to fetch daily routine",
      success: false,
    };
  }
}

export async function updateUserDailyRoutine(
  userId: number,
  input: { timezone?: string; targets: RoutineTargets }
): Promise<DailyRoutineResult> {
  try {
    const timezone = resolveRoutineTimeZone(input.timezone);
    const targets = normalizeRoutineTargets(input.targets);

    await prisma.userDailyRoutine.upsert({
      where: { userId },
      create: {
        userId,
        version: 1,
        timezone,
        targets: targets as unknown as Prisma.InputJsonValue,
      },
      update: {
        timezone,
        targets: targets as unknown as Prisma.InputJsonValue,
      },
    });

    return getUserDailyRoutine(userId, { timezone });
  } catch (error) {
    logger.error(`Failed to update daily routine for user ${userId}: ${error}`);
    return {
      data: null,
      message: "Failed to update daily routine",
      success: false,
    };
  }
}
